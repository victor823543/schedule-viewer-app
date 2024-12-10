import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SchedulesResponse } from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class SchedulesService {
  // Handles the list of schedules.
  private schedulesSubject = new BehaviorSubject<SchedulesResponse>([]);
  public schedules$ = this.schedulesSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetches the list of schedules from the server.
   * @returns Observable of schedules.
   */
  public getSchedules(): Observable<SchedulesResponse> {
    return this.http
      .get<SchedulesResponse>('/schedules')
      .pipe(tap((schedules) => this.schedulesSubject.next(schedules)));
  }
}
