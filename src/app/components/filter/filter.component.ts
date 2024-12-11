import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Entity, ScheduleResponse } from '../../models/schedule.model';
import { FilterService } from '../../services/filter.service';
import { SchedulesService } from '../../services/schedules.service';

@Component({
  selector: 'app-filter',
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent implements OnInit {
  accordion = viewChild.required(MatAccordion);

  scheduleData$!: Observable<ScheduleResponse | null>;
  teachers$!: Observable<Entity[]>;
  groups$!: Observable<Entity[]>;
  locations$!: Observable<Entity[]>;

  constructor(
    private filterService: FilterService,
    private schedulesService: SchedulesService
  ) {}

  onTeacherSelect(teacher: Entity): void {
    this.filterService.setTeacher(teacher, true);
  }

  onGroupSelect(group: Entity): void {
    this.filterService.setGroup(group, true);
  }

  onLocationSelect(location: Entity): void {
    this.filterService.setLocation(location, true);
  }

  ngOnInit(): void {
    this.scheduleData$ = this.schedulesService.scheduleData$;
    this.teachers$ = this.scheduleData$.pipe(map((schedule) => schedule?.teachers || []));
    this.groups$ = this.scheduleData$.pipe(map((schedule) => schedule?.groups || []));
    this.locations$ = this.scheduleData$.pipe(map((schedule) => schedule?.locations || []));
  }
}
