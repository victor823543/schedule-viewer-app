import { Component, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { combineLatest, filter, map, take } from 'rxjs';
import { CalendarComponent, CalendarEvent } from './components/calendar/calendar.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { FilterComponent } from './components/filter/filter.component';
import { ScheduleSelectComponent } from './components/schedule-select/schedule-select.component';
import { CalendarService } from './services/calendar.service';
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
    DatePickerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  // some dummy calendar data
  protected readonly events = signal<CalendarEvent[]>([]);

  // the selected week
  protected readonly selectedWeek = signal<string | null>(null);

  constructor(
    private calendarService: CalendarService,
    private schedulesService: SchedulesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.checkAndOpenDialog();

    this.calendarService.calendarEvents$
      .pipe(
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

  private checkAndOpenDialog(): void {
    this.schedulesService.ensureSchedulesLoaded();

    combineLatest([this.schedulesService.selectedSchedule$, this.schedulesService.schedules$])
      .pipe(
        filter(
          ([selectedSchedule, schedules]) => selectedSchedule === null && schedules.length > 0
        ),
        take(1)
      )
      .subscribe(([_, schedules]) => {
        const dialogRef = this.dialog.open(DialogComponent, {
          data: { schedules },
          disableClose: true,
          minHeight: '300px',
          minWidth: '300px'
        });

        dialogRef.afterClosed().subscribe((selectedItem) => {
          if (selectedItem) {
            this.schedulesService.setSelectedSchedule(selectedItem);
          } else {
            console.warn('No item selected!');
          }
        });
      });
  }
}
