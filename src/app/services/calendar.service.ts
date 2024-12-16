import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { EventChangeArg } from '@fullcalendar/core/index.js';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  throwError
} from 'rxjs';
import {
  CreateEventBody,
  CreateEventResponse,
  Event,
  EventsResponseSchema
} from '../models/calendar.model';
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
export class CalendarService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
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
        takeUntil(this.destroy$),
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createEvent(event: CreateEventBody) {
    if (!event.teachers.length || !event.groups.length || !event.locations.length) {
      return throwError(() => new Error('Teachers, groups, and locations are required.'));
    }

    if (!event.start || !event.end) {
      return throwError(() => new Error('Start and end are required.'));
    }

    if (!event.duration) {
      return throwError(() => new Error('Duration is required.'));
    }

    if (!(event.course || event.type)) {
      return throwError(() => new Error('Either course or type must be defined.'));
    }

    return combineLatest([this.schedulesService.selectedSchedule$]).pipe(
      take(1),
      switchMap(([selectedSchedule]) => {
        if (!selectedSchedule) {
          return throwError(() => new Error('No schedule selected'));
        }
        return this.http.post<CreateEventResponse>('/calendar_events', {
          ...event,
          belongsTo: selectedSchedule.id
        });
      }),
      tap((response) => {
        if (response.teacher) {
          this.filterService.setTeacher(response.teacher);
        }
        if (response.group) {
          this.filterService.setGroup(response.group);
        }
        if (response.location) {
          this.filterService.setLocation(response.location);
        }
        if (response.week) {
          this.filterService.setWeek(response.week);
        }
      })
    );
  }

  handleEventChange(info: EventChangeArg) {
    const params = {
      start: info.event.start,
      end: info.event.end,
      duration: (info.event.end!.getTime() - info.event.start!.getTime()) / 60000
    };

    this.http.put(`/calendar_events/${info.event.id}`, params).subscribe();
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
