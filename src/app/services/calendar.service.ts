import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  map,
  Observable,
  of,
  switchMap,
  throwError
} from 'rxjs';
import { Event, EventsResponseSchema } from '../models/calendar.model';
import { verifyResponse } from '../utils/schema.validator';
import { FilterService } from './filter.service';
import { SchedulesService } from './schedules.service';

type FilterResult = {
  selectedSchedule: {
    id: string;
    displayName: string;
  } | null;
  week: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private calendarEventsSubject = new BehaviorSubject<Event[]>([]);
  public calendarEvents$: Observable<Event[]> = this.calendarEventsSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly filterService: FilterService,
    private schedulesService: SchedulesService
  ) {
    // Convert signals to observables
    const teacher$ = toObservable(this.filterService.teacher);
    const group$ = toObservable(this.filterService.group);
    const location$ = toObservable(this.filterService.location);
    const week$ = toObservable(this.filterService.week);

    combineLatest([this.schedulesService.selectedSchedule$, teacher$, group$, location$, week$])
      .pipe(
        debounceTime(300),
        map(([selectedSchedule, teacher, group, location, week]) => {
          const hasActiveFilters = teacher.active || group.active || location.active;
          if (!hasActiveFilters) {
            this.calendarEventsSubject.next([]);
            return null;
          }
          return { selectedSchedule, week };
        }),
        filter(
          (result): result is FilterResult =>
            result !== null && result.selectedSchedule !== null && result.week !== null
        ),
        map(({ selectedSchedule }) => ({
          filters: this.filterService.getActiveFilters(),
          selectedSchedule
        })),
        switchMap(({ filters, selectedSchedule }) =>
          this.fetchEvents(filters, selectedSchedule!.id)
        ),
        verifyResponse(EventsResponseSchema),
        catchError(() => of([]))
      )
      .subscribe((events) => this.calendarEventsSubject.next(events));
  }

  private fetchEvents(
    filters: { [key: string]: string | null },
    scheduleId: string
  ): Observable<any[]> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null) {
        params = params.set(key, value);
      }
    });

    if (!params.has('week')) {
      return throwError(() => new Error('Week parameter is required.'));
    }

    return this.http.get<Event[]>(`/schedules/${scheduleId}/calendar_events`, { params });
  }
}
