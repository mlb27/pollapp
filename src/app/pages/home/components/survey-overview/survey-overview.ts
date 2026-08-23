import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SurveySummary } from '../../../../shared/interfaces/survey';
import { SurveysService } from '../../../../shared/services/surveys.service';
import {
  getCategoryLabel,
  getDeadlineLabel,
  isPastSurvey,
} from '../../../../shared/utils/survey-display';

type SurveyStatus = 'active' | 'past';

/** Displays and filters the active and past survey overview. */
@Component({
  selector: 'app-survey-overview',
  imports: [RouterLink],
  templateUrl: './survey-overview.html',
  styleUrl: './survey-overview.scss',
})
export class SurveyOverview {
  private readonly surveysService = inject(SurveysService);

  protected readonly selectedCategory: WritableSignal<string> = signal('all');
  protected readonly selectedStatus: WritableSignal<SurveyStatus> = signal('active');
  protected readonly categories: Signal<string[]> = computed((): string[] => {
    const categories: string[] = this.getStatusSurveys().map(
      (survey: SurveySummary): string => survey.category,
    );

    return [...new Set(categories)].sort();
  });
  protected readonly visibleSurveys: Signal<SurveySummary[]> = computed((): SurveySummary[] => {
    const category: string = this.selectedCategory();

    return this.getStatusSurveys().filter(
      (survey: SurveySummary): boolean => category === 'all' || survey.category === category,
    );
  });

  /** Changes between active and past surveys and resets the category. */
  protected setStatus(status: SurveyStatus): void {
    this.selectedStatus.set(status);
    this.selectedCategory.set('all');
  }

  /** Updates the category filter from its select element. */
  protected setCategory(event: Event): void {
    const select: HTMLSelectElement = event.target as HTMLSelectElement;
    this.selectedCategory.set(select.value);
  }

  /** Returns a readable category for one card or option. */
  protected getCategory(category: string): string {
    return getCategoryLabel(category);
  }

  /** Returns a relative deadline for one survey card. */
  protected getDeadline(endDate: string): string {
    return getDeadlineLabel(endDate);
  }

  /** Returns surveys belonging to the currently selected status. */
  private getStatusSurveys(): SurveySummary[] {
    const showPast: boolean = this.selectedStatus() === 'past';

    return this.surveysService
      .surveys()
      .filter((survey: SurveySummary): boolean => isPastSurvey(survey) === showPast);
  }
}
