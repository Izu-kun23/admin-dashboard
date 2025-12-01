// Dummy data for development/testing

export const DUMMY_ADMINS = [
  {
    id: '1',
    userId: 'user-1',
    email: 'izuchukwuonuoha6@gmail.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const DUMMY_ITEMS = [
  {
    id: '1',
    name: 'Sample Item 1',
    description: 'This is a sample item for testing',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sample Item 2',
    description: 'Another sample item',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
]

export const DUMMY_PHASES = [
  {
    id: 'phase-1',
    phase_id: 'PHASE_1',
    phase_number: 1,
    title: 'Inputs & clarity',
    subtitle: 'Lock the message and plan.',
    day_range: 'Days 0-2',
    status: 'IN_PROGRESS',
    started_at: new Date().toISOString(),
    completed_at: null,
    checklist_items: [
      {
        id: 'checklist-1',
        label: 'Onboarding steps completed',
        sort_order: 1,
        is_done: true,
      },
      {
        id: 'checklist-2',
        label: 'Brand / strategy call completed',
        sort_order: 2,
        is_done: true,
      },
      {
        id: 'checklist-3',
        label: 'Simple 14 day plan agreed',
        sort_order: 3,
        is_done: false,
      },
    ],
    phase_links: [],
  },
  {
    id: 'phase-2',
    phase_id: 'PHASE_2',
    phase_number: 2,
    title: 'Words that sell',
    subtitle: 'We write your 3 pages.',
    day_range: 'Days 3-5',
    status: 'NOT_STARTED',
    started_at: null,
    completed_at: null,
    checklist_items: [
      {
        id: 'checklist-4',
        label: 'Draft homepage copy ready',
        sort_order: 1,
        is_done: false,
      },
      {
        id: 'checklist-5',
        label: 'Draft offer / services page ready',
        sort_order: 2,
        is_done: false,
      },
    ],
    phase_links: [],
  },
]

export const DUMMY_PROJECT = {
  id: 'project-1',
  user_id: 'user-1',
  kit_type: 'LAUNCH',
  current_day_of_14: 5,
  next_from_us: "We're working on your homepage copy",
  next_from_you: 'Please review the draft',
  onboarding_finished: true,
  onboarding_percent: 100,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  phases: DUMMY_PHASES,
}

export const DUMMY_PROJECTS = [
  {
    ...DUMMY_PROJECT,
    email: 'client1@example.com',
  },
  {
    id: 'project-2',
    user_id: 'user-2',
    kit_type: 'GROWTH',
    current_day_of_14: 3,
    next_from_us: 'Setting up your funnel',
    next_from_you: 'Please provide content',
    onboarding_finished: false,
    onboarding_percent: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email: 'client2@example.com',
    phases: [],
  },
]

export const DUMMY_PHASE_TEMPLATES = {
  LAUNCH: [
    {
      id: 'template-1',
      phase_number: 1,
      phase_id: 'PHASE_1',
      title: 'Inputs & clarity',
      subtitle: 'Lock the message and plan.',
      day_range: 'Days 0-2',
      checklist_items: [
        { id: 't1', label: 'Onboarding steps completed', sort_order: 1 },
        { id: 't2', label: 'Brand / strategy call completed', sort_order: 2 },
        { id: 't3', label: 'Simple 14 day plan agreed', sort_order: 3 },
      ],
    },
    {
      id: 'template-2',
      phase_number: 2,
      phase_id: 'PHASE_2',
      title: 'Words that sell',
      subtitle: 'We write your 3 pages.',
      day_range: 'Days 3-5',
      checklist_items: [
        { id: 't4', label: 'Draft homepage copy ready', sort_order: 1 },
        { id: 't5', label: 'Draft offer / services page ready', sort_order: 2 },
      ],
    },
  ],
  GROWTH: [
    {
      id: 'template-3',
      phase_number: 1,
      phase_id: 'PHASE_1',
      title: 'Strategy locked in',
      subtitle: 'Offer, goal and funnel map agreed.',
      day_range: 'Days 0-2',
      checklist_items: [
        { id: 't6', label: 'Onboarding steps completed', sort_order: 1 },
        { id: 't7', label: 'Strategy call completed', sort_order: 2 },
      ],
    },
  ],
}

export const DUMMY_QUIZ_SUBMISSIONS = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john@example.com',
    phone_number: '+1234567890',
    brand_name: 'TechStart Inc',
    logo_status: 'in_progress',
    brand_goals: ['Increase brand awareness', 'Launch new product', 'Improve customer engagement'],
    online_presence: 'website',
    audience: ['Small business owners', 'Entrepreneurs'],
    brand_style: 'Modern',
    timeline: 'asap',
    preferred_kit: 'LAUNCH',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    phone_number: '+1234567891',
    brand_name: 'Creative Studio',
    logo_status: 'completed',
    brand_goals: ['Rebrand identity', 'Expand market reach'],
    online_presence: 'social_media',
    audience: ['Creative professionals'],
    brand_style: 'Minimalist',
    timeline: 'flexible',
    preferred_kit: 'GROWTH',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    full_name: 'Bob Wilson',
    email: 'bob@example.com',
    phone_number: null,
    brand_name: 'Wilson Consulting',
    logo_status: 'pending',
    brand_goals: ['Professional image', 'Client trust'],
    online_presence: 'website',
    audience: ['Corporate clients'],
    brand_style: 'Professional',
    timeline: 'urgent',
    preferred_kit: 'LAUNCH',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

