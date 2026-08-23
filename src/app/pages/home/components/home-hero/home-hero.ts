import { Component, output } from '@angular/core';

/** Displays the introductory content and visual on the home page. */
@Component({
  selector: 'app-home-hero',
  imports: [],
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.scss',
})
export class HomeHero {
  /** Notifies the home page that the create-survey dialog should open. */
  protected readonly createSurvey = output<void>();
}
