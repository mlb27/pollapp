import { Injectable } from '@angular/core';

const SURVEY_COMPLETION_STORAGE_PREFIX: string = 'poll-app-completed-survey-';

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

  /** Marks one survey as completed after its votes were saved successfully. */
  public markAsParticipated(surveyId: number): void {
    try {
      this.getStorage()?.setItem(this.getStorageKey(surveyId), 'true');
    } catch {
      return;
    }
  }

  /** Creates the browser-storage key for one database survey ID. */
  private getStorageKey(surveyId: number): string {
    return `${SURVEY_COMPLETION_STORAGE_PREFIX}${surveyId}`;
  }

  /** Returns localStorage when the current environment makes it available. */
  private getStorage(): Storage | null {
    return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
  }
}
