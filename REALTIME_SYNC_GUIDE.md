# Real-Time Phase & Checklist Sync Guide

## Overview

The system now supports **real-time synchronization** between admin and client dashboards. When an admin updates a checklist item or phase status, clients see the changes instantly without refreshing.

## How It Works

### 1. Database Structure
- Phase structure (titles, checklist labels) is **hardcoded** in `lib/phase-structure.ts`
- Phase state (status, checklist completion) is stored in `projects.phases_state` JSONB column
- Single source of truth: `projects` table

### 2. Real-Time Subscriptions

#### Admin Dashboard (`app/projects-v2/page.tsx`)
```typescript
const channel = supabase
  .channel('projects-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'projects',
  }, (payload) => {
    // Update local state when project changes
    setProjects(prev => prev.map(project => {
      if (project.id === payload.new.id) {
        const phases = mergePhaseStructureWithState(structure, payload.new.phases_state)
        return { ...project, phases }
      }
      return project
    }))
  })
  .subscribe()
```

#### Client Dashboard (`app/my-project/page.tsx`)
```typescript
const channel = supabase
  .channel('project-phases-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'projects',
    filter: `id=eq.${project.id}`
  }, (payload) => {
    // Update project with new phases_state
    const phases = mergePhaseStructureWithState(structure, payload.new.phases_state)
    setProject({ ...project, phases })
  })
  .subscribe()
```

### 3. Update Flow

#### Admin Updates Checklist Item
1. Admin checks/unchecks a checkbox in the phase dialog
2. Frontend calls: `PATCH /api/projects/[project_id]/phases-state`
3. API updates `projects.phases_state` JSONB
4. Supabase Realtime fires `UPDATE` event
5. **Both admin and client dashboards update instantly**

#### Admin Updates Phase Status
1. Admin changes phase status dropdown
2. Frontend calls: `PATCH /api/projects/[project_id]/phases-state`
3. API updates `projects.phases_state` JSONB (with auto-timestamps)
4. Supabase Realtime fires `UPDATE` event
5. **Both dashboards update instantly**

#### Client Updates Checklist Item
1. Client checks/unchecks a checkbox
2. Frontend calls: `PATCH /api/my-project/phases-state`
3. API updates `projects.phases_state` JSONB
4. Supabase Realtime fires `UPDATE` event
5. **Both dashboards update instantly**

## Checklist Display

### Admin Dashboard
- **Phase Dialog**: Shows all checklist items for selected phase
- **Progress Dialog**: Shows all phases with their checklist items
- **Real-time**: Updates immediately when checklist items change

### Client Dashboard
- **Current Phase**: Shows checklist items for active phase
- **All Phases**: Overview cards showing completion status
- **Real-time**: Updates immediately when admin changes checklist

## Key Features

✅ **Instant Updates**: No page refresh needed
✅ **Bidirectional**: Both admin and client can update
✅ **Optimistic UI**: Immediate feedback before server confirmation
✅ **Automatic Merge**: Structure + state merged in frontend
✅ **Single Source**: All state in `projects.phases_state` JSONB

## Database Setup

Make sure realtime is enabled for the `projects` table:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
```

## Testing Real-Time Sync

1. Open admin dashboard at `/projects-v2`
2. Open client dashboard at `/my-project` (in another tab/browser)
3. In admin dashboard, check/uncheck a checklist item
4. **Client dashboard should update instantly** ✨
5. Change phase status in admin dashboard
6. **Client dashboard should reflect new status** ✨

## Troubleshooting

### Real-time not working?
1. Check if realtime is enabled: `ALTER PUBLICATION supabase_realtime ADD TABLE projects;`
2. Check browser console for subscription errors
3. Verify Supabase project has realtime enabled
4. Check network tab for WebSocket connections

### Checklist not updating?
1. Verify API endpoint is returning updated `phases_state`
2. Check browser console for merge errors
3. Ensure `mergePhaseStructureWithState` is called correctly
4. Verify real-time subscription is active

