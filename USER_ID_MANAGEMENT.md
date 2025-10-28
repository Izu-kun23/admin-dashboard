# User ID Management

This application now includes comprehensive user ID fetching and management throughout the app.

## Features

### ✅ User Data Fetching
- **Automatic user detection** from Supabase auth
- **Admin table lookup** for additional user data (name, email, user_id)
- **Fallback handling** when admin data is not found
- **Comprehensive logging** for debugging

### ✅ Custom Hook: `useCurrentUser`
A reusable hook that provides user data and utilities throughout the app.

**Location:** `hooks/useCurrentUser.ts`

**Usage:**
```typescript
import { useCurrentUser } from '@/hooks/useCurrentUser'

function MyComponent() {
  const { user, getCurrentUserId, isAuthenticated, loading } = useCurrentUser()
  
  // Get current user ID
  const userId = getCurrentUserId()
  
  // Check if user is authenticated
  if (isAuthenticated()) {
    console.log('User is logged in:', user)
  }
  
  return <div>User ID: {userId}</div>
}
```

**Returns:**
- `user`: User object with name, email, and id
- `getCurrentUserId()`: Function to get current user ID
- `isAuthenticated()`: Function to check authentication status
- `loading`: Boolean indicating if user data is being fetched

### ✅ User ID Tracking
The app now tracks user IDs for:
- **Admin creation** - `created_by` field
- **Item creation** - `created_by` field  
- **Item updates** - `updated_by` field

### ✅ Console Logging
Comprehensive logging shows:
- User data fetching process
- Admin table lookups
- User ID availability
- Creation/update operations with user IDs

## Implementation Details

### Dashboard Page (`app/dashboard/page.tsx`)
- Uses `useCurrentUser` hook
- Logs user ID when available
- Tracks user ID in admin and item operations

### Settings Page (`app/settings/page.tsx`)
- Example implementation of the hook
- Auto-populates user data in forms
- Logs user ID for save operations

### Header Component (`components/header.tsx`)
- Displays logged-in user's name and email
- Shows user's initial in avatar
- Receives user data as props

## Console Output Examples

When a user logs in, you'll see:
```
🔍 [useCurrentUser] Fetching current user data...
✅ [useCurrentUser] Auth user found: { id: "uuid", email: "user@example.com" }
✅ [useCurrentUser] Admin user data fetched from admins table: { name: "John Doe", email: "john@example.com", userId: "uuid" }
🎯 [Dashboard] User ID is now available: uuid
🎯 [Dashboard] Current user data: { name: "John Doe", email: "john@example.com", id: "uuid" }
```

When creating items/admins:
```
🔨 Creating admin with data: { name: "New Admin", email: "new@example.com" }
🔨 Current user ID: uuid
```

## Database Schema Requirements

For full functionality, ensure your database has:

### `admins` table:
- `user_id` (string) - Links to Supabase auth user
- `name` (string) - Admin display name
- `email` (string) - Admin email
- `created_by` (string, optional) - ID of user who created this admin

### `items` table:
- `created_by` (string, optional) - ID of user who created this item
- `updated_by` (string, optional) - ID of user who last updated this item

## Usage in Other Components

To use user ID in any component:

1. Import the hook:
```typescript
import { useCurrentUser } from '@/hooks/useCurrentUser'
```

2. Use in component:
```typescript
const { getCurrentUserId, isAuthenticated } = useCurrentUser()

// Get user ID for API calls
const userId = getCurrentUserId()

// Check authentication
if (isAuthenticated()) {
  // User is logged in
}
```

This ensures consistent user ID management across the entire application.
