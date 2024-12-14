import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, filter, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import {
  Entity,
  ScheduleResponse,
  ScheduleResponseSchema,
  SchedulesResponse,
  SchedulesResponseSchema
} from '../models/schedule.model';
import { verifyResponse } from '../utils/schema.validator';
import { FilterService } from './filter.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SchedulesService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Handles the list of schedules.
  private schedulesSubject = new BehaviorSubject<SchedulesResponse>([]);
  public schedules$ = this.schedulesSubject.asObservable();
  private hasFetched = false;

  // Handles selected schedule.
  private selectedScheduleSubject: BehaviorSubject<Entity | null>;
  public selectedSchedule$: Observable<Entity | null>;

  // Handles schedule data.
  private scheduleDataSubject = new BehaviorSubject<ScheduleResponse | null>(null);
  public scheduleData$ = this.scheduleDataSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly storageService: StorageService,
    private readonly filterService: FilterService
  ) {
    // Initialize selectedScheduleSubject with value from session storage
    const storedSchedule = this.storageService.getSessionItem<Entity>('selectedSchedule');
    this.selectedScheduleSubject = new BehaviorSubject<Entity | null>(storedSchedule);
    this.selectedSchedule$ = this.selectedScheduleSubject.asObservable();

    this.selectedSchedule$
      .pipe(
        takeUntil(this.destroy$),
        filter((schedule): schedule is Entity => schedule !== null),
        switchMap((schedule) => this.http.get<ScheduleResponse>(`/schedules/${schedule.id}`)),
        verifyResponse(ScheduleResponseSchema)
      )
      .subscribe((scheduleData) => {
        console.log('Fetched schedule data:', scheduleData);
        this.scheduleDataSubject.next(scheduleData);
        this.filterService.clearEntityFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Fetches the list of schedules from the server.
   * @returns Observable of schedules.
   */
  public ensureSchedulesLoaded(): void {
    if (!this.hasFetched) {
      this.http
        .get<SchedulesResponse>('/schedules')
        .pipe(verifyResponse(SchedulesResponseSchema))
        .subscribe((schedules) => {
          this.schedulesSubject.next(schedules);
          this.hasFetched = true;
        });
    }
  }

  /**
   * Updates the selected schedule.
   */
  public setSelectedSchedule(schedule: SchedulesResponse[0] | null): void {
    console.log('Setting selected schedule:', schedule);
    this.selectedScheduleSubject.next(schedule);
    this.storageService.setSessionItem('selectedSchedule', schedule);
  }
}
