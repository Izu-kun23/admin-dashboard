# Client Dashboard Implementation Guide

## Overview

The client dashboard (`/my-project`) allows clients to view their project progress, phases, and checklist items. Clients can update their checklist items, and all changes sync in real-time with the admin dashboard.

## Architecture

### Data Flow

```
Client Dashboard → API → Supabase (projects.phases_state JSONB)
                              ↓
                    Real-time Subscription
                              ↓
                    Admin Dashboard (instant update)
```

### Key Principles

1. **Structure is Hardcoded**: Phase titles, checklist labels are defined in `lib/phase-structure.ts`
2. **State is Stored**: Only status and checklist completion in `projects.phases_state` JSONB
3. **Real-Time Sync**: Supabase Realtime updates both dashboards instantly
4. **Client Permissions**: Clients can only update checklist items, not phase status

## Client Capabilities

### ✅ What Clients CAN Do

1. **View Project Overview**
   - Current day of 14-day cycle
   - Next actions (from us / from you)
   - Onboarding progress percentage
   - Kit type (LAUNCH or GROWTH)

2. **View All Phases**
   - Phase titles, subtitles, day ranges
   - Phase status (read-only)
   - Checklist items with completion status
   - Progress indicators

3. **Update Checklist Items**
   - Check/uncheck checklist items
   - Changes sync instantly to admin dashboard
   - Real-time updates when admin makes changes

### ❌ What Clients CANNOT Do

1. **Update Phase Status** (Admin only)
   - Cannot change phase status (NOT_STARTED, IN_PROGRESS, etc.)
   - Cannot set started_at or completed_at timestamps

2. **Update Project Progress** (Admin only)
   - Cannot change current_day_of_14
   - Cannot update next_from_us or next_from_you

3. **Modify Phase Structure** (Hardcoded)
   - Cannot add/remove checklist items
   - Cannot change phase titles or day ranges

## API Endpoints

### GET `/api/my-project/phases-state`

Fetches the authenticated user's project with merged phases structure and state.

**Authentication**: Required (user must be logged in)

**Response**:
```json
{
  "project": {
    "id": "uuid",
    "user_id": "uuid",
    "kit_type": "LAUNCH",
    "current_day_of_14": 5,
    "next_from_us": "We're working on your homepage copy",
    "next_from_you": "Please review the draft",
    "onboarding_finished": true,
    "onboarding_percent": 100,
    "phases_state": {
      "PHASE_1": {
        "status": "IN_PROGRESS",
        "started_at": "2024-01-01T00:00:00Z",
        "checklist": {
          "Onboarding steps completed": true,
          "Brand / strategy call completed": true,
          "Simple 14 day plan agreed": false
        }
      }
    },
    "phases": [
      {
        "phase_id": "PHASE_1",
        "phase_number": 1,
        "title": "Inputs & clarity",
        "subtitle": "Lock the message and plan.",
        "day_range": "Days 0-2",
        "status": "IN_PROGRESS",
        "started_at": "2024-01-01T00:00:00Z",
        "completed_at": null,
        "checklist": [
          { "label": "Onboarding steps completed", "is_done": true },
          { "label": "Brand / strategy call completed", "is_done": true },
          { "label": "Simple 14 day plan agreed", "is_done": false }
        ]
      }
    ]
  }
}
```

### PATCH `/api/my-project/phases-state`

Updates a checklist item for the authenticated user's project.

**Authentication**: Required (user must be logged in)

**Request Body**:
```json
{
  "phase_id": "PHASE_1",
  "checklist_label": "Onboarding steps completed",
  "is_done": true
}
```

