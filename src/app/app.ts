import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Hosts the application's active router content. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
