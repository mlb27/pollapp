import { SurveyCategoryOption } from '../interfaces/survey';

/** Categories available when a survey is created or filtered. */
export const SURVEY_CATEGORIES: readonly SurveyCategoryOption[] = [
  { label: 'All Surveys', value: 'all-surveys' },
  { label: 'Team Activities', value: 'team-activities' },
  { label: 'Health & Wellness', value: 'health-wellness' },
  { label: 'Gaming & Entertainment', value: 'gaming-entertainment' },
  { label: 'Education & Learning', value: 'education-learning' },
  { label: 'Lifestyle & Preferences', value: 'lifestyle-preferences' },
  { label: 'Technology & Innovation', value: 'technology-innovation' },
];
