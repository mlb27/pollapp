import { Component } from '@angular/core';
import { EndingSoonSurveys } from './components/ending-soon-surveys/ending-soon-surveys';
import { HomeHero } from './components/home-hero/home-hero';
import { SurveyOverview } from './components/survey-overview/survey-overview';

/** Displays the Poll App home page. */
@Component({
  imports: [HomeHero, EndingSoonSurveys, SurveyOverview],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {}
