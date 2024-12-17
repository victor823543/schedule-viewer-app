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
import { Entity } from '../models/schedule.model';
import { verifyResponse } from '../utils/schema.validator';
import { DateService } from './date.service';
import { FilterService, FilterState } from './filter.service';
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
  private readonly API_ENDPOINTS = {
    CALENDAR_EVENTS: '/calendar_events',
    SCHEDULE_EVENTS: (scheduleId: string) => `/schedules/${scheduleId}/calendar_events`
  } as const;

  private readonly destroy$ = new Subject<void>();
  private readonly calendarEventsSubject = new BehaviorSubject<Event[]>([]);
  public readonly calendarEvents$: Observable<Event[]> = this.calendarEventsSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly filterService: FilterService,
    private readonly schedulesService: SchedulesService,
    private readonly dateService: DateService
  ) {
    this.initializeEventSubscription();
  }

  /**
   * Initialize the subscription for calendar events based on filters
   */
  private initializeEventSubscription(): void {
    const observables = {
      teacher: toObservable(this.filterService.teacher),
      group: toObservable(this.filterService.group),
      location: toObservable(this.filterService.location),
      week: toObservable(this.filterService.week)
    };

    combineLatest([
      this.schedulesService.selectedSchedule$,
      observables.week,
      observables.teacher,
      observables.group,
      observables.location
    ])
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        map(this.processFilters.bind(this)),
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

  /**
   * Process and validate event creation request
   */
  createEvent(event: CreateEventBody): Observable<CreateEventResponse> {
    this.validateEventData(event);

    return this.schedulesService.selectedSchedule$.pipe(
      take(1),
      switchMap((selectedSchedule) => {
        if (!selectedSchedule) {
          return throwError(() => new Error('No schedule selected'));
        }
        return this.http.post<CreateEventResponse>(this.API_ENDPOINTS.CALENDAR_EVENTS, {
          ...event,
          belongsTo: selectedSchedule.id
        });
      }),
      tap(this.updateFiltersFromResponse.bind(this))
    );
  }

  /**
   * Handle calendar event updates
   */
  handleEventChange(info: EventChangeArg): Observable<void> {
    const params = {
      start: info.event.start,
      end: info.event.end,
      duration: this.calculateDuration(info.event.start!, info.event.end!)
    };

    return this.http.put<void>(`${this.API_ENDPOINTS.CALENDAR_EVENTS}/${info.event.id}`, params);
  }

  deleteEvent(eventId: string, removeFromCalendar?: (id: string) => void): Observable<void> {
    return this.http
      .delete<void>(`${this.API_ENDPOINTS.CALENDAR_EVENTS}/${eventId}`)
      .pipe(tap(() => removeFromCalendar?.(eventId)));
  }

  // Helper methods
  private validateEventData(event: CreateEventBody): void {
    if (!event.teachers.length || !event.groups.length || !event.locations.length) {
      throw new Error('Teachers, groups, and locations are required.');
    }
    if (!event.start || !event.end || !event.duration) {
      throw new Error('Start, end, and duration are required.');
    }
    if (!(event.course || event.type)) {
      throw new Error('Either course or type must be defined.');
    }
  }

  private calculateDuration(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / 60000;
  }

  private updateFiltersFromResponse(response: CreateEventResponse): void {
    if (response.teacher) this.filterService.setTeacher(response.teacher);
    if (response.group) this.filterService.setGroup(response.group);
    if (response.location) this.filterService.setLocation(response.location);
    if (response.week) {
      this.filterService.setWeek(response.week);
      this.dateService.setDate(response.week);
    }
  }

  private processFilters([selectedSchedule, week, teacher, group, location]: [
    Entity | null,
    string | null,
    ...FilterState[]
  ]): FilterResult | null {
    const hasActiveFilters = teacher.active || group.active || location.active;
    if (!hasActiveFilters) {
      this.calendarEventsSubject.next([]);
      return null;
    }
    return { selectedSchedule, week };
  }

  private fetchEvents(
    filters: { [key: string]: string | null },
    scheduleId: string
  ): Observable<Event[]> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null) {
        params = params.set(key, value);
      }
    });

    if (!params.has('week')) {
      return throwError(() => new Error('Week parameter is required.'));
    }

    return this.http.get<Event[]>(this.API_ENDPOINTS.SCHEDULE_EVENTS(scheduleId), { params });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
