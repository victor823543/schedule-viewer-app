import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { map, Subject, takeUntil } from 'rxjs';
import { CalendarComponent, CalendarEvent } from './components/calendar/calendar.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { FilterChipsComponent } from './components/filter-chips/filter-chips.component';
import { FilterComponent } from './components/filter/filter.component';
import { ScheduleSelectComponent } from './components/schedule-select/schedule-select.component';
import { CalendarService } from './services/calendar.service';
import { FilterService } from './services/filter.service';
import { SchedulesService } from './services/schedules.service';

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    CalendarComponent,
    ScheduleSelectComponent,
    FilterComponent,
    DatePickerComponent,
    FilterChipsComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // some dummy calendar data
  protected readonly events = signal<CalendarEvent[]>([]);

  // the selected week
  protected readonly selectedWeek = signal<string | null>(null);

  // the selected view
  selectedView = signal<'day' | 'week'>('week');

  // whether a filter is active (to be able to remove the filter chips component from the dom and prevent excessive gap)
  protected get hasFilter() {
    return this.filterService.hasSelectedFilter;
  }

  constructor(
    private calendarService: CalendarService,
    private schedulesService: SchedulesService,
    private filterService: FilterService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.calendarService.calendarEvents$
      .pipe(
        takeUntil(this.destroy$),
        map((events) =>
          events.map((event) => ({
            title: event.course?.displayName || event.type || '',
            start: event.start,
            end: event.end,
            color: event.color
          }))
        )
      )
      .subscribe((events) => this.events.set(events));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setView(view: 'day' | 'week'): void {
    this.selectedView.set(view);
  }
}
