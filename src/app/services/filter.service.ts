import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Entity } from '../models/schedule.model';

type FilterState = {
  value: Entity | null;
  active: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filters = {
    teacher: new BehaviorSubject<FilterState>({ value: null, active: false }),
    group: new BehaviorSubject<FilterState>({ value: null, active: false }),
    location: new BehaviorSubject<FilterState>({ value: null, active: false }),
    week: new BehaviorSubject<string | null>(null)
  };

  // Functions to get the observables for each filter
  get teacher$(): Observable<FilterState> {
    return this.filters.teacher.asObservable();
  }

  get group$(): Observable<FilterState> {
    return this.filters.group.asObservable();
  }

  get location$(): Observable<FilterState> {
    return this.filters.location.asObservable();
  }

  get week$(): Observable<string | null> {
    return this.filters.week.asObservable();
  }

  // Functions to set the filter values
  setTeacher(value: Entity | null, active: boolean = true): void {
    this.filters.teacher.next({ value, active });
  }

  setGroup(value: Entity | null, active: boolean = true): void {
    this.filters.group.next({ value, active });
  }

  setLocation(value: Entity | null, active: boolean = true): void {
    this.filters.location.next({ value, active });
  }

  setWeek(week: string | null): void {
    this.filters.week.next(week);
  }

  // Function to get filter values prepared for fetching data
  getActiveFilters(): { [key: string]: string | null } {
    const activeFilters: { [key: string]: string | null } = {};
    if (this.filters.teacher.value.active && this.filters.teacher.value.value) {
      activeFilters['teachers'] = this.filters.teacher.value.value.id;
    }
    if (this.filters.group.value.active && this.filters.group.value.value) {
      activeFilters['groups'] = this.filters.group.value.value.id;
    }
    if (this.filters.location.value.active && this.filters.location.value.value) {
      activeFilters['inLocations'] = this.filters.location.value.value.id;
    }
    activeFilters['week'] = this.filters.week.value;
    return activeFilters;
  }
}
