import { Component, ElementRef, inject, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  notPastDateValidator,
  trimmedMinLengthValidator,
} from '../../../../../shared/validators/form-validators';
import { SURVEY_CATEGORIES } from '../../../../../shared/constants/survey-categories';
import { SurveyCategoryOption } from '../../../../../shared/interfaces/survey';
import { SurveyModel } from '../../../../../shared/models/survey.model';
import { SurveysService } from '../../../../../shared/services/surveys.service';
import { SurveyQuestionForm } from './survey-question-form/survey-question-form';
import { MAX_SURVEY_ANSWERS, MAX_SURVEY_QUESTIONS } from './survey-form.constants';
import { SurveyGroup, SurveyQuestionGroup } from './survey-form.types';

/** Displays and manages the reactive form used to create a survey. */
@Component({
  imports: [ReactiveFormsModule, SurveyQuestionForm],
  selector: 'app-survey-form',
  styleUrls: ['./survey-form.scss', './survey-form.mobile.scss'],
  templateUrl: './survey-form.html',
})
export class SurveyForm {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly surveysService = inject(SurveysService);

  public readonly surveyPublished = output<number>();
  public readonly isPublishing = signal(false);

  protected readonly maxQuestions: number = MAX_SURVEY_QUESTIONS;
  protected readonly categories: readonly SurveyCategoryOption[] = SURVEY_CATEGORIES;
  protected readonly minimumEndDate: string = this.getLocalDateValue(new Date());
  protected readonly publishError = signal<string | null>(null);
  protected readonly submitted = signal(false);
  protected readonly surveyForm: SurveyGroup = this.formBuilder.group({
    category: this.formBuilder.control('', Validators.required),
    description: this.formBuilder.control(''),
    endDate: this.formBuilder.control('', [Validators.required, notPastDateValidator()]),
    name: this.formBuilder.control('', [Validators.required, trimmedMinLengthValidator(3)]),
    questions: this.formBuilder.array<SurveyQuestionGroup>(
      [this.createQuestion()],
      [Validators.minLength(1), Validators.maxLength(MAX_SURVEY_QUESTIONS)],
    ),
  });

  /**
   * Provides convenient typed access to the dynamic question list.
   *
   * @returns FormArray containing every current question.
   */
  protected get questions(): FormArray<SurveyQuestionGroup> {
    return this.surveyForm.controls.questions;
  }

  /** Adds a blank question until the configured limit is reached. */
  protected addQuestion(): void {
    if (this.questions.length < this.maxQuestions) {
      this.questions.push(this.createQuestion());
    }
  }

  /**
   * Clears the permanent first question or removes a subsequent question.
   *
   * @param questionIndex Zero-based position of the selected question.
   */
  protected removeQuestion(questionIndex: number): void {
    if (questionIndex === 0) {
      this.resetFirstQuestion();
      return;
    }

    this.questions.removeAt(questionIndex);
  }

  /**
   * Resets an optional or general text control through its delete button.
   *
   * @param control Text control selected for clearing.
   */
  protected clearControl(control: FormControl<string>): void {
    control.reset();
    control.markAsUntouched();
  }

  /**
   * Returns whether an invalid control should currently display feedback.
   *
   * @param control Form control inspected for feedback.
   * @returns Whether its validation message should be visible.
   */
  protected showError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitted());
  }

  /**
   * Validates and persists the survey before notifying the dialog.
   *
   * @returns Promise resolved after a successful database insert.
   */
  protected async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.surveyForm.markAllAsTouched();

    if (this.surveyForm.invalid) {
      this.focusFirstInvalidControl();
      return;
    }

    if (this.isPublishing()) {
      return;
    }

    const survey: SurveyModel = new SurveyModel(this.surveyForm.getRawValue());
    await this.publishSurvey(survey);
  }

  /** Restores the complete create-survey form to its initial state. */
  public reset(): void {
    this.surveyForm.reset();
    this.removeAdditionalQuestions();
    this.resetFirstQuestion();
    this.surveyForm.markAsPristine();
    this.surveyForm.markAsUntouched();
    this.isPublishing.set(false);
    this.publishError.set(null);
    this.submitted.set(false);
  }

  /** Persists one valid survey while guarding against duplicate submissions. */
  private async publishSurvey(survey: SurveyModel): Promise<void> {
    this.isPublishing.set(true);
    this.publishError.set(null);

    try {
      const surveyId: number = await this.surveysService.addSurvey(survey);
      this.isPublishing.set(false);
      this.surveyPublished.emit(surveyId);
    } catch {
      this.publishError.set('The survey could not be published. Please try again.');
    } finally {
      this.isPublishing.set(false);
    }
  }

  /** Moves keyboard focus to the first invalid field after validation feedback is rendered. */
  private focusFirstInvalidControl(): void {
    setTimeout((): void => {
      this.elementRef.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }

  /**
   * Creates one typed question with the required two initial answers.
   *
   * @returns New typed question group.
   */
  private createQuestion(): SurveyQuestionGroup {
    return this.formBuilder.group({
      allowMultipleAnswers: this.formBuilder.control(false),
      answers: this.formBuilder.array<FormControl<string>>(
        [this.createAnswer(), this.createAnswer()],
        [Validators.minLength(2), Validators.maxLength(MAX_SURVEY_ANSWERS)],
      ),
      questionText: this.formBuilder.control('', [
        Validators.required,
        trimmedMinLengthValidator(3),
      ]),
    });
  }

  /**
   * Creates one required, non-nullable answer control.
   *
   * @returns New answer control.
   */
  private createAnswer(): FormControl<string> {
    return this.formBuilder.control('', [Validators.required, trimmedMinLengthValidator(1)]);
  }

  /** Restores question one to a blank state with exactly two answers. */
  private resetFirstQuestion(): void {
    const firstQuestion: SurveyQuestionGroup = this.questions.at(0);
    const answers: FormArray<FormControl<string>> = firstQuestion.controls.answers;

    firstQuestion.controls.questionText.reset();
    firstQuestion.controls.allowMultipleAnswers.reset();
    answers.clear();
    answers.push(this.createAnswer());
    answers.push(this.createAnswer());
    firstQuestion.markAsUntouched();
  }

  /** Removes every dynamic question except the permanent first question. */
  private removeAdditionalQuestions(): void {
    while (this.questions.length > 1) {
      this.questions.removeAt(this.questions.length - 1);
    }
  }

  /**
   * Converts a local date to the value format expected by an HTML date input.
   *
   * @param date Local Date instance to format.
   * @returns Date string in YYYY-MM-DD format.
   */
  private getLocalDateValue(date: Date): string {
    const year: number = date.getFullYear();
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    const day: string = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
