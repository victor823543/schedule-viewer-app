import { computed, Injectable, signal, Signal } from '@angular/core';
import { Entity } from '../models/schedule.model';

export type FilterState = {
  value: Entity | null;
  active: boolean;
};

export type SetFilterPayload = {
  value: Entity | null;
  active?: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  // If value is null, the filter is not selected. If active is false, the filter is not applied to the query.
  private readonly teacherFilter = signal<FilterState>({ value: null, active: false });
  private readonly groupFilter = signal<FilterState>({ value: null, active: false });
  private readonly locationFilter = signal<FilterState>({ value: null, active: false });
  private readonly weekFilter = signal<string | null>(null);

  // Readonly signals
  readonly teacher: Signal<FilterState> = this.teacherFilter.asReadonly();
  readonly group: Signal<FilterState> = this.groupFilter.asReadonly();
  readonly location: Signal<FilterState> = this.locationFilter.asReadonly();
  readonly week: Signal<string | null> = this.weekFilter.asReadonly();

  // Whether any filter is selected
  readonly hasSelectedFilter: Signal<boolean> = computed(() => {
    return [this.teacherFilter(), this.groupFilter(), this.locationFilter()].some(
      (filter) => filter.value !== null
    );
  });

  setTeacher(value: Entity | null, active: boolean = true): void {
    this.teacherFilter.set({ value, active });
  }

  setGroup(value: Entity | null, active: boolean = true): void {
    this.groupFilter.set({ value, active });
  }

  setLocation(value: Entity | null, active: boolean = true): void {
    this.locationFilter.set({ value, active });
  }

  clearEntityFilters(): void {
    this.teacherFilter.set({ value: null, active: false });
    this.groupFilter.set({ value: null, active: false });
    this.locationFilter.set({ value: null, active: false });
  }

  setWeek(week: string | null): void {
    this.weekFilter.set(week);
  }

  // Get the active filters as an object that can be used in the calendar events query
  getActiveFilters(): { [key: string]: string | null } {
    const activeFilters: { [key: string]: string | null } = {};
    const teacher = this.teacherFilter();
    const group = this.groupFilter();
    const location = this.locationFilter();

    if (teacher.active && teacher.value) {
      activeFilters['teachers'] = teacher.value.id;
    }
    if (group.active && group.value) {
      activeFilters['groups'] = group.value.id;
    }
    if (location.active && location.value) {
      activeFilters['inLocations'] = location.value.id;
    }
    activeFilters['week'] = this.weekFilter();
    return activeFilters;
  }
}
