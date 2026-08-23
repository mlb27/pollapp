/** One selectable answer and its current result. */
export interface SurveyAnswer {
  id: number;
  text: string;
  votes: number;
}

/** One question entered while a survey is created. */
export interface SurveyQuestionDraft {
  allowMultipleAnswers: boolean;
  answers: string[];
  questionText: string;
}

/** One persisted question belonging to a survey. */
export interface SurveyQuestion {
  allowMultipleAnswers: boolean;
  answers: SurveyAnswer[];
  id: number;
  position: number;
  questionText: string;
  surveyId: number;
}

/** Survey information used by lists and cards. */
export interface SurveySummary {
  category: string;
  createdAt: string;
  description: string;
  endDate: string;
  id: number;
  name: string;
}

/** Complete survey including all persisted questions. */
export interface Survey extends SurveySummary {
  questions: SurveyQuestion[];
}

/** Survey data entered in the create-survey form. */
export interface SurveyDraft {
  category: string;
  description: string;
  endDate: string;
  name: string;
  questions: SurveyQuestionDraft[];
}

/** Selected answers for one submitted survey question. */
export interface SurveyVoteSelection {
  answerIds: number[];
  questionId: number;
}
