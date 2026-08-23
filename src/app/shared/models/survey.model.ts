import { Survey, SurveyInsert, SurveyQuestion } from '../interfaces/survey';

/** Normalizes survey data before it is handed to the persistence service. */
export class SurveyModel implements Survey {
  category: string;
  description: string;
  endDate: string;
  id: number;
  name: string;
  questions: SurveyQuestion[];

  /**
   * Creates a normalized survey model.
   *
   * @param data Partial survey data used to initialize the model.
   */
  constructor(data: Partial<Survey> = {}) {
    this.category = data.category?.trim() ?? '';
    this.description = data.description?.trim() ?? '';
    this.endDate = data.endDate?.trim() ?? '';
    this.id = data.id ?? 0;
    this.name = data.name?.trim() ?? '';
    this.questions = (data.questions ?? []).map((question: SurveyQuestion): SurveyQuestion => ({
      allowMultipleAnswers: question.allowMultipleAnswers,
      answers: question.answers.map((answer: string): string => answer.trim()),
      questionText: question.questionText.trim(),
    }));
  }

  /**
   * Returns only the fields needed when a new survey is inserted.
   *
   * @returns Clean insert payload without a database ID.
   */
  public getCleanAddJson(): SurveyInsert {
    return {
      category: this.category,
      description: this.description,
      endDate: this.endDate,
      name: this.name,
      questions: this.questions.map((question: SurveyQuestion): SurveyQuestion => ({
        ...question,
        answers: [...question.answers],
      })),
    };
  }
}
