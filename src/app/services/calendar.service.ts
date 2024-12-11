import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  filter,
  map,
  Observable,
  switchMap,
  throwError
} from 'rxjs';
import { Event } from '../models/calendar.model';
import { FilterService } from './filter.service';
import { SchedulesService } from './schedules.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private calendarEventsSubject = new BehaviorSubject<any[]>([]);
  public calendarEvents$ = this.calendarEventsSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly filterService: FilterService,
    private schedulesService: SchedulesService
  ) {
    // Automatically refetch data when filters change and are valid
    combineLatest([
      this.schedulesService.selectedSchedule$,
      this.filterService.teacher$,
      this.filterService.group$,
      this.filterService.location$,
      this.filterService.week$
    ])
      .pipe(
        debounceTime(300), // Avoid excessive API calls
        filter(([selectedSchedule, teacher, group, location, week]) => {
          return (
            selectedSchedule !== null &&
            week !== null &&
            (teacher.active || group.active || location.active)
          );
        }),
        map(([selectedSchedule]) => ({
          filters: this.filterService.getActiveFilters(),
          selectedSchedule
        })),
        switchMap(({ filters, selectedSchedule }) =>
          this.fetchEvents(filters, selectedSchedule!.id)
        )
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
