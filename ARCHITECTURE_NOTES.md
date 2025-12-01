# Real-Time Phase & Checklist Architecture

## Overview

This architecture separates **structure** (hardcoded in frontend) from **state** (stored in Supabase as JSONB).

## Key Principles

1. **Structure is Hardcoded**: Phase titles, checklist labels, day ranges are defined in `lib/phase-structure.ts`
2. **State is Stored**: Only status and checklist completion are stored in `projects.phases_state` JSONB column
3. **Real-Time Sync**: Supabase Realtime subscriptions update UI instantly when admin makes changes
4. **Frontend Merges**: UI merges structure + state to display complete phase information

## Database Schema

### Projects Table
```sql
ALTER TABLE projects 
ADD COLUMN phases_state JSONB DEFAULT NULL;

CREATE INDEX idx_projects_phases_state ON projects USING GIN (phases_state);
```

### phases_state Structure
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

## API Endpoints

### GET `/api/projects/[project_id]/phases-state`
- Fetches project with `phases_state`
- Merges structure + state
- Returns merged phases

### PATCH `/api/projects/[project_id]/phases-state`
- Updates phase status: `{ phase_id: "PHASE_1", status: "IN_PROGRESS" }`
- Updates checklist: `{ phase_id: "PHASE_1", checklist_label: "Onboarding steps completed", is_done: true }`
- Auto-timestamps when status changes

## Frontend Implementation

### 1. Hardcoded Structure (`lib/phase-structure.ts`)
```typescript
export const LAUNCH_KIT_STRUCTURE: PhaseStructure[] = [
  {
    phase_id: 'PHASE_1',
    phase_number: 1,
    title: 'Inputs & clarity',
    subtitle: 'Lock the message and plan.',
    day_range: 'Days 0-2',
    checklist_labels: [
      'Onboarding steps completed',
      'Brand / strategy call completed',
      'Simple 14 day plan agreed',
    ],
  },
  // ... more phases
]
```

### 2. Merge Function
```typescript
mergePhaseStructureWithState(structure, state)
// Returns: Array of phases with structure + state combined
```

### 3. Real-Time Subscription
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

## Benefits

1. **No Duplication**: Structure defined once in code
2. **Simple Updates**: Single JSONB update for all phase changes
3. **Real-Time**: Instant sync between admin and client
4. **Clean Separation**: Structure vs state clearly separated
5. **Easy to Edit**: Admin updates JSONB, client sees changes instantly

## Migration Path

1. Run `MIGRATION_ADD_PHASES_STATE.sql` to add column
2. Use new API endpoints (`/phases-state` instead of `/phases`)
3. Update frontend to use `mergePhaseStructureWithState`
4. Enable realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE projects;`

## Example Usage

### Admin Updates Checklist
```typescript
await fetch(`/api/projects/${projectId}/phases-state`, {
  method: 'PATCH',
  body: JSON.stringify({
    phase_id: 'PHASE_1',
    checklist_label: 'Onboarding steps completed',
    is_done: true
  })
})
```

### Client Sees Update Instantly
- Real-time subscription fires
- Frontend merges new state with structure
- UI updates automatically

