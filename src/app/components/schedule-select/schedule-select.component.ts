import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import { Entity, SchedulesResponse } from '../../models/schedule.model';
import { SchedulesService } from '../../services/schedules.service';

@Component({
  selector: 'app-schedule-select',
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, CommonModule],
  templateUrl: './schedule-select.component.html',
  styleUrl: './schedule-select.component.scss'
})
export class ScheduleSelectComponent implements OnInit {
  schedules$!: Observable<SchedulesResponse>;

  selectedSchedule: Entity | null = null;

  constructor(private schedulesService: SchedulesService) {}

  ngOnInit() {
    this.schedulesService.ensureSchedulesLoaded(); // Triggers fetch if not already done
    this.schedules$ = this.schedulesService.schedules$;
    this.schedulesService.selectedSchedule$.subscribe((schedule) => {
      this.selectedSchedule = schedule;
    });
  }

  onScheduleSelect(scheduleId: string): void {
    console.log('Selected schedule:', scheduleId);
    this.schedules$.subscribe((schedules) => {
      const selected = schedules.find((schedule) => schedule.id === scheduleId) || null;
      this.schedulesService.setSelectedSchedule(selected);
    });
  }
}
