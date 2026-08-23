import { Component, computed, inject, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SurveySummary } from '../../../../shared/interfaces/survey';
import { SurveysService } from '../../../../shared/services/surveys.service';
import {
  getCategoryLabel,
  getDeadlineLabel,
  isPastSurvey,
} from '../../../../shared/utils/survey-display';

/** Displays the three active surveys that will end first. */
@Component({
  selector: 'app-ending-soon-surveys',
  imports: [RouterLink],
  templateUrl: './ending-soon-surveys.html',
  styleUrl: './ending-soon-surveys.scss',
})
export class EndingSoonSurveys {
  private readonly surveysService = inject(SurveysService);

  protected readonly endingSoonSurveys: Signal<SurveySummary[]> = computed((): SurveySummary[] =>
    [...this.surveysService.surveys()]
      .filter((survey: SurveySummary): boolean => !isPastSurvey(survey))
      .sort((first: SurveySummary, second: SurveySummary): number =>
        first.endDate.localeCompare(second.endDate),
      )
      .slice(0, 3),
  );

  /** Returns a readable category for one card. */
  protected getCategory(category: string): string {
    return getCategoryLabel(category);
  }

  /** Returns a relative deadline for one card. */
  protected getDeadline(endDate: string): string {
    return getDeadlineLabel(endDate);
  }
}
