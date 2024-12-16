import { CommonModule } from '@angular/common';
import { Component, OnInit, output, QueryList, signal, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { map, Observable } from 'rxjs';
import { Entity, ScheduleResponse } from '../../models/schedule.model';
import { SchedulesService } from '../../services/schedules.service';
import { SearchService } from '../../services/search.service';
import { FilterSearchComponent } from '../search/search.component';

type ItemsConfig = {
  title: string;
  icon: string;
  data$: Observable<Entity[]>;
  onSearch: (term: string) => void;
  itemType: 'teacher' | 'group' | 'location' | 'course';
  cssClass?: string;
};

type InfoFormOutput = {
  teachers: string[];
  groups: string[];
  locations: string[];
  courses: string[];
};

@Component({
  selector: 'app-event-info-form',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    FilterSearchComponent,
    MatButtonModule
  ],
  templateUrl: './event-info-form.component.html',
  styleUrl: './event-info-form.component.scss'
})
export class EventInfoFormComponent implements OnInit {
  @ViewChildren(MatSelectionList) selectionLists!: QueryList<MatSelectionList>;
  infoFormOutput = output<InfoFormOutput>();

  scheduleData$!: Observable<ScheduleResponse | null>;
  teachers$!: Observable<Entity[]>;
  groups$!: Observable<Entity[]>;
  locations$!: Observable<Entity[]>;
  courses$!: Observable<Entity[]>;

  items!: ItemsConfig[];

  selectedTeachers = signal<string[]>([]);
  selectedGroups = signal<string[]>([]);
  selectedLocations = signal<string[]>([]);
  selectedCourses = signal<string[]>([]);

  constructor(
    private schedulesService: SchedulesService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.scheduleData$ = this.schedulesService.scheduleData$;

    // Extract raw entities from schedule data
    const rawTeachers$ = this.scheduleData$.pipe(map((schedule) => schedule?.teachers || []));
    const rawGroups$ = this.scheduleData$.pipe(map((schedule) => schedule?.groups || []));
    const rawLocations$ = this.scheduleData$.pipe(map((schedule) => schedule?.locations || []));
    const rawCourses$ = this.scheduleData$.pipe(
      map(
        (schedule) =>
          schedule?.courses.map((c) => ({
            id: c.id,
            displayName: c.displayName
          })) || []
      )
    );

    // Apply search filtering to raw entities
    this.teachers$ = this.searchService.filterEntities('teachers', rawTeachers$);
    this.groups$ = this.searchService.filterEntities('groups', rawGroups$);
    this.locations$ = this.searchService.filterEntities('locations', rawLocations$);
    this.courses$ = this.searchService.filterEntities('courses', rawCourses$);

    this.items = [
      {
        title: 'Teachers',
        itemType: 'teacher',
        icon: 'face',
        data$: this.teachers$,
        onSearch: (term: string) => this.searchService.setSearchTerm('teachers', term)
      },
      {
        title: 'Groups',
        itemType: 'group',
        icon: 'groups',
        data$: this.groups$,
        onSearch: (term: string) => this.searchService.setSearchTerm('groups', term),
        cssClass: 'center'
      },
      {
        title: 'Locations',
        itemType: 'location',
        icon: 'location_on',
        data$: this.locations$,
        onSearch: (term: string) => this.searchService.setSearchTerm('locations', term),
        cssClass: 'center'
      },
      {
        title: 'Courses',
        itemType: 'course',
        icon: 'home',
        data$: this.courses$,
        onSearch: (term: string) => this.searchService.setSearchTerm('courses', term)
      }
    ];
  }

  onSelect(event: MatSelectionListChange, type: 'teacher' | 'group' | 'location' | 'course') {
    switch (type) {
      case 'teacher':
        this.selectedTeachers.set(
          event.source.selectedOptions.selected.map((selected) => selected.value)
        );
        break;
      case 'group':
        this.selectedGroups.set(
          event.source.selectedOptions.selected.map((selected) => selected.value)
        );
        break;
      case 'location':
        this.selectedLocations.set(
          event.source.selectedOptions.selected.map((selected) => selected.value)
        );
        break;
      case 'course':
        this.selectedCourses.set(
          event.source.selectedOptions.selected.map((selected) => selected.value)
        );
        break;
    }

    this.infoFormOutput.emit({
      teachers: this.selectedTeachers(),
      groups: this.selectedGroups(),
      locations: this.selectedLocations(),
      courses: this.selectedCourses()
    });
  }

  clearCourses() {
    const coursesList = this.selectionLists.find((list) =>
      list._items.some((item) => this.selectedCourses().includes(item.value))
    );
    if (coursesList) {
      coursesList.deselectAll();
      this.selectedCourses.set([]);
      this.infoFormOutput.emit({
        teachers: this.selectedTeachers(),
        groups: this.selectedGroups(),
        locations: this.selectedLocations(),
        courses: []
      });
    }
  }
}
