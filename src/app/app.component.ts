import { Component, OnInit, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { map } from 'rxjs';
import { CalendarComponent, CalendarEvent } from './components/calendar/calendar.component';
import { FilterComponent } from './components/filter/filter.component';
import { ScheduleSelectComponent } from './components/schedule-select/schedule-select.component';
import { CalendarService } from './services/calendar.service';

const dummyWeeks: string[] = ['2024-11-18', '2024-11-25', '2024-12-02'];

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    CalendarComponent,
    ScheduleSelectComponent,
    FilterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  // some dummy calendar data
  protected readonly weeks = signal<string[]>(dummyWeeks);
  protected readonly events = signal<CalendarEvent[]>([]);

  // the selected week
  protected readonly selectedWeek = signal<string | null>(null);

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.calendarService.calendarEvents$
      .pipe(
        map((events) =>
          events.map((event) => ({
            title: event.title,
            start: event.start,
            end: event.end,
            color: event.color
          }))
        )
      )
      .subscribe((events) => this.events.set(events));
  }
}
