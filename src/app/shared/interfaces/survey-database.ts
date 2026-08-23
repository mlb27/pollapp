/** One answer object stored inside a question's JSONB column. */
export interface SurveyAnswerRow {
  id: number;
  text: string;
  votes: number;
}

/** Insertable row for the surveys table. */
export interface SurveyInsertRow {
  category: string;
  description: string | null;
  end_date: string;
  name: string;
}

/** Insertable row for the questions table. */
export interface SurveyQuestionInsertRow {
  allow_multiple_answers: boolean;
  answers: SurveyAnswerRow[];
  position: number;
  question_text: string;
  survey_id: number;
}
