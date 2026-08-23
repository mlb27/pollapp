import { Component, ElementRef, viewChild } from '@angular/core';

import { SurveyForm } from './survey-form/survey-form';

/** Displays the modal form used to create a new survey. */
@Component({
  imports: [SurveyForm],
  selector: 'app-create-survey-dialog',
  styleUrl: './create-survey-dialog.scss',
  templateUrl: './create-survey-dialog.html',
})
export class CreateSurveyDialog {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly surveyForm = viewChild(SurveyForm);

  /** Opens the dialog in the browser's modal top layer. */
  public open(): void {
    const dialogElement: HTMLDialogElement = this.dialog().nativeElement;

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

  /** Restores a blank form whenever the native dialog finishes closing. */
  protected resetForm(): void {
    this.surveyForm()?.reset();
  }
}
