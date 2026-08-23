/** One question belonging to a survey. */
export interface SurveyQuestion {
  allowMultipleAnswers: boolean;
  answers: string[];
  questionText: string;
}

/** Complete survey data used throughout the application. */
export interface Survey {
  category: string;
  description: string;
  endDate: string;
  id: number;
  name: string;
  questions: SurveyQuestion[];
}

/** Survey data sent when a new record is created. */
export type SurveyInsert = Omit<Survey, 'id'>;
