import { SURVEY_CATEGORIES } from '../constants/survey-categories';
import { SurveyCategoryOption, SurveySummary } from '../interfaces/survey';

const DAY_IN_MILLISECONDS: number = 86_400_000;
const FIRST_ANSWER_CHARACTER_CODE: number = 65;
/** Returns the readable label for a stored category value. */
export function getCategoryLabel(category: string): string {
  return (
    SURVEY_CATEGORIES.find((option: SurveyCategoryOption): boolean => option.value === category)
      ?.label ?? category
  );
}

/** Returns whether a survey's final calendar day has passed. */
export function isPastSurvey(survey: SurveySummary): boolean {
  return survey.endDate < getLocalDateValue(new Date());
}

/** Formats an ISO date as DD.MM.YYYY. */
export function formatSurveyDate(dateValue: string): string {
  const [year, month, day]: string[] = dateValue.split('-');

  return year && month && day ? `${day}.${month}.${year}` : dateValue;
}

/** Converts a zero-based answer position to A., B., C. and so forth. */
export function getAnswerLabel(answerIndex: number): string {
  return `${getAnswerLetter(answerIndex)}.`;
}

/** Converts a zero-based answer position to its alphabetic character. */
export function getAnswerLetter(answerIndex: number): string {
  return String.fromCharCode(FIRST_ANSWER_CHARACTER_CODE + answerIndex);
}

/** Creates the relative deadline label shown on survey cards. */
export function getDeadlineLabel(endDate: string): string {
  const remainingDays: number = getRemainingDays(endDate);

  if (remainingDays < 0) {
    return `Ended ${formatSurveyDate(endDate)}`;
  }

  return remainingDays === 1 ? 'Ends in 1 Day' : `Ends in ${remainingDays} Days`;
}

/** Calculates whole calendar days between today and an ISO date. */
function getRemainingDays(endDate: string): number {
  const endTimestamp: number = getUtcDateTimestamp(endDate);
  const today: Date = new Date();
  const todayTimestamp: number = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.round((endTimestamp - todayTimestamp) / DAY_IN_MILLISECONDS);
}

/** Converts an ISO date to a UTC timestamp without timezone shifts. */
function getUtcDateTimestamp(dateValue: string): number {
  const [year, month, day]: number[] = dateValue.split('-').map(Number);

  return Date.UTC(year, month - 1, day);
}

/** Formats a Date for comparisons with HTML date values. */
function getLocalDateValue(date: Date): string {
  const year: number = date.getFullYear();
  const month: string = String(date.getMonth() + 1).padStart(2, '0');
  const day: string = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
