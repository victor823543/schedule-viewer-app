import { computed, effect, Injectable, signal } from '@angular/core';
import {
  addDays,
  addWeeks,
  format,
  isSaturday,
  isSunday,
  startOfWeek,
  subDays,
  subWeeks
} from 'date-fns';
import { FilterService } from './filter.service';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  // Signal for storing the currently selected date.
  private selectedDate = signal(this.getStoredDate());

  // Get the selected day in YYYY-MM-DD format.
  readonly selectedDay = computed(() => this.formatDate(this.selectedDate()));

  // Get the first day of the selected week in YYYY-MM-DD format.
  readonly startOfWeek = computed(() => {
    const weekStart = startOfWeek(this.selectedDate(), { weekStartsOn: 1 });
    return this.formatDate(weekStart);
  });

  constructor(private filterService: FilterService) {
    // Store date on change.
    effect(() => {
      this.storeDate(this.selectedDate());
    });

    // Set the week in the filter service on change.
    effect(() => {
      this.filterService.setWeek(this.startOfWeek());
    });
  }

  // Functions for changing day
  setDate(date: string): void {
    let newDate = new Date(date);
    // Go back to Friday if the date is Saturday or Sunday.
    if (isSaturday(newDate)) {
      newDate = subDays(newDate, 1);
    } else if (isSunday(newDate)) {
      newDate = subDays(newDate, 2);
    }
    this.selectedDate.set(newDate);
  }

  goToPreviousDay(): void {
    this.selectedDate.update((date) => {
      let newDate = subDays(date, 1);
      // Skip to Friday if it's Sunday.
      if (isSunday(newDate)) {
        newDate = subDays(newDate, 2);
      }
      return newDate;
    });
  }

  goToNextDay(): void {
    this.selectedDate.update((date) => {
      let newDate = addDays(date, 1);
      // Skip to Monday if it's Saturday.
      if (isSaturday(newDate)) {
        newDate = addDays(newDate, 2);
      }
      return newDate;
    });
  }

  // Functions for changing week
  goToPreviousWeek(): void {
    this.selectedDate.update((date) => subWeeks(date, 1));
  }

  goToNextWeek(): void {
    this.selectedDate.update((date) => addWeeks(date, 1));
  }

  // Format a date as YYYY-MM-DD.
  public formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  private getStoredDate(): Date {
    const storedDate = sessionStorage.getItem('selectedDate');
    return storedDate ? new Date(storedDate) : new Date();
  }

  private storeDate(date: Date): void {
    sessionStorage.setItem('selectedDate', this.formatDate(date));
  }
}
