import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CreateEntityBody, Entity } from '../models/schedule.model';
import { SchedulesService } from './schedules.service';

type CreateEntityParams = {
  type: 'teacher' | 'group' | 'location' | 'course';
  displayName: string;
  subject?: string;
};

type DeleteEntitiesParams = {
  ids: string[];
  type: 'teacher' | 'group' | 'location' | 'course';
};

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private selectedSchedule: Entity | null = null;

  constructor(
    private http: HttpClient,
    private schedulesService: SchedulesService
  ) {
    this.schedulesService.selectedSchedule$.subscribe((schedule) => {
      this.selectedSchedule = schedule;
    });
  }

  createEntity(params: CreateEntityParams) {
    if (!this.selectedSchedule) {
      throw new Error('No schedule selected');
    }

    if (params.type === 'course') {
      const body: CreateEntityBody = {
        displayName: params.displayName,
        category: params.type,
        subject: params.subject || '',
        schedule: this.selectedSchedule.id
      };

      return this.http.post('/courses', body).pipe(
        tap(() => {
          this.schedulesService.refetchSelectedSchedule();
        })
      );
    } else {
      const body: CreateEntityBody = {
        displayName: params.displayName,
        category: params.type,
        schedule: this.selectedSchedule.id
      };

      return this.http.post('/entities', body).pipe(
        tap(() => {
          this.schedulesService.refetchSelectedSchedule();
        })
      );
    }
  }

  deleteEntities(params: DeleteEntitiesParams) {
    if (!this.selectedSchedule) {
      throw new Error('No schedule selected');
    }

    if (!params.ids.length) {
      throw new Error('No ids provided');
    }

    if (params.type === 'course') {
      const query = new HttpParams()
        .set('ids', params.ids.join(','))
        .set('schedule', this.selectedSchedule.id);

      return this.http.delete<void>('/courses/delete-many', { params: query }).pipe(
        tap(() => {
          this.schedulesService.refetchSelectedSchedule();
        })
      );
    } else {
      const query = new HttpParams()
        .set('ids', params.ids.join(','))
        .set('category', params.type)
        .set('schedule', this.selectedSchedule.id);

      return this.http.delete<void>('/entities/delete-many', { params: query }).pipe(
        tap(() => {
          this.schedulesService.refetchSelectedSchedule();
        })
      );
    }
  }
}
