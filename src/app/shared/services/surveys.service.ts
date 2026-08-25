import { Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

import {
  SurveyAnswerRow,
  SurveyInsertRow,
  SurveyQuestionInsertRow,
  SurveyQuestionRow,
  SurveyQuestionUpdateRow,
  SurveyRow,
} from '../interfaces/survey-database';
import {
  Survey,
  SurveyDraft,
  SurveyQuestion,
  SurveyQuestionDraft,
  SurveySummary,
  SurveyVoteSelection,
} from '../interfaces/survey';
import { SurveyDetailsModel } from '../models/survey-details.model';
import { SurveyModel } from '../models/survey.model';

const SUPABASE_URL: string = 'https://qaxqkcbgrhblyroonogu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY: string = 'sb_publishable_J_hTSWJGAxlv9QZYJ7zVSQ_yVlCrBew';

/** Provides Poll App survey data through the Supabase JavaScript client. */
@Injectable({
  providedIn: 'root',
})
export class SurveysService implements OnDestroy {
  private supabaseClient: Promise<SupabaseClient> | undefined;
  private surveysChannel: RealtimeChannel | undefined;
  private questionsChannel: RealtimeChannel | undefined;
  private activeDetailRequest: number = 0;

  public readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  public readonly isLoading: WritableSignal<boolean> = signal(false);
  public readonly selectedSurvey: WritableSignal<Survey | null> = signal<Survey | null>(null);
  public readonly surveys: WritableSignal<SurveySummary[]> = signal<SurveySummary[]>([]);

  /** Starts the initial database load and realtime listeners. */
  constructor() {
    void this.initialize();
  }

  /** Removes both realtime channels when the root service is destroyed. */
  public ngOnDestroy(): void {
    void this.removeRealtimeChannels();
  }

  /** Clears detail data before another route ID is requested. */
  public clearSelectedSurvey(): void {
    this.activeDetailRequest += 1;
    this.isLoading.set(false);
    this.selectedSurvey.set(null);
  }

  /**
   * Inserts a survey first and then its associated questions.
   *
   * @param survey Validated survey model from the create-survey form.
   * @returns Database ID of the inserted survey.
   */
  public async addSurvey(survey: SurveyModel): Promise<number> {
    const supabase: SupabaseClient = await this.getSupabaseClient();
    const cleanSurvey: SurveyDraft = survey.getCleanAddJson();
    const surveyRow: SurveyInsertRow = this.createSurveyRow(cleanSurvey);
    const { data, error } = await supabase.from('surveys').insert(surveyRow).select('id').single();

    if (error) {
      throw error;
    }

    const surveyId: number = Number(data.id);
    await this.addQuestions(surveyId, cleanSurvey.questions);
    await this.getAllSurveys();

    return surveyId;
  }

  /** Loads all survey summaries used on the home page. */
  public async getAllSurveys(): Promise<void> {
    const supabase: SupabaseClient = await this.getSupabaseClient();
    const { data, error } = await supabase.from('surveys').select('*').order('end_date');

    if (error) {
      this.errorMessage.set(this.getErrorMessage(error));
      return;
    }

    const surveyRows: SurveyRow[] = (data ?? []) as unknown as SurveyRow[];
    this.surveys.set(surveyRows.map((row: SurveyRow): SurveySummary => this.mapSummary(row)));
  }

  /**
   * Loads one complete survey and all related questions by URL ID.
   *
   * @param surveyId Database ID read from the active route.
   * @returns Loaded survey or null when it does not exist.
   */
  public async getSurveyById(surveyId: number): Promise<Survey | null> {
    const requestId: number = this.startDetailRequest();
    this.startLoading();

    return this.executeDetailRequest(surveyId, requestId);
  }

  /** Loads and applies one sequenced detail request. */
  private async executeDetailRequest(surveyId: number, requestId: number): Promise<Survey | null> {
    try {
      const survey: Survey | null = await this.loadSurvey(surveyId);
      this.setLoadedSurvey(requestId, survey);
      return survey;
    } catch (error: unknown) {
      this.handleLoadError(requestId, error);
      return null;
    } finally {
      this.finishDetailRequest(requestId);
    }
  }

  /**
   * Adds one vote to every selected answer and refreshes the detail view.
   *
   * @param selections Selected answer IDs grouped by question.
   */
  public async submitSurveyVotes(selections: SurveyVoteSelection[]): Promise<void> {
    const survey: Survey | null = this.selectedSurvey();

    if (!survey) {
      throw new Error('No survey is currently selected.');
    }

    const updates: Promise<void>[] = survey.questions.map(
      (question: SurveyQuestion): Promise<void> => this.updateQuestionVotes(question, selections),
    );
    await Promise.all(updates);
    await this.refreshSubmittedSurvey(survey.id);
  }

  /** Reloads vote results only while the submitted survey is still selected. */
  private async refreshSubmittedSurvey(surveyId: number): Promise<void> {
    if (this.selectedSurvey()?.id === surveyId) {
      await this.getSurveyById(surveyId);
    }
  }

  /** Loads initial survey data before attaching realtime channels. */
  private async initialize(): Promise<void> {
    try {
      await this.getAllSurveys();
      await this.subscribeToChanges();
    } catch (error: unknown) {
      this.errorMessage.set(this.getErrorMessage(error));
    }
  }

  /** Prepares loading and error signals for a detail request. */
  private startLoading(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
  }

  /** Creates a sequence number for the newest detail request. */
  private startDetailRequest(): number {
    this.activeDetailRequest += 1;

    return this.activeDetailRequest;
  }

  /** Applies loaded data only when no newer route request exists. */
  private setLoadedSurvey(requestId: number, survey: Survey | null): void {
    if (requestId === this.activeDetailRequest) {
      this.selectedSurvey.set(survey);
    }
  }

  /** Stores a current detail-loading error and clears stale data. */
  private handleLoadError(requestId: number, error: unknown): void {
    if (requestId !== this.activeDetailRequest) {
      return;
    }

    this.selectedSurvey.set(null);
    this.errorMessage.set(this.getErrorMessage(error));
  }

  /** Ends loading only for the most recently started detail request. */
  private finishDetailRequest(requestId: number): void {
    if (requestId === this.activeDetailRequest) {
      this.isLoading.set(false);
    }
  }

  /** Loads and combines the parent row and its ordered question rows. */
  private async loadSurvey(surveyId: number): Promise<Survey | null> {
    const [surveyRow, questionRows]: [SurveyRow | null, SurveyQuestionRow[]] = await Promise.all([
      this.fetchSurveyRow(surveyId),
      this.fetchQuestionRows(surveyId),
    ]);

    return surveyRow ? new SurveyDetailsModel(surveyRow, questionRows) : null;
  }

  /** Reads one survey row without expecting the home list to be loaded. */
  private async fetchSurveyRow(surveyId: number): Promise<SurveyRow | null> {
    const supabase: SupabaseClient = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as unknown as SurveyRow | null;
  }

  /** Reads all questions belonging to one survey in their display order. */
  private async fetchQuestionRows(surveyId: number): Promise<SurveyQuestionRow[]> {
    const supabase: SupabaseClient = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('position');

    if (error) {
      throw error;
    }

    return (data ?? []) as unknown as SurveyQuestionRow[];
  }

  /** Updates the JSONB answers for one question with the selected votes. */
  private async updateQuestionVotes(
    question: SurveyQuestion,
    selections: SurveyVoteSelection[],
  ): Promise<void> {
    const selection: SurveyVoteSelection | undefined = selections.find(
      (item: SurveyVoteSelection): boolean => item.questionId === question.id,
    );
    const answerIds: Set<number> = new Set(selection?.answerIds ?? []);
    const updateRow: SurveyQuestionUpdateRow = {
      answers: question.answers.map((answer: SurveyAnswerRow): SurveyAnswerRow => ({
        ...answer,
        votes: answer.votes + (answerIds.has(answer.id) ? 1 : 0),
      })),
    };

    await this.persistQuestionUpdate(question.id, updateRow);
  }

  /** Writes one prepared question update and surfaces database errors. */
  private async persistQuestionUpdate(
    questionId: number,
    updateRow: SurveyQuestionUpdateRow,
  ): Promise<void> {
    const supabase: SupabaseClient = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from('questions')
      .update(updateRow)
      .eq('id', questionId)
      .select('id')
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error('The vote update was rejected by the database.');
    }
  }

  /** Attaches one channel per table so detail results stay current. */
  private async subscribeToChanges(): Promise<void> {
    if (this.surveysChannel || this.questionsChannel) {
      return;
    }

    const supabase: SupabaseClient = await this.getSupabaseClient();
    this.surveysChannel = this.createSurveysChannel(supabase);
    this.questionsChannel = this.createQuestionsChannel(supabase);
  }

  /** Creates the realtime listener for survey inserts, updates and deletes. */
  private createSurveysChannel(supabase: SupabaseClient): RealtimeChannel {
    return supabase
      .channel('poll-app-surveys')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'surveys' },
        (): void => void this.handleSurveyTableChange(),
      )
      .subscribe();
  }

  /** Creates the realtime listener for live question result changes. */
  private createQuestionsChannel(supabase: SupabaseClient): RealtimeChannel {
    return supabase
      .channel('poll-app-questions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        (): void => void this.refreshSelectedSurvey(),
      )
      .subscribe();
  }

  /** Refreshes both the home list and an open detail after survey changes. */
  private async handleSurveyTableChange(): Promise<void> {
    await this.getAllSurveys();
    await this.refreshSelectedSurvey();
  }

  /** Reloads an open detail page after a matching table change. */
  private async refreshSelectedSurvey(): Promise<void> {
    const surveyId: number | undefined = this.selectedSurvey()?.id;

    if (surveyId) {
      await this.getSurveyById(surveyId);
    }
  }

  /** Removes established realtime channels from the Supabase client. */
  private async removeRealtimeChannels(): Promise<void> {
    const supabase: SupabaseClient = await this.getSupabaseClient();
    const channels: RealtimeChannel[] = [this.surveysChannel, this.questionsChannel].filter(
      (channel: RealtimeChannel | undefined): channel is RealtimeChannel => Boolean(channel),
    );

    await Promise.all(
      channels.map((channel: RealtimeChannel): ReturnType<SupabaseClient['removeChannel']> =>
        supabase.removeChannel(channel),
      ),
    );
  }

  /** Converts one database row to the summary used by survey lists. */
  private mapSummary(row: SurveyRow): SurveySummary {
    return {
      category: row.category,
      createdAt: row.created_at,
      description: row.description ?? '',
      endDate: row.end_date,
      id: row.id,
      name: row.name,
    };
  }

  /** Converts the domain model to the surveys table column names. */
  private createSurveyRow(survey: SurveyDraft): SurveyInsertRow {
    return {
      category: survey.category,
      description: survey.description || null,
      end_date: survey.endDate,
      name: survey.name,
    };
  }

  /** Inserts all questions belonging to one newly created survey. */
  private async addQuestions(surveyId: number, questions: SurveyQuestionDraft[]): Promise<void> {
    const supabase: SupabaseClient = await this.getSupabaseClient();
    const questionRows: SurveyQuestionInsertRow[] = questions.map(
      (question: SurveyQuestionDraft, index: number): SurveyQuestionInsertRow =>
        this.createQuestionRow(surveyId, question, index),
    );
    const { error } = await supabase.from('questions').insert(questionRows);

    if (error) {
      throw error;
    }
  }

  /** Converts one draft question to the questions table column names. */
  private createQuestionRow(
    surveyId: number,
    question: SurveyQuestionDraft,
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

  /** Adds stable IDs and an initial vote count to answer texts. */
  private createAnswerRows(answers: string[]): SurveyAnswerRow[] {
    return answers.map((answer: string, index: number): SurveyAnswerRow => ({
      id: index + 1,
      text: answer,
      votes: 0,
    }));
  }

  /** Creates the browser client once, when the first database call is made. */
  private async getSupabaseClient(): Promise<SupabaseClient> {
    if (!this.supabaseClient) {
      this.supabaseClient = import('@supabase/supabase-js').then(
        ({ createClient }): SupabaseClient => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY),
      );
    }

    return this.supabaseClient;
  }

  /** Returns a readable message for an unknown database error. */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'The survey data could not be loaded.';
  }
}
