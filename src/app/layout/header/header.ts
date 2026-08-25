import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Displays the shared Poll App header on every page. */
@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  public readonly showCreateSurveyButton: InputSignal<boolean> = input(false);
  public readonly usePurpleLogo: InputSignal<boolean> = input(false);
  public readonly createSurvey: OutputEmitterRef<void> = output<void>();
}
