import { Survey, SurveyAnswer, SurveyQuestion } from '../interfaces/survey';
import { SurveyAnswerRow, SurveyQuestionRow, SurveyRow } from '../interfaces/survey-database';

/** Maps database rows to the survey shape used by the detail page. */
export class SurveyDetailsModel implements Survey {
  category: string;
  createdAt: string;
  description: string;
  endDate: string;
  id: number;
  name: string;
  questions: SurveyQuestion[];

  /**
   * Creates one complete survey from its parent and question rows.
   *
   * @param surveyRow Surveys-table row.
   * @param questionRows Related questions-table rows.
   */
  constructor(surveyRow: SurveyRow, questionRows: SurveyQuestionRow[]) {
    this.category = surveyRow.category;
    this.createdAt = surveyRow.created_at;
    this.description = surveyRow.description ?? '';
    this.endDate = surveyRow.end_date;
    this.id = surveyRow.id;
    this.name = surveyRow.name;
    this.questions = questionRows
      .sort(
        (first: SurveyQuestionRow, second: SurveyQuestionRow): number =>
          first.position - second.position,
      )
      .map((question: SurveyQuestionRow): SurveyQuestion => this.mapQuestion(question));
  }

  /** Converts one database question to the UI representation. */
  private mapQuestion(question: SurveyQuestionRow): SurveyQuestion {
    return {
      allowMultipleAnswers: question.allow_multiple_answers,
      answers: question.answers.map((answer: SurveyAnswerRow): SurveyAnswer => ({ ...answer })),
      id: question.id,
      position: question.position,
      questionText: question.question_text,
      surveyId: question.survey_id,
    };
  }
}
