import { FormArray, FormControl, FormGroup } from '@angular/forms';

/** Typed controls belonging to one editable survey question. */
export interface SurveyQuestionControls {
  allowMultipleAnswers: FormControl<boolean>;
  answers: FormArray<FormControl<string>>;
  questionText: FormControl<string>;
}

/** Typed reactive form group for one survey question. */
export type SurveyQuestionGroup = FormGroup<SurveyQuestionControls>;

/** Typed controls belonging to the complete create-survey form. */
export interface SurveyControls {
  category: FormControl<string>;
  description: FormControl<string>;
  endDate: FormControl<string>;
  name: FormControl<string>;
  questions: FormArray<SurveyQuestionGroup>;
}

/** Typed reactive form group for a new survey. */
export type SurveyGroup = FormGroup<SurveyControls>;
