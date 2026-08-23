import { Component, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { trimmedMinLengthValidator } from '../../../../../../shared/validators/form-validators';
import { getAnswerLabel } from '../../../../../../shared/utils/survey-display';
import { MAX_SURVEY_ANSWERS } from '../survey-form.constants';
import { SurveyQuestionGroup } from '../survey-form.types';

/** Displays and manages one editable survey question and its answers. */
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-survey-question-form',
  styleUrl: './survey-question-form.scss',
  templateUrl: './survey-question-form.html',
})
export class SurveyQuestionForm {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly question = input.required<SurveyQuestionGroup>();
  readonly questionIndex = input.required<number>();
  readonly showErrors = input(false);
  readonly removeQuestion = output<number>();
  protected readonly maxAnswers: number = MAX_SURVEY_ANSWERS;

  /**
   * Provides typed access to the current question's answer list.
   *
   * @returns FormArray containing every current answer.
   */
  protected get answers(): FormArray<FormControl<string>> {
    return this.question().controls.answers;
  }

  /** Adds another required answer field. */
  protected addAnswer(): void {
    if (this.answers.length < this.maxAnswers) {
      this.answers.push(this.createAnswer());
    }
  }

  /**
   * Removes an answer while preserving the required minimum of two.
   *
   * @param answerIndex Zero-based position of the selected answer.
   */
  protected removeAnswer(answerIndex: number): void {
    if (this.answers.length === 2) {
      this.answers.at(answerIndex).reset();
      this.answers.at(answerIndex).markAsUntouched();
      return;
    }

    this.answers.removeAt(answerIndex);
  }

  /** Requests clearing or removing the complete current question. */
  protected deleteQuestion(): void {
    this.removeQuestion.emit(this.questionIndex());
  }

  /**
   * Returns whether an invalid question control should display feedback.
   *
   * @param control Question control inspected for feedback.
   * @returns Whether its validation message should be visible.
   */
  protected shouldShowError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.showErrors());
  }

  /**
   * Converts an answer position to its alphabetic display label.
   *
   * @param answerIndex Zero-based answer position.
   * @returns Alphabetic label such as A. or B.
   */
  protected getAnswerLabel(answerIndex: number): string {
    return getAnswerLabel(answerIndex);
  }

  /**
   * Creates one required, non-nullable answer control.
   *
   * @returns New answer control.
   */
  private createAnswer(): FormControl<string> {
    return this.formBuilder.control('', [Validators.required, trimmedMinLengthValidator(1)]);
  }
}
