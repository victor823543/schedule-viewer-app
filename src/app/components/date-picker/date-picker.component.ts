import { Component, effect, input, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { getISOWeek } from 'date-fns';
import { DateService } from '../../services/date.service';
import { CalendarSelectComponent } from '../calendar-select/calendar-select.component';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  imports: [MatButtonModule, MatIconModule, MatMenuModule, CalendarSelectComponent]
})
export class DatePickerComponent implements OnInit {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  view = input<'day' | 'week'>('week');

  selectedDate!: Date; // Holds the selected date
  selectedDateFormatted!: string; // Holds the selected date in YYYY-MM-DD format
  displayValue!: string; // Holds the value to be displayed based on the view

  constructor(public dateService: DateService) {
    effect(() => {
      this.updateDisplayValue();
    });
  }

  ngOnInit(): void {
    this.updateDisplayValue();
  }

  // Updates the displayed value based on the current view (day or week).
  updateDisplayValue(): void {
    const currentDate = this.dateService.selectedDay();
    this.selectedDateFormatted = currentDate;
    this.selectedDate = new Date(currentDate);

    if (this.view() === 'week') {
      const weekNumber = getISOWeek(new Date(currentDate));
      this.displayValue = `Week ${weekNumber}`;
    } else {
      this.displayValue = currentDate;
    }
  }

  // Go to the previous day or week based on the current view.
  onPrevious(): void {
    if (this.view() === 'week') {
      this.dateService.goToPreviousWeek();
    } else {
      this.dateService.goToPreviousDay();
    }
    this.updateDisplayValue();
  }

  // Go to the next day or week based on the current view.
  onNext(): void {
    if (this.view() === 'week') {
      this.dateService.goToNextWeek();
    } else {
      this.dateService.goToNextDay();
    }
    this.updateDisplayValue();
  }

  onSelectDate(date: Date): void {
    const formattedDate = this.dateService.formatDate(date);
    this.dateService.setDate(formattedDate);
    this.updateDisplayValue();
    this.menuTrigger.closeMenu();
  }
}
