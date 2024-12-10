import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { apiInterceptor } from './app/interceptors/api.interceptor';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [provideHttpClient(withInterceptors([apiInterceptor])), provideAnimationsAsync()]
}).catch((err) => console.error(err));
