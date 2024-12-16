import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CalendarService } from '../../services/calendar.service';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { EventInfoFormComponent } from '../event-info-form/event-info-form.component';
import { EventTimeFormComponent } from '../event-time-form/event-time-form.component';

@Component({
  selector: 'app-create-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    EventTimeFormComponent,
    EventInfoFormComponent,
    ColorPickerComponent
  ],
  templateUrl: './create-event-dialog.component.html',
  styleUrl: './create-event-dialog.component.scss'
})
export class CreateEventDialogComponent {
  eventTime = signal<{ start: Date; end: Date; duration: number } | null>(null);
  eventInfo = signal<{
    teachers: string[];
    groups: string[];
    locations: string[];
    courses: string[];
  } | null>(null);
  eventColor = signal<string>('#818cf8');

  constructor(
    private dialogRef: MatDialogRef<CreateEventDialogComponent>,
    private calendarService: CalendarService
  ) {}

  onTimeSelected(time: { start: Date; end: Date; duration: number }) {
    this.eventTime.set(time);
  }

  onInfoSelected(info: {
    teachers: string[];
    groups: string[];
    locations: string[];
    courses: string[];
  }) {
    this.eventInfo.set(info);
  }

  onColorSelected(color: string) {
    this.eventColor.set(color);
  }

  isValid(): boolean {
    const time = this.eventTime();
    const info = this.eventInfo();
    return !!(
      time &&
      info &&
      info.teachers.length > 0 &&
      info.groups.length > 0 &&
      info.locations.length > 0
    );
  }

  onSubmit() {
    if (!this.isValid()) return;

    const time = this.eventTime()!;
    const info = this.eventInfo()!;
    const color = this.eventColor();

    this.calendarService
      .createEvent({
        start: time.start.toISOString(),
        end: time.end.toISOString(),
        duration: time.duration,
        teachers: info.teachers,
        groups: info.groups,
        locations: info.locations,
        course: info.courses[0] || undefined,
        type: info.courses.length ? undefined : 'LUNCH',
        color
      })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (error) => console.error('Failed to create event:', error)
      });
  }
}
