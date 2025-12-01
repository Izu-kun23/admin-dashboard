// Hardcoded phase and checklist templates for each kit type

export interface PhaseTemplate {
  phase_number: number
  phase_id: string
  title: string
  subtitle: string | null
  day_range: string
  checklist_items: ChecklistItemTemplate[]
}

export interface ChecklistItemTemplate {
  label: string
  sort_order: number
}

// LAUNCH Kit Phases
export const LAUNCH_KIT_PHASES: PhaseTemplate[] = [
  {
    phase_number: 1,
    phase_id: 'PHASE_1',
    title: 'Inputs & clarity',
    subtitle: 'Lock the message and plan.',
    day_range: 'Days 0-2',
    checklist_items: [
      { label: 'Onboarding steps completed', sort_order: 1 },
      { label: 'Brand / strategy call completed', sort_order: 2 },
      { label: 'Simple 14 day plan agreed', sort_order: 3 },
    ],
  },
  {
    phase_number: 2,
    phase_id: 'PHASE_2',
    title: 'Words that sell',
    subtitle: 'We write your 3 pages.',
    day_range: 'Days 3-5',
    checklist_items: [
      { label: 'Draft homepage copy ready', sort_order: 1 },
      { label: 'Draft offer / services page ready', sort_order: 2 },
      { label: 'Draft contact / about copy ready', sort_order: 3 },
      { label: 'You reviewed and approved copy', sort_order: 4 },
    ],
  },
  {
    phase_number: 3,
    phase_id: 'PHASE_3',
    title: 'Design & build',
    subtitle: 'We turn copy into a 3 page site.',
    day_range: 'Days 6-10',
    checklist_items: [
      { label: 'Site layout built for all 3 pages', sort_order: 1 },
      { label: 'Mobile checks done', sort_order: 2 },
      { label: 'Testimonials and proof added', sort_order: 3 },
      { label: 'Staging link shared with you', sort_order: 4 },
    ],
  },
  {
    phase_number: 4,
    phase_id: 'PHASE_4',
    title: 'Test & launch',
    subtitle: 'We connect domain, test and go live.',
    day_range: 'Days 11-14',
    checklist_items: [
      { label: 'Forms tested', sort_order: 1 },
      { label: 'Domain connected', sort_order: 2 },
      { label: 'Final checks completed', sort_order: 3 },
      { label: 'Site is live', sort_order: 4 },
    ],
  },
]

// GROWTH Kit Phases
export const GROWTH_KIT_PHASES: PhaseTemplate[] = [
  {
    phase_number: 1,
    phase_id: 'PHASE_1',
    title: 'Strategy locked in',
    subtitle: 'Offer, goal and funnel map agreed.',
    day_range: 'Days 0-2',
    checklist_items: [
      { label: 'Onboarding steps completed', sort_order: 1 },
      { label: 'Strategy call completed', sort_order: 2 },
      { label: 'Funnel map agreed', sort_order: 3 },
    ],
  },
  {
    phase_number: 2,
    phase_id: 'PHASE_2',
    title: 'Copy & email engine',
    subtitle: 'We write your site copy and 5 emails.',
    day_range: 'Days 3-5',
    checklist_items: [
      { label: 'Homepage copy ready', sort_order: 1 },
      { label: 'Offer page copy ready', sort_order: 2 },
      { label: '5 email sequences written', sort_order: 3 },
      { label: 'Copy reviewed and approved', sort_order: 4 },
    ],
  },
  {
    phase_number: 3,
    phase_id: 'PHASE_3',
    title: 'Build the funnel',
    subtitle: 'Pages, lead magnet and blog hub built.',
    day_range: 'Days 6-10',
    checklist_items: [
      { label: 'All pages built', sort_order: 1 },
      { label: 'Lead magnet created', sort_order: 2 },
      { label: 'Blog hub set up', sort_order: 3 },
      { label: 'Email sequences integrated', sort_order: 4 },
      { label: 'Staging link shared', sort_order: 5 },
    ],
  },
  {
    phase_number: 4,
    phase_id: 'PHASE_4',
    title: 'Test, launch & handover',
    subtitle: 'We test the full journey and go live.',
    day_range: 'Days 11-14',
    checklist_items: [
      { label: 'Full funnel tested', sort_order: 1 },
      { label: 'Email sequences tested', sort_order: 2 },
      { label: 'Domain connected', sort_order: 3 },
      { label: 'Analytics set up', sort_order: 4 },
      { label: 'Site is live', sort_order: 5 },
    ],
  },
]

export function getPhasesForKitType(kitType: 'LAUNCH' | 'GROWTH'): PhaseTemplate[] {
  return kitType === 'LAUNCH' ? LAUNCH_KIT_PHASES : GROWTH_KIT_PHASES
}

