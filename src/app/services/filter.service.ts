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

  constructor() {}
}
