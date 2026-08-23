import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';

import { Header } from '../../layout/header/header';
import { Survey, SurveyVoteSelection } from '../../shared/interfaces/survey';
import { SurveysService } from '../../shared/services/surveys.service';
import {
  formatSurveyDate,
  getCategoryLabel,
  isPastSurvey,
} from '../../shared/utils/survey-display';
import { CreateSurveyDialog } from '../home/components/create-survey-dialog/create-survey-dialog';
import { SurveyBallot } from './components/survey-ballot/survey-ballot';
import { SurveyResults } from './components/survey-results/survey-results';

/** Displays one survey selected by the numeric route ID. */
@Component({
  selector: 'app-survey-detail',
  imports: [RouterLink, Header, CreateSurveyDialog, SurveyBallot, SurveyResults],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly surveysService = inject(SurveysService);
  private readonly createSurveyDialog = viewChild(CreateSurveyDialog);

  protected readonly errorMessage = this.surveysService.errorMessage;
  protected readonly isLoading = this.surveysService.isLoading;
  protected readonly survey = this.surveysService.selectedSurvey;
  protected readonly invalidRoute = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly voteError = signal<string | null>(null);
  protected readonly isPast: Signal<boolean> = computed((): boolean => {
    const survey: Survey | null = this.survey();

    return survey ? isPastSurvey(survey) : false;
  });
  protected readonly ballotDisabled: Signal<boolean> = computed(
    (): boolean => this.isPast() || this.isSubmitting() || this.submitted(),
  );

  /** Loads the survey referenced by the active numeric route parameter. */
  public ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parameters: ParamMap): void => this.loadRouteSurvey(parameters.get('id')));
  }

  /** Loads and resets the detail page for one route ID value. */
  private loadRouteSurvey(routeId: string | null): void {
    const surveyId: number = Number(routeId);
    this.resetRouteState();
    this.surveysService.clearSelectedSurvey();

    if (!Number.isInteger(surveyId) || surveyId < 1) {
      this.invalidRoute.set(true);
      return;
    }

    void this.surveysService.getSurveyById(surveyId);
  }

  /** Clears feedback that belongs to a previously displayed survey. */
  private resetRouteState(): void {
    this.invalidRoute.set(false);
    this.submitted.set(false);
    this.voteError.set(null);
  }

  /** Opens the shared create-survey dialog from the page header. */
  protected openCreateSurveyDialog(): void {
    this.createSurveyDialog()?.open();
  }

  /** Returns a readable category for the survey metadata. */
  protected getCategory(category: string): string {
    return getCategoryLabel(category);
  }

  /** Returns a localized display date without applying timezone changes. */
  protected getEndDate(endDate: string): string {
    return formatSurveyDate(endDate);
  }

  /** Persists the participant's selected answers. */
  protected async completeSurvey(selections: SurveyVoteSelection[]): Promise<void> {
    if (this.ballotDisabled()) {
      return;
    }

    this.startSubmission();
    await this.persistSelections(selections);
  }

  /** Completes one active vote request and updates its feedback signals. */
  private async persistSelections(selections: SurveyVoteSelection[]): Promise<void> {
    try {
      await this.surveysService.submitSurveyVotes(selections);
      this.submitted.set(true);
    } catch (error: unknown) {
      this.voteError.set(this.getVoteError(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /** Clears stale feedback and marks a vote request as active. */
  private startSubmission(): void {
    this.voteError.set(null);
    this.isSubmitting.set(true);
  }

  /** Returns a safe participant-facing persistence error. */
  private getVoteError(error: unknown): string {
    return error instanceof Error
      ? `Your answers could not be saved: ${error.message}`
      : 'Your answers could not be saved.';
  }
}
