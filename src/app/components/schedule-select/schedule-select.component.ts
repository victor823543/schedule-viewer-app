import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import { Entity, SchedulesResponse } from '../../models/schedule.model';
import { SchedulesService } from '../../services/schedules.service';

@Component({
  selector: 'app-schedule-select',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './schedule-select.component.html',
  styleUrl: './schedule-select.component.scss',
  animations: [
    trigger('dropdownAnimation', [
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'scaleY(0)',
          transformOrigin: 'top'
        })
      ),
      state(
        'open',
        style({
          opacity: 1,
          transform: 'scaleY(1)',
          transformOrigin: 'top'
        })
      ),
      transition('closed <=> open', [animate('200ms ease-in-out')])
    ])
  ]
})
export class ScheduleSelectComponent implements OnInit, OnDestroy {
  schedules$!: Observable<SchedulesResponse>;

  selectedSchedule: Entity | null = null;

  dropdownOpen = signal<boolean>(false);
  private subscription: any;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  constructor(
    private schedulesService: SchedulesService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.schedulesService.ensureSchedulesLoaded();
    this.schedules$ = this.schedulesService.schedules$;
    this.subscription = this.schedulesService.selectedSchedule$.subscribe((schedule) => {
      this.selectedSchedule = schedule;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  toggleDropdown(): void {
    this.dropdownOpen.update((prev) => !prev);
  }

  onScheduleSelect(scheduleId: string): void {
    this.closeDropdown();
    this.schedules$.subscribe((schedules) => {
      const selected = schedules.find((schedule) => schedule.id === scheduleId) || null;
      this.schedulesService.setSelectedSchedule(selected);
    });
  }
}
