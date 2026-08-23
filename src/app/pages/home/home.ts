import { Component, viewChild } from '@angular/core';

import { CreateSurveyDialog } from './components/create-survey-dialog/create-survey-dialog';
import { EndingSoonSurveys } from './components/ending-soon-surveys/ending-soon-surveys';
import { HomeHero } from './components/home-hero/home-hero';
import { SurveyOverview } from './components/survey-overview/survey-overview';

/** Displays the Poll App home page. */
@Component({
  imports: [HomeHero, EndingSoonSurveys, SurveyOverview, CreateSurveyDialog],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  private readonly createSurveyDialog = viewChild(CreateSurveyDialog);

  /** Opens the modal for creating a new survey. */
  protected openCreateSurveyDialog(): void {
    this.createSurveyDialog()?.open();
  }
}
