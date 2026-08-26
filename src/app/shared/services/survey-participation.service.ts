import { Injectable } from '@angular/core';

import { SurveyVoteSelection } from '../interfaces/survey';

const SURVEY_COMPLETION_STORAGE_PREFIX: string = 'poll-app-completed-survey-';
const SURVEY_SELECTION_STORAGE_PREFIX: string = 'poll-app-survey-selections-';

/** Stores whether the current browser has already completed a survey. */
@Injectable({
  providedIn: 'root',
})
export class SurveyParticipationService {
  /** Returns whether this browser has completed the selected survey. */
  public hasParticipated(surveyId: number): boolean {
    try {
      return this.getStorage()?.getItem(this.getStorageKey(surveyId)) === 'true';
    } catch {
      return false;
    }
  }

  /** Returns the answers submitted by this browser for one survey. */
  public getSelections(surveyId: number): SurveyVoteSelection[] {
    try {
      const value: string | null =
        this.getStorage()?.getItem(this.getSelectionKey(surveyId)) ?? null;

      return value ? this.parseSelections(value) : [];
    } catch {
      return [];
    }
  }

  /** Marks one survey as completed after its votes were saved successfully. */
  public markAsParticipated(surveyId: number, selections: SurveyVoteSelection[]): void {
    try {
      const storage: Storage | null = this.getStorage();
      storage?.setItem(this.getStorageKey(surveyId), 'true');
      storage?.setItem(this.getSelectionKey(surveyId), JSON.stringify(selections));
    } catch {
      return;
    }
  }

  /** Converts a stored JSON value into validated vote selections. */
  private parseSelections(value: string): SurveyVoteSelection[] {
    const parsedValue: unknown = JSON.parse(value);

    return Array.isArray(parsedValue) ? parsedValue.filter(this.isVoteSelection) : [];
  }

  /** Checks whether one stored value has the expected vote-selection shape. */
  private isVoteSelection(value: unknown): value is SurveyVoteSelection {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const selection: Partial<SurveyVoteSelection> = value as Partial<SurveyVoteSelection>;
    const answerIds: unknown = selection.answerIds;

    return (
      Number.isInteger(selection.questionId) &&
      Array.isArray(answerIds) &&
      answerIds.every((answerId: unknown): boolean => Number.isInteger(answerId))
    );
  }

  /** Creates the browser-storage key for one database survey ID. */
  private getStorageKey(surveyId: number): string {
    return `${SURVEY_COMPLETION_STORAGE_PREFIX}${surveyId}`;
  }

  /** Creates the browser-storage key for one survey's selected answers. */
  private getSelectionKey(surveyId: number): string {
    return `${SURVEY_SELECTION_STORAGE_PREFIX}${surveyId}`;
  }

  /** Returns localStorage when the current environment makes it available. */
  private getStorage(): Storage | null {
    return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
  }
}
