import { Component, computed, input, Signal } from '@angular/core';

import { Survey, SurveyAnswer, SurveyQuestion } from '../../../../shared/interfaces/survey';
import { getAnswerLetter as getSurveyAnswerLetter } from '../../../../shared/utils/survey-display';

/** Displays the current live vote distribution for one survey. */
@Component({
  selector: 'app-survey-results',
  imports: [],
  templateUrl: './survey-results.html',
  styleUrl: './survey-results.scss',
})
export class SurveyResults {
  public readonly survey = input.required<Survey>();

  protected readonly hasVotes: Signal<boolean> = computed((): boolean =>
    this.survey().questions.some(
      (question: SurveyQuestion): boolean => this.getQuestionVotes(question) > 0,
    ),
  );

  /** Converts an answer index to its alphabetic result label. */
  protected getAnswerLabel(answerIndex: number): string {
    return getSurveyAnswerLetter(answerIndex);
  }

  /** Calculates an answer's percentage inside its own question. */
  protected getPercentage(answer: SurveyAnswer, question: SurveyQuestion): number {
    const totalVotes: number = this.getQuestionVotes(question);

    return totalVotes === 0 ? 0 : Math.round((answer.votes / totalVotes) * 100);
  }

  /** Adds all answer votes belonging to one question. */
  private getQuestionVotes(question: SurveyQuestion): number {
    return question.answers.reduce(
      (total: number, answer: SurveyAnswer): number => total + answer.votes,
      0,
    );
  }
}
