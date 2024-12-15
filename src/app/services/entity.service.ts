import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CreateEntityBody, DeleteEntitiesBody, Entity } from '../models/schedule.model';
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
export class EntityService implements OnInit, OnDestroy {
  private subscription!: Subscription;

  private selectedSchedule: Entity | null = null;

  constructor(
    private http: HttpClient,
    private schedulesService: SchedulesService
  ) {}

  ngOnInit(): void {
    this.subscription = this.schedulesService.selectedSchedule$.subscribe((schedule) => {
      this.selectedSchedule = schedule;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createEntity(params: CreateEntityParams) {
    if (!this.selectedSchedule) {
      throw new Error('No schedule selected');
    }

    let body: CreateEntityBody;

    if (params.type === 'course') {
      body = {
        displayName: params.displayName,
        category: params.type,
        subject: params.subject || '',
        schedule: this.selectedSchedule.id
      };
    } else {
      body = {
        displayName: params.displayName,
        category: params.type,
        schedule: this.selectedSchedule.id
      };
    }

    return this.http.post('/api/entities', body).pipe(
      tap(() => {
        this.schedulesService.refetchSelectedSchedule();
      })
    );
  }

  deleteEntities(params: DeleteEntitiesParams) {
    if (!this.selectedSchedule) {
      throw new Error('No schedule selected');
    }

    const body: DeleteEntitiesBody = {
      ids: params.ids,
      category: params.type,
      schedule: this.selectedSchedule.id
    };
    return this.http.post('/api/entities/delete', body).pipe(
      tap(() => {
        this.schedulesService.refetchSelectedSchedule();
      })
    );
  }
}
