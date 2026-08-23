import { SurveyDraft, SurveyQuestionDraft } from '../interfaces/survey';

/** Normalizes survey data before it is handed to the persistence service. */
export class SurveyModel implements SurveyDraft {
  category: string;
  description: string;
  endDate: string;
  name: string;
  questions: SurveyQuestionDraft[];

  /**
   * Creates a normalized survey model.
   *
   * @param data Partial survey data used to initialize the model.
   */
  constructor(data: Partial<SurveyDraft> = {}) {
    this.category = data.category?.trim() ?? '';
    this.description = data.description?.trim() ?? '';
    this.endDate = data.endDate?.trim() ?? '';
    this.name = data.name?.trim() ?? '';
    this.questions = (data.questions ?? []).map(
      (question: SurveyQuestionDraft): SurveyQuestionDraft => ({
        allowMultipleAnswers: question.allowMultipleAnswers,
        answers: question.answers.map((answer: string): string => answer.trim()),
        questionText: question.questionText.trim(),
      }),
    );
  }

  /**
   * Returns only the fields needed when a new survey is inserted.
   *
   * @returns Clean insert payload without a database ID.
   */
  public getCleanAddJson(): SurveyDraft {
    return {
      category: this.category,
      description: this.description,
      endDate: this.endDate,
      name: this.name,
      questions: this.questions.map((question: SurveyQuestionDraft): SurveyQuestionDraft => ({
        ...question,
        answers: [...question.answers],
      })),
    };
  }
}
