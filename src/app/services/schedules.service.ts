import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Entity, SchedulesResponse } from '../models/schedule.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SchedulesService {
  // Handles the list of schedules.
  private schedulesSubject = new BehaviorSubject<SchedulesResponse>([]);
  public schedules$ = this.schedulesSubject.asObservable();
  private hasFetched = false;

  // Handles selected schedule.
  private selectedScheduleSubject: BehaviorSubject<Entity | null>;
  public selectedSchedule$: Observable<Entity | null>;

  constructor(
    private readonly http: HttpClient,
    private readonly storageService: StorageService
  ) {
    // Initialize selectedScheduleSubject with value from session storage
    const storedSchedule = this.storageService.getSessionItem<Entity>('selectedSchedule');
    this.selectedScheduleSubject = new BehaviorSubject<Entity | null>(storedSchedule);
    this.selectedSchedule$ = this.selectedScheduleSubject.asObservable();
  }

  /**
   * Fetches the list of schedules from the server.
   * @returns Observable of schedules.
   */
  public ensureSchedulesLoaded(): void {
    if (!this.hasFetched) {
      this.http.get<SchedulesResponse>('/schedules').subscribe((schedules) => {
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
