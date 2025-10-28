/**
 * Script to create the initial admin user
 * Run with: SUPABASE_URL=your_url SUPABASE_SERVICE_KEY=your_service_key node scripts/create-admin.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

async function createAdminUser() {
  const email = 'izuchukwuonuoha6@gmail.com';
  const password = '12345678';
  const name = 'Izuchukwu Tony';
  const role = 'admin';

  try {
    // Create user in auth
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name
        }
      })
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      if (authData.message?.includes('already registered')) {
        console.log('User already exists, updating admin record...');
        
        // Get existing user
        const getUserResponse = await fetch(
          `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            }
          }
        );

        const users = await getUserResponse.json();
        const user = users.users[0];

        if (!user) {
          throw new Error('Could not find existing user');
        }

        authData.user = user;
      } else {
        throw new Error(authData.message || 'Failed to create user');
      }
    }

    console.log('User created/found:', authData.user.id);

    // Insert into admins table
    const adminResponse = await fetch(`${SUPABASE_URL}/rest/v1/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: authData.user.id,
        email,
        name,
        password,
        role
      })
    });

    const adminData = await adminResponse.json();

    if (!adminResponse.ok && !adminData.message?.includes('duplicate')) {
      throw new Error(adminData.message || 'Failed to create admin record');
    }

    console.log('Admin created successfully!');
    console.log({
      id: authData.user.id,
      email,
      name,
      role,
      password: '12345678'
    });

  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdminUser();
