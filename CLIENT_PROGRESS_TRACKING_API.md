# Client Progress Tracking API Guide

## Overview

This document outlines the simplest and most efficient API structure for clients to track end-to-end progress of their projects, including phases, checklist items, and overall project status.

## Core Principle

**One API call to rule them all** - The client dashboard should fetch everything needed in a single request, then use real-time subscriptions for live updates.

---

## Primary API Endpoints

### 1. GET `/api/my-project`

**Purpose**: Fetch complete project with all phases and checklist items in a single call.

**Authentication**: Required (user must be logged in)

**Response Structure**:
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
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "phases": [
      {
        "id": "uuid",
        "phase_id": "PHASE_1",
        "phase_number": 1,
        "title": "Inputs & clarity",
        "subtitle": "Lock the message and plan.",
        "day_range": "Days 0-2",
        "status": "IN_PROGRESS",
        "started_at": "2024-01-01T00:00:00Z",
        "completed_at": null,
        "checklist_items": [
          {
            "id": "uuid",
            "label": "Onboarding steps completed",
            "sort_order": 1,
            "is_done": true
          },
          {
            "id": "uuid",
            "label": "Brand / strategy call completed",
            "sort_order": 2,
            "is_done": true
          },
          {
            "id": "uuid",
            "label": "Simple 14 day plan agreed",
            "sort_order": 3,
            "is_done": false
          }
        ],
        "phase_links": [
          {
            "id": "uuid",
            "label": "Staging Site",
            "url": "https://staging.example.com",
            "sort_order": 1
          }
        ]
      },
      {
        "id": "uuid",
        "phase_id": "PHASE_2",
        "phase_number": 2,
        "title": "Words that sell",
        "subtitle": "We write your 3 pages.",
        "day_range": "Days 3-5",
        "status": "NOT_STARTED",
        "started_at": null,
        "completed_at": null,
        "checklist_items": [
          {
            "id": "uuid",
            "label": "Draft homepage copy ready",
            "sort_order": 1,
            "is_done": false
          },
          {
            "id": "uuid",
            "label": "Draft offer / services page ready",
            "sort_order": 2,
            "is_done": false
          }
        ],
        "phase_links": []
      }
    ]
  }
}
```

**Key Features**:
- ✅ Single request gets everything
- ✅ Phases are pre-sorted by `phase_number`
- ✅ Checklist items are pre-sorted by `sort_order`
- ✅ All relationships are resolved (phases → checklist_items → phase_links)
- ✅ No additional API calls needed for initial load

**Implementation Note**: This endpoint automatically initializes phases from templates if they don't exist yet.

---

### 2. PATCH `/api/my-project/checklist/[item_id]`

**Purpose**: Update a single checklist item's completion status.

**Authentication**: Required (user must be logged in)

**Request Body**:
```json
{
  "is_done": true
}
```

**Response**:
```json
{
  "checklist_item": {
    "id": "uuid",
    "phase_id": "uuid",
    "label": "Onboarding steps completed",
    "sort_order": 1,
    "is_done": true
  },
  "message": "Checklist item updated successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Checklist item doesn't belong to user's project
- `404 Not Found`: Checklist item not found
- `400 Bad Request`: Invalid request body

**Key Features**:
- ✅ Simple single-item update
- ✅ Automatic ownership verification
- ✅ Real-time sync triggers automatically via Supabase Realtime

---

## Progress Calculation APIs

### 3. GET `/api/my-project/progress` (Optional Enhanced Endpoint)

**Purpose**: Get calculated progress metrics for easy display.

**Authentication**: Required

**Response**:
```json
{
  "overall_progress": {
    "total_phases": 4,
    "completed_phases": 1,
    "in_progress_phases": 1,
    "not_started_phases": 2,
    "phase_completion_percent": 25
  },
  "checklist_progress": {
    "total_items": 14,
    "completed_items": 5,
    "remaining_items": 9,
    "completion_percent": 35.7
  },
  "current_phase": {
    "phase_id": "PHASE_1",
    "phase_number": 1,
    "title": "Inputs & clarity",
    "status": "IN_PROGRESS",
    "checklist_completion": {
      "completed": 2,
      "total": 3,
      "percent": 66.7
    }
  },
  "next_actions": {
    "from_us": "We're working on your homepage copy",
    "from_you": "Please review the draft"
  },
  "timeline": {
    "current_day": 5,
    "total_days": 14,
    "days_remaining": 9,
    "percent_complete": 35.7
  }
}
```

**Use Case**: If you want pre-calculated metrics instead of computing on the frontend.

**Implementation Note**: This can be computed client-side from the main `/api/my-project` response, so it's optional.

---

## Real-Time Sync API

### 4. Real-Time Subscription (WebSocket)

**Purpose**: Automatically sync changes without polling or manual refresh.

**Technology**: Supabase Realtime (PostgreSQL Changes)

**Implementation**:
```typescript
// Subscribe to project updates
const supabase = createClient()
const channel = supabase
  .channel('my-project-updates')
  .on('postgres_changes', {
    event: '*',  // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'projects',
    filter: `id=eq.${projectId}`
  }, (payload) => {
    // Project metadata changed
    refreshProject()
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'phases',
    filter: `project_id=eq.${projectId}`
  }, (payload) => {
    // Phase status changed (admin action)
    refreshProject()
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'checklist_items',
    filter: `phase_id=in.(${phaseIds.join(',')})`
  }, (payload) => {
    // Checklist item changed (admin or client)
    refreshProject()
  })
  .subscribe()
```

**Key Features**:
- ✅ Instant updates when admin makes changes
- ✅ Instant updates when client makes changes (sees own updates immediately)
- ✅ No polling needed
- ✅ Efficient WebSocket connection

---

## End-to-End Progress Tracking Flow

### Initial Load

```
1. Client opens dashboard
   ↓
2. Call GET /api/my-project
   ↓
3. Receive complete project with all phases and checklist items
   ↓
4. Display:
   - Project overview (kit type, current day, next actions)
   - All phases with status
   - All checklist items with completion status
   - Progress calculations
   ↓
5. Set up real-time subscription
```

### Client Updates Checklist

```
1. Client clicks checkbox on checklist item
   ↓
2. Optimistic UI update (immediate visual feedback)
   ↓
3. Call PATCH /api/my-project/checklist/[item_id]
   {
     "is_done": true
   }
   ↓
4. Server updates checklist_items table
   ↓
5. Real-time event fires
   ↓
6. Both client and admin dashboards update automatically
```

### Admin Updates (Visible to Client)

```
1. Admin updates phase status or checklist item
   ↓
2. Server updates database
   ↓
3. Real-time event fires
   ↓
4. Client dashboard updates automatically (no API call needed)
   ↓
5. Client sees changes instantly
```

---

## Progress Calculation Logic

### Phase-Level Progress

```typescript
function calculatePhaseProgress(phase: Phase): number {
  if (!phase.checklist_items || phase.checklist_items.length === 0) {
    return phase.status === 'DONE' ? 100 : 0
  }
  
  const completed = phase.checklist_items.filter(item => item.is_done).length
  const total = phase.checklist_items.length
  return Math.round((completed / total) * 100)
}
```

### Overall Project Progress

```typescript
function calculateOverallProgress(phases: Phase[]): number {
  let totalItems = 0
  let completedItems = 0
  
  phases.forEach(phase => {
    if (phase.checklist_items) {
      phase.checklist_items.forEach(item => {
        totalItems++
        if (item.is_done) completedItems++
      })
    }
  })
  
  if (totalItems === 0) return 0
  return Math.round((completedItems / totalItems) * 100)
}
```

### Current Phase Detection

```typescript
function getCurrentPhase(phases: Phase[]): Phase | null {
  // Find IN_PROGRESS phase
  const inProgress = phases.find(p => p.status === 'IN_PROGRESS')
  if (inProgress) return inProgress
  
  // Find WAITING_ON_CLIENT phase
  const waiting = phases.find(p => p.status === 'WAITING_ON_CLIENT')
  if (waiting) return waiting
  
  // Find last DONE phase
  const donePhases = phases.filter(p => p.status === 'DONE')
  if (donePhases.length > 0) {
    return donePhases.sort((a, b) => b.phase_number - a.phase_number)[0]
  }
  
  // Return first phase
  return phases[0] || null
}
```

---

## Recommended Frontend Implementation

### 1. Single Source of Truth

Store the complete project object in state:
```typescript
const [project, setProject] = useState<Project | null>(null)
```

### 2. Fetch on Mount

```typescript
useEffect(() => {
  fetchProject()
}, [])

async function fetchProject() {
  const response = await fetch('/api/my-project', {
    credentials: 'include'
  })
  const data = await response.json()
  setProject(data.project)
}
```

### 3. Real-Time Subscription

```typescript
useEffect(() => {
  if (!project) return
  
  const channel = setupRealtimeSubscription(project.id)
  
  return () => {
    supabase.removeChannel(channel)
  }
}, [project])
```

### 4. Update Checklist Handler

```typescript
async function updateChecklistItem(itemId: string, isDone: boolean) {
  // Optimistic update
  setProject(prev => {
    if (!prev) return null
    return {
      ...prev,
      phases: prev.phases.map(phase => ({
        ...phase,
        checklist_items: phase.checklist_items.map(item =>
          item.id === itemId ? { ...item, is_done: isDone } : item
        )
      }))
    }
  })
  
  // Server update
  await fetch(`/api/my-project/checklist/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ is_done: isDone })
  })
  
  // Real-time will handle sync automatically
}
```

---

## API Summary

| Endpoint | Method | Purpose | When to Use |
|----------|--------|---------|-------------|
| `/api/my-project` | GET | Fetch complete project | Initial load, manual refresh |
| `/api/my-project/checklist/[item_id]` | PATCH | Update checklist item | When client toggles checkbox |
| Real-time Subscription | WebSocket | Live updates | Always active while dashboard open |
| `/api/my-project/progress` | GET | Pre-calculated metrics | Optional (can compute client-side) |

---

## Key Benefits of This Approach

1. **Simple**: Only 2 main API endpoints for client
2. **Efficient**: Single request gets everything
3. **Real-Time**: Automatic sync without polling
4. **Fast**: Optimistic updates for instant feedback
5. **Scalable**: Works for any number of phases/checklist items
6. **Secure**: Automatic ownership verification
7. **Reliable**: Server is source of truth, client syncs automatically

---

## Error Handling

### Network Errors
- Show user-friendly error message
- Allow retry
- Revert optimistic updates on failure

### Authentication Errors
- Redirect to login
- Clear invalid session

### Validation Errors
- Show specific error message
- Prevent invalid state

---

## Performance Considerations

1. **Single Request**: One API call gets everything (reduces network overhead)
2. **Pre-sorted Data**: Server sorts phases and checklist items (reduces client processing)
3. **Optimistic Updates**: Immediate UI feedback (better UX)
4. **Real-Time Sync**: Only updates what changed (efficient)
5. **Caching**: Can cache project data in memory (reduce unnecessary requests)

---

## Testing Checklist

- [ ] Client can fetch complete project in one request
- [ ] All phases are returned with correct structure
- [ ] All checklist items are returned and sorted
- [ ] Client can update checklist items
- [ ] Real-time updates work when admin makes changes
- [ ] Real-time updates work when client makes changes
- [ ] Progress calculations are accurate
- [ ] Error handling works correctly
- [ ] Optimistic updates provide good UX

---

## Summary

The easiest way for clients to track end-to-end project progress is:

1. **Fetch everything once**: `GET /api/my-project` returns complete project structure
2. **Update items individually**: `PATCH /api/my-project/checklist/[item_id]` for each change
3. **Sync automatically**: Real-time subscription handles all live updates
4. **Calculate progress client-side**: Use the phase and checklist data to compute metrics

This approach minimizes API calls, provides instant feedback, and ensures both client and admin dashboards stay perfectly synchronized.
