import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch(handleBootstrapError);

/**
 * Reports an application bootstrap failure.
 *
 * @param error Unknown error returned by Angular.
 */
function handleBootstrapError(error: unknown): void {
  console.error(error);
}
