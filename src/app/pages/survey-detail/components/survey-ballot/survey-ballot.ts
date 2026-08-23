import { Component, computed, input, output, signal, Signal, WritableSignal } from '@angular/core';

import { Survey, SurveyQuestion, SurveyVoteSelection } from '../../../../shared/interfaces/survey';
import { getAnswerLabel } from '../../../../shared/utils/survey-display';

/** Displays all questions and manages the participant's local selections. */
@Component({
  selector: 'app-survey-ballot',
  imports: [],
  templateUrl: './survey-ballot.html',
  styleUrl: './survey-ballot.scss',
})
export class SurveyBallot {
  public readonly disabled = input(false);
  public readonly survey = input.required<Survey>();
  public readonly surveyCompleted = output<SurveyVoteSelection[]>();

  private readonly selections: WritableSignal<Record<number, number[]>> = signal({});

  protected readonly canSubmit: Signal<boolean> = computed((): boolean => {
    const questions: SurveyQuestion[] = this.survey().questions;

    return (
      !this.disabled() &&
      questions.length > 0 &&
      questions.every(
        (question: SurveyQuestion): boolean => this.getSelectedIds(question.id).length > 0,
      )
    );
  });

  /**
   * Selects or deselects one answer according to the question mode.
   *
   * @param question Question containing the selected answer.
   * @param answerId Database ID of the selected answer.
   */
  protected toggleAnswer(question: SurveyQuestion, answerId: number): void {
    if (this.disabled()) {
      return;
    }

    const answerIds: number[] = question.allowMultipleAnswers
      ? this.toggleMultipleAnswer(question.id, answerId)
      : [answerId];
    this.selections.update((current: Record<number, number[]>): Record<number, number[]> => ({
      ...current,
      [question.id]: answerIds,
    }));
  }

  /** Returns whether one answer is currently selected. */
  protected isSelected(questionId: number, answerId: number): boolean {
    return this.getSelectedIds(questionId).includes(answerId);
  }

  /** Converts a zero-based answer position to A., B., C. and so forth. */
  protected getAnswerLabel(answerIndex: number): string {
    return getAnswerLabel(answerIndex);
  }

  /** Emits one complete selection only after every question was answered. */
  protected completeSurvey(): void {
    if (!this.canSubmit()) {
      return;
    }

    const selections: SurveyVoteSelection[] = this.survey().questions.map(
      (question: SurveyQuestion): SurveyVoteSelection => ({
        answerIds: [...this.getSelectedIds(question.id)],
        questionId: question.id,
      }),
    );
    this.surveyCompleted.emit(selections);
  }

  /** Toggles one ID inside a multiple-answer selection. */
  private toggleMultipleAnswer(questionId: number, answerId: number): number[] {
    const selectedIds: number[] = this.getSelectedIds(questionId);

    return selectedIds.includes(answerId)
      ? selectedIds.filter((selectedId: number): boolean => selectedId !== answerId)
      : [...selectedIds, answerId];
  }

  /** Returns a question's selected answer IDs without exposing mutable state. */
  private getSelectedIds(questionId: number): number[] {
    return this.selections()[questionId] ?? [];
  }
}
