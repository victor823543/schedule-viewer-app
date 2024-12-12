import { CommonModule, DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameWeek,
  startOfMonth,
  startOfWeek
} from 'date-fns';

@Component({
  selector: 'app-calendar-select',
  templateUrl: './calendar-select.component.html',
  styleUrls: ['./calendar-select.component.scss'],
  imports: [DatePipe, CommonModule, MatIconModule, MatButtonModule]
})
export class CalendarSelectComponent {
  view = input<'day' | 'week'>('week');
  selectedDate = input<Date>(new Date());
  // Emits the start date of the selected week if the view is set to 'week', otherwise emits the selected date.
  dateSelected = output<Date>();

  currentMonth: Date = new Date();
  daysInMonth: Date[] = [];

  constructor() {
    this.calculateDaysInMonth();
  }

  // Calculates all days in the current month for rendering the calendar.
  calculateDaysInMonth(): void {
    const start = startOfWeek(startOfMonth(this.currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(this.currentMonth), { weekStartsOn: 1 });
    this.daysInMonth = eachDayOfInterval({ start, end });
  }

  previousMonth(): void {
    this.currentMonth = addMonths(this.currentMonth, -1);
    this.calculateDaysInMonth();
  }

  nextMonth(): void {
    this.currentMonth = addMonths(this.currentMonth, 1);
    this.calculateDaysInMonth();
  }

  // Should select the first day of the week if the view is set to 'week'.
  selectDate(week: Date): void {
    this.dateSelected.emit(week);
  }

  isWeekSelected(week: Date): boolean {
    return isSameWeek(week, this.selectedDate(), { weekStartsOn: 1 });
  }

  isDaySelected(day: Date): boolean {
    return day.toDateString() === this.selectedDate().toDateString();
  }

  getWeeksInMonth(): Date[][] {
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    this.daysInMonth.forEach((day) => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    return weeks;
  }

  // Checks if a given day is in the currently selected week.
  isDayInSelectedWeek(day: Date): boolean {
    return isSameWeek(day, this.selectedDate(), { weekStartsOn: 1 });
  }
}