**Response**:
```json
{
  "project": {
    "id": "uuid",
    "phases_state": { ... }
  },
  "message": "Checklist item updated successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Project not found
- `400 Bad Request`: Invalid request (missing phase_id, checklist_label, or is_done)

## Frontend Implementation

### Component Structure

```
MyProjectPage
├── Project Overview Card
│   ├── Kit Type Badge
│   ├── Current Day Indicator
│   ├── Onboarding Progress
│   ├── Next from Us
│   └── Next from You
├── Current Phase Card
│   ├── Phase Status Icon
│   ├── Phase Title & Subtitle
│   ├── Checklist Items (interactive)
│   └── Phase Links (if any)
└── All Phases Overview
    └── Phase Cards (read-only status)
```

### Key Components

#### 1. Project Overview

Displays high-level project information:
- Kit type (LAUNCH/GROWTH)
- Current day of 14-day cycle
- Onboarding completion percentage
- Next actions from admin and client

#### 2. Current Phase Card

Shows the active phase (IN_PROGRESS or WAITING_ON_CLIENT):
- Phase number, title, subtitle
- Day range
- Status badge
- **Interactive checklist items** (clients can check/uncheck)
- Phase links (if any)

#### 3. All Phases Overview

Grid view of all phases:
- Phase status icons
- Completion indicators
- Read-only view (clients cannot change status)

### Real-Time Subscription

```typescript
useEffect(() => {
  if (!project) return

  const supabase = createClient()
  
  const channel = supabase
    .channel('project-phases-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'projects',
      filter: `id=eq.${project.id}`
    }, (payload) => {
      // Update project with new phases_state
      const updatedProject = payload.new as any
      const structure = getPhaseStructureForKitType(updatedProject.kit_type)
      const phases = mergePhaseStructureWithState(structure, updatedProject.phases_state || null)
      
      setProject(prev => ({
        ...prev,
        ...updatedProject,
        phases,
      }))
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [project])
```

### Checklist Update Function

```typescript
const updateChecklistItem = async (
  phaseId: string,
  checklistLabel: string,
  isDone: boolean
) => {
  try {
    setUpdating(`${phaseId}-${checklistLabel}`)
    
    // Optimistic update
    setProject(prev => {
      if (!prev) return null
      return {
        ...prev,
        phases: prev.phases.map(phase => {
          if (phase.phase_id === phaseId) {
            return {
              ...phase,
              checklist: phase.checklist.map(item =>
                item.label === checklistLabel
                  ? { ...item, is_done: isDone }
                  : item
              )
            }
          }
          return phase
        })
      }
    })

    // Update via API
    const response = await fetch('/api/my-project/phases-state', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        phase_id: phaseId,
        checklist_label: checklistLabel,
        is_done: isDone,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update checklist item')
    }

    // Real-time subscription will handle the update automatically
  } catch (err) {
    // Revert optimistic update
    await fetchProject()
    alert('Failed to update checklist item')
  } finally {
    setUpdating(null)
  }
}
```

## UI/UX Features

### Checklist Interaction

1. **Clickable Rows**: Entire row is clickable to toggle checkbox
2. **Visual Feedback**: 
   - Completed items are struck through
   - Hover effects on rows
   - Loading spinner during updates
3. **Optimistic Updates**: UI updates immediately before server confirmation
4. **Error Handling**: Reverts to previous state on error

### Status Indicators

- **NOT_STARTED**: Gray circle icon
- **IN_PROGRESS**: Blue clock icon
- **WAITING_ON_CLIENT**: Yellow alert icon
- **DONE**: Green checkmark icon

### Progress Tracking

- Shows completion count: "X / Y tasks complete"
- Visual progress in phase cards
- Current phase highlighted

## Real-Time Sync Behavior

### When Admin Updates Checklist

1. Admin checks/unchecks item in admin dashboard
2. API updates `projects.phases_state` JSONB
3. Supabase Realtime fires `UPDATE` event
4. **Client dashboard updates instantly** ✨
5. No page refresh needed

### When Client Updates Checklist

1. Client checks/unchecks item in client dashboard
2. API updates `projects.phases_state` JSONB
3. Supabase Realtime fires `UPDATE` event
4. **Admin dashboard updates instantly** ✨
5. Both dashboards stay in sync

### When Admin Updates Phase Status

1. Admin changes phase status
2. API updates `projects.phases_state` JSONB
3. Supabase Realtime fires `UPDATE` event
4. **Client dashboard reflects new status** ✨
5. Client sees updated phase status immediately

## Data Structure

### phases_state JSONB Format

```json
{
  "PHASE_1": {
    "status": "IN_PROGRESS",
    "started_at": "2024-01-01T00:00:00Z",
    "completed_at": null,
    "checklist": {
      "Onboarding steps completed": true,
      "Brand / strategy call completed": true,
      "Simple 14 day plan agreed": false
    }
  },
  "PHASE_2": {
    "status": "NOT_STARTED",
    "checklist": {
      "Draft homepage copy ready": false,
      "Draft offer / services page ready": false
    }
  }
}
```

### Merged Phase Structure

The frontend merges hardcoded structure with database state:

```typescript
interface MergedPhase {
  phase_id: string              // From structure
  phase_number: number           // From structure
  title: string                  // From structure
  subtitle: string | null        // From structure
  day_range: string              // From structure
  status: PhaseStatus            // From state
  started_at: string | null      // From state
  completed_at: string | null   // From state
  checklist: Array<{             // Merged: labels from structure, is_done from state
    label: string
    is_done: boolean
  }>
}
```

## Security & Permissions

### Row Level Security (RLS)

Clients can only:
- Read their own project
- Update their own project's `phases_state` JSONB
- Cannot modify phase status (enforced in API)
- Cannot modify project-level fields (enforced in API)

### API Validation

The PATCH endpoint validates:
1. User is authenticated
2. Project belongs to the user
3. Only `checklist_label` and `is_done` can be updated
4. `phase_id` must be valid

## Error Handling

### Network Errors
- Shows error message to user
- Reverts optimistic update
- Allows retry

### Validation Errors
- Returns 400 with error message
- Prevents invalid updates
- Shows user-friendly error

### Authentication Errors
- Redirects to login
- Clears invalid session
- Protects user data

## Best Practices

### 1. Optimistic Updates
Always update UI immediately, then sync with server:
```typescript
// Update UI first
setProject(updatedProject)

// Then sync with server
await fetch('/api/my-project/phases-state', { ... })
```

### 2. Real-Time Subscriptions
- Clean up subscriptions on unmount
- Handle connection errors gracefully
- Show connection status if needed

### 3. Loading States
- Show spinner during updates
- Disable inputs while updating
- Provide visual feedback

### 4. Error Recovery
- Revert optimistic updates on error
- Show clear error messages
- Allow manual retry

## Testing Checklist

- [ ] Client can view their project
- [ ] Client can see all phases
- [ ] Client can check/uncheck checklist items
- [ ] Changes sync to admin dashboard in real-time
- [ ] Admin changes sync to client dashboard in real-time
- [ ] Client cannot update phase status
- [ ] Client cannot update project progress fields
- [ ] Real-time subscription works correctly
- [ ] Error handling works for network failures
- [ ] Optimistic updates work correctly
- [ ] Loading states display properly

## Troubleshooting

### Real-time not working?
1. Check if realtime is enabled: `ALTER PUBLICATION supabase_realtime ADD TABLE projects;`
2. Verify WebSocket connection in browser DevTools
3. Check Supabase project realtime settings
4. Verify RLS policies allow updates

### Checklist not updating?
1. Check API response in Network tab
2. Verify `phases_state` JSONB structure
3. Check browser console for errors
4. Verify real-time subscription is active

### Phase status not updating?
- This is expected - clients cannot update phase status
- Only admins can change phase status
- Client dashboard shows status as read-only

## Summary

The client dashboard provides a clean, intuitive interface for clients to:
- View their project progress
- Track phase completion
- Update their checklist items
- See real-time updates from admin

All changes sync instantly between admin and client dashboards, providing a seamless collaborative experience.

