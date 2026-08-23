import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Validates the minimum length after surrounding whitespace is removed.
 *
 * @param minimumLength Required number of meaningful characters.
 * @returns Angular validator for trimmed text values.
 */
export function trimmedMinLengthValidator(minimumLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    validateTrimmedLength(control.value, minimumLength);
}

/**
 * Validates a populated local date as today or later.
 *
 * Empty values are handled separately by Angular's required validator.
 *
 * @returns Angular validator for local date input values.
 */
export function notPastDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => validateNotPastDate(control.value);
}

/**
 * Validates meaningful text length without counting outer whitespace.
 *
 * @param value Unknown form-control value.
 * @param minimumLength Required number of characters.
 * @returns A minlength error or null when valid.
 */
function validateTrimmedLength(value: unknown, minimumLength: number): ValidationErrors | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  const actualLength: number = value.trim().length;

  return actualLength >= minimumLength
    ? null
    : { minlength: { actualLength, requiredLength: minimumLength } };
}

/**
 * Validates one unknown value as a non-past local date.
 *
 * @param value Unknown form-control value.
 * @returns A date validation error or null when valid.
 */
function validateNotPastDate(value: unknown): ValidationErrors | null {
  if (value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    return { invalidDate: true };
  }

  const selectedDate: Date | null = parseLocalDate(value);

  return getSelectedDateError(selectedDate);
}

/**
 * Returns the applicable error for one parsed date.
 *
 * @param selectedDate Parsed date or null for an invalid input.
 * @returns Invalid, past-date, or valid result.
 */
function getSelectedDateError(selectedDate: Date | null): ValidationErrors | null {
  if (!selectedDate) {
    return { invalidDate: true };
  }

  return selectedDate < getStartOfToday() ? { pastDate: true } : null;
}

/**
 * Parses an HTML date-input value without applying a UTC conversion.
 *
 * @param value Date string in YYYY-MM-DD format.
 * @returns A matching local Date or null for an impossible value.
 */
function parseLocalDate(value: string): Date | null {
  const parts: RegExpMatchArray | null = value.match(LOCAL_DATE_PATTERN);

  if (!parts) {
    return null;
  }

  const year: number = Number(parts[1]);
  const monthIndex: number = Number(parts[2]) - 1;
  const day: number = Number(parts[3]);
  const date = new Date(year, monthIndex, day);

  return isMatchingDate(date, year, monthIndex, day) ? date : null;
}

/**
 * Checks that JavaScript did not roll an impossible date into another month.
 *
 * @param date Parsed local date.
 * @param year Expected year.
 * @param monthIndex Expected zero-based month.
 * @param day Expected day.
 * @returns Whether every local date part matches.
 */
function isMatchingDate(date: Date, year: number, monthIndex: number, day: number): boolean {
  return date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day;
}

/**
 * Creates today's local date at midnight.
 *
 * @returns Start of the current local day.
 */
function getStartOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
}
