/** One answer object stored inside a question's JSONB column. */
export interface SurveyAnswerRow {
  id: number;
  text: string;
  votes: number;
}

/** Row returned from the surveys table. */
export interface SurveyRow {
  category: string;
  created_at: string;
  description: string | null;
  end_date: string;
  id: number;
  name: string;
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

/** Row returned from the questions table. */
export interface SurveyQuestionRow extends SurveyQuestionInsertRow {
  id: number;
}

/** Mutable columns used when votes are submitted. */
export interface SurveyQuestionUpdateRow {
  answers: SurveyAnswerRow[];
}
