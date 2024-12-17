import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Entity } from '../models/schedule.model';
import { SchedulesService } from './schedules.service';

// Valid entity types for the application
type EntityType = 'teacher' | 'group' | 'location' | 'course';

type CreateEntityParams = {
  type: EntityType;
  displayName: string;
  subject?: string;
};

type CreateEntityBody = {
  displayName: string;
  category: EntityType;
  schedule: string;
  subject?: string;
};

type DeleteEntitiesParams = {
  ids: string[];
  type: EntityType;
};

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private readonly COURSES_PATH = '/courses';
  private readonly ENTITIES_PATH = '/entities';
  private selectedSchedule: Entity | null = null;

  constructor(
    private http: HttpClient,
    private schedulesService: SchedulesService
  ) {
    this.schedulesService.selectedSchedule$.subscribe((schedule) => {
      this.selectedSchedule = schedule;
    });
  }

  /**
   * Creates a new entity (course or other type) in the selected schedule
   * @throws Error when no schedule is selected
   */
  createEntity(params: CreateEntityParams): Observable<any> {
    if (!this.selectedSchedule) {
      throw new Error('No schedule selected');
    }

    const baseBody: CreateEntityBody = {
      displayName: params.displayName,
      category: params.type,
      schedule: this.selectedSchedule.id
    };

    // Adding subject field only for courses
    const body =
      params.type === 'course' ? { ...baseBody, subject: params.subject || '' } : baseBody;

    const endpoint = params.type === 'course' ? this.COURSES_PATH : this.ENTITIES_PATH;

    return this.http
      .post(endpoint, body)
      .pipe(tap(() => this.schedulesService.refetchSelectedSchedule()));
  }

  /**
   * Deletes multiple entities of the same type
   * @throws Error when no schedule is selected or no ids provided
   */
  deleteEntities(params: DeleteEntitiesParams): Observable<void> {
    if (!this.selectedSchedule || !params.ids.length) {
      throw new Error(params.ids.length ? 'No schedule selected' : 'No ids provided');
    }

    const baseQuery = new HttpParams()
      .set('ids', params.ids.join(','))
      .set('schedule', this.selectedSchedule.id);

    const query = params.type === 'course' ? baseQuery : baseQuery.set('category', params.type);

    const endpoint = `${params.type === 'course' ? this.COURSES_PATH : this.ENTITIES_PATH}/delete-many`;

    return this.http
      .delete<void>(endpoint, { params: query })
      .pipe(tap(() => this.schedulesService.refetchSelectedSchedule()));
  }
}
