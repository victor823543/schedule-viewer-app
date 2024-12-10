import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Entity, SchedulesResponse } from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class SchedulesService {
  // Handles the list of schedules.
  private schedulesSubject = new BehaviorSubject<SchedulesResponse>([]);
  public schedules$ = this.schedulesSubject.asObservable();
  private hasFetched = false;

  // Handles selected schedule.
  private selectedScheduleSubject = new BehaviorSubject<Entity | null>(null);
  public selectedSchedule$ = this.selectedScheduleSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

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
  }
}
