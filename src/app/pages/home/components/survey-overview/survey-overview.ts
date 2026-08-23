import { Component } from '@angular/core';

/** Represents the information displayed in a survey overview card. */
interface SurveyPreview {
  id: number;
  category: string;
  title: string;
  deadline: string;
}

/** Displays the active and past survey overview. */
@Component({
  selector: 'app-survey-overview',
  imports: [],
  templateUrl: './survey-overview.html',
  styleUrl: './survey-overview.scss',
})
export class SurveyOverview {
  /** Temporary survey data until the database service is connected. */
  protected readonly activeSurveys: SurveyPreview[] = [
    {
      id: 1,
      category: 'Team activities',
      title: 'Let’s Plan the Next Team Event Together',
      deadline: 'Ends in 1 Day',
    },
    {
      id: 2,
      category: 'Gaming',
      title: 'Gaming habits and favorite games!',
      deadline: 'Ends in 3 Days',
    },
    {
      id: 3,
      category: 'Gaming',
      title: 'Gaming habits and favorite games!',
      deadline: 'Ends in 3 Days',
    },
    {
      id: 4,
      category: 'Healthy Lifestyle',
      title: 'Healthier future: Fit & wellness survey!',
      deadline: 'Ends in 2 Days',
    },
    {
      id: 5,
      category: 'Healthy Lifestyle',
      title: 'Healthier future: Fit & wellness survey!',
      deadline: 'Ends in 2 Days',
    },
    {
      id: 6,
      category: 'Team activities',
      title: 'Let’s Plan the Next Team Event Together',
      deadline: 'Ends in 1 Day',
    },
  ];
}
