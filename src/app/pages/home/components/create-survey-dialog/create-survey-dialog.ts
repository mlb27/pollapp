import { Component, ElementRef, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';

import { SurveyForm } from './survey-form/survey-form';

/** Displays the modal form used to create a new survey. */
@Component({
  imports: [SurveyForm],
  selector: 'app-create-survey-dialog',
  styleUrls: ['./create-survey-dialog.scss', './create-survey-dialog.mobile.scss'],
  templateUrl: './create-survey-dialog.html',
})
export class CreateSurveyDialog {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly router = inject(Router);
  private readonly surveyForm = viewChild(SurveyForm);
  private publishedSurveyId: number | null = null;
  protected readonly publishConfirmationVisible: WritableSignal<boolean> = signal(false);

  /** Opens the dialog in the browser's modal top layer. */
  public open(): void {
    const dialogElement: HTMLDialogElement = this.dialog().nativeElement;

    this.publishedSurveyId = null;
    this.publishConfirmationVisible.set(false);

    if (!dialogElement.open) {
      dialogElement.showModal();
    }
  }

  /** Closes the dialog without publishing a survey. */
  protected close(): void {
    if (this.isPublishing()) {
      return;
    }

    this.dialog().nativeElement.close();
  }

  /** Prevents the Escape key from interrupting an active database request. */
  protected handleCancel(event: Event): void {
    if (this.isPublishing()) {
      event.preventDefault();
    }
  }

  /** Returns whether the nested form is currently writing to Supabase. */
  protected isPublishing(): boolean {
    return this.surveyForm()?.isPublishing() ?? false;
  }

  /** Closes the form and displays feedback after a successful insert. */
  protected handleSurveyPublished(surveyId: number): void {
    this.publishedSurveyId = surveyId;
    this.close();
    this.publishConfirmationVisible.set(true);
  }

  /** Dismisses the confirmation and opens the newly created survey. */
  protected dismissPublishConfirmation(): void {
    const surveyId: number | null = this.publishedSurveyId;
    this.publishConfirmationVisible.set(false);
    this.publishedSurveyId = null;

    if (surveyId) {
      void this.router.navigate(['/', surveyId]);
    }
  }

  /** Restores a blank form whenever the native dialog finishes closing. */
  protected resetForm(): void {
    this.surveyForm()?.reset();
  }
}
