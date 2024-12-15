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
import { SearchService } from '../../services/search.service';
import { FilterSearchComponent } from '../search/search.component';

// Configuration type for filter panels
type FilterConfig = {
  title: string;
  icon: string;
  data$: Observable<Entity[]>;
  onSelect: (item: Entity) => void;
  onSearch: (term: string) => void;
  cssClass?: string;
};

@Component({
  selector: 'app-filter',
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    FilterSearchComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent implements OnInit {
  // Reference to expansion panel accordion
  accordion = viewChild.required(MatAccordion);

  // Streams of filtered data
  scheduleData$!: Observable<ScheduleResponse | null>;
  teachers$!: Observable<Entity[]>;
  groups$!: Observable<Entity[]>;
  locations$!: Observable<Entity[]>;

  // Configuration for all filter panels
  filters!: FilterConfig[];

  constructor(
    private filterService: FilterService,
    private schedulesService: SchedulesService,
    private searchService: SearchService
  ) {}

  // Filter selection handlers
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
    // Initialize data streams
    this.scheduleData$ = this.schedulesService.scheduleData$;

    // Extract raw entities from schedule data
    const rawTeachers$ = this.scheduleData$.pipe(map((schedule) => schedule?.teachers || []));
    const rawGroups$ = this.scheduleData$.pipe(map((schedule) => schedule?.groups || []));
    const rawLocations$ = this.scheduleData$.pipe(map((schedule) => schedule?.locations || []));

    // Apply search filtering to raw entities
    this.teachers$ = this.searchService.filterEntities('teachers', rawTeachers$);
    this.groups$ = this.searchService.filterEntities('groups', rawGroups$);
    this.locations$ = this.searchService.filterEntities('locations', rawLocations$);

    // Filter panel configuration
    this.filters = [
      {
        title: 'Teachers',
        icon: 'face',
        data$: this.teachers$,
        onSelect: (teacher) => this.onTeacherSelect(teacher),
        onSearch: (term: string) => this.searchService.setSearchTerm('teachers', term)
      },
      {
        title: 'Groups',
        icon: 'groups',
        data$: this.groups$,
        onSelect: (group) => this.onGroupSelect(group),
        onSearch: (term: string) => this.searchService.setSearchTerm('groups', term),
        cssClass: 'center'
      },
      {
        title: 'Locations',
        icon: 'location_on',
        data$: this.locations$,
        onSelect: (location) => this.onLocationSelect(location),
        onSearch: (term: string) => this.searchService.setSearchTerm('locations', term)
      }
    ];
  }
}
