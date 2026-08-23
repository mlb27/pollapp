import { Injectable, signal, WritableSignal } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  SurveyAnswerRow,
  SurveyInsertRow,
  SurveyQuestionInsertRow,
} from '../interfaces/survey-database';
import { Survey, SurveyQuestion } from '../interfaces/survey';
import { SurveyModel } from '../models/survey.model';

const SUPABASE_URL = 'https://qaxqkcbgrhblyroonogu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_J_hTSWJGAxlv9QZYJ7zVSQ_yVlCrBew';

/** Provides Poll App survey data through the Supabase JavaScript client. */
@Injectable({
  providedIn: 'root',
})
export class SurveysService {
  private supabaseClient: Promise<SupabaseClient> | undefined;

  public readonly surveys: WritableSignal<Survey[]> = signal<Survey[]>([]);

  /**
   * Inserts a survey first and then its associated questions.
   *
   * @param survey Validated survey model from the create-survey form.
   * @returns Promise resolved after survey and questions were inserted.
   */
  public async addSurvey(survey: SurveyModel): Promise<void> {
    const supabase: SupabaseClient = await this.getSupabaseClient();
    const surveyRow: SurveyInsertRow = this.createSurveyRow(survey);
    const { data, error } = await supabase.from('surveys').insert(surveyRow).select('id').single();

    if (error) {
      throw error;
    }

    await this.addQuestions(Number(data.id), survey.questions);
  }

  /**
   * Converts the domain model to the surveys table column names.
   *
   * @param survey Survey model to convert.
   * @returns Insertable surveys-table row.
   */
  private createSurveyRow(survey: SurveyModel): SurveyInsertRow {
    return {
      category: survey.category,
      description: survey.description || null,
      end_date: survey.endDate,
      name: survey.name,
    };
  }

  /**
   * Inserts all questions belonging to one newly created survey.
   *
   * @param surveyId Database ID of the parent survey.
   * @param questions Questions to insert.
   * @returns Promise resolved after all questions were inserted.
   */
  private async addQuestions(surveyId: number, questions: SurveyQuestion[]): Promise<void> {
    const supabase: SupabaseClient = await this.getSupabaseClient();
    const questionRows: SurveyQuestionInsertRow[] = questions.map(
      (question: SurveyQuestion, index: number): SurveyQuestionInsertRow =>
        this.createQuestionRow(surveyId, question, index),
    );
    const { error } = await supabase.from('questions').insert(questionRows);

    if (error) {
      throw error;
    }
  }

  /**
   * Converts one domain question to the questions table column names.
   *
   * @param surveyId Database ID of the parent survey.
   * @param question Domain question to convert.
   * @param questionIndex Zero-based position inside the survey.
   * @returns Insertable questions-table row.
   */
  private createQuestionRow(
    surveyId: number,
    question: SurveyQuestion,
    questionIndex: number,
  ): SurveyQuestionInsertRow {
    return {
      allow_multiple_answers: question.allowMultipleAnswers,
      answers: this.createAnswerRows(question.answers),
      position: questionIndex + 1,
      question_text: question.questionText,
      survey_id: surveyId,
    };
  }

  /**
   * Adds stable local IDs and an initial vote count to answer texts.
   *
   * @param answers Answer texts belonging to one question.
   * @returns JSONB-compatible answer objects.
   */
  private createAnswerRows(answers: string[]): SurveyAnswerRow[] {
    return answers.map((answer: string, index: number): SurveyAnswerRow => ({
      id: index + 1,
      text: answer,
      votes: 0,
    }));
  }

  /**
   * Creates the browser client once, when the first database call is made.
   *
   * @returns Shared Supabase browser client.
   */
  private async getSupabaseClient(): Promise<SupabaseClient> {
    if (!this.supabaseClient) {
      this.supabaseClient = import('@supabase/supabase-js').then(
        ({ createClient }): SupabaseClient => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY),
      );
    }

    return this.supabaseClient;
  }
}
