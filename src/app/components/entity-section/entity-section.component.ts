import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { map, Observable } from 'rxjs';
import { Entity, ScheduleResponse } from '../../models/schedule.model';
import { EntityService } from '../../services/entity.service';
import { SchedulesService } from '../../services/schedules.service';
import { SearchService } from '../../services/search.service';
import { FilterSearchComponent } from '../search/search.component';

type EntityType = 'teacher' | 'group' | 'location' | 'course';

type ItemsConfig = {
  title: string;
  icon: string;
  data$: Observable<Entity[]>;
  onSearch: (term: string) => void;
  itemType: EntityType;
  cssClass?: string;
};

@Component({
  selector: 'app-entity-section',
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    FilterSearchComponent,
    MatButtonModule
  ],
  templateUrl: './entity-section.component.html',
  styleUrl: './entity-section.component.scss'
})
export class EntitySectionComponent implements OnInit {
  private readonly PANEL_CONFIGS: Record<EntityType, { title: string; icon: string }> = {
    teacher: { title: 'Teachers', icon: 'face' },
    group: { title: 'Groups', icon: 'groups' },
    location: { title: 'Locations', icon: 'location_on' },
    course: { title: 'Courses', icon: 'home' }
  };

  scheduleData$!: Observable<ScheduleResponse | null>;
  items!: ItemsConfig[];

  selectedTeachers = signal<string[]>([]);
  selectedGroups = signal<string[]>([]);
  selectedLocations = signal<string[]>([]);
  selectedCourses = signal<string[]>([]);

  private entityStreams: Record<EntityType, Observable<Entity[]>> = {} as Record<
    EntityType,
    Observable<Entity[]>
  >;

  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly searchService: SearchService,
    private readonly entityService: EntityService
  ) {}

  ngOnInit(): void {
    this.scheduleData$ = this.schedulesService.scheduleData$;
    this.initializeEntityStreams();
    this.initializeItems();
  }

  /**
   * Initialize entity data streams with search filtering
   */
  private initializeEntityStreams(): void {
    const rawData = {
      teacher: this.scheduleData$.pipe(map((schedule) => schedule?.teachers || [])),
      group: this.scheduleData$.pipe(map((schedule) => schedule?.groups || [])),
      location: this.scheduleData$.pipe(map((schedule) => schedule?.locations || [])),
      course: this.scheduleData$.pipe(
        map(
          (schedule) =>
            schedule?.courses.map((c) => ({
              id: c.id,
              displayName: c.displayName
            })) || []
        )
      )
    };

    // Apply search filtering to each entity type
    Object.entries(rawData).forEach(([type, stream]) => {
      this.entityStreams[type as EntityType] = this.searchService.filterEntities(type, stream);
    });
  }

  /**
   * Initialize panel configurations
   */
  private initializeItems(): void {
    this.items = Object.entries(this.PANEL_CONFIGS).map(([type, config]) => ({
      ...config,
      itemType: type as EntityType,
      data$: this.entityStreams[type as EntityType],
      onSearch: (term: string) => this.searchService.setSearchTerm(type, term),
      cssClass: type === 'group' || type === 'location' ? 'center' : undefined
    }));
  }

  /**
   * Handle selection changes for any entity type
   */
  onSelect(event: MatSelectionListChange, type: EntityType): void {
    const selectedValues = event.source.selectedOptions.selected.map((selected) => selected.value);
    const selectionMap: Record<EntityType, (values: string[]) => void> = {
      teacher: this.selectedTeachers.set,
      group: this.selectedGroups.set,
      location: this.selectedLocations.set,
      course: this.selectedCourses.set
    };

    selectionMap[type](selectedValues);
  }

  /**
   * Handle deletion of selected entities
   */
  onDelete(type: EntityType): void {
    const selectionMap: Record<EntityType, () => string[]> = {
      teacher: () => this.selectedTeachers(),
      group: () => this.selectedGroups(),
      location: () => this.selectedLocations(),
      course: () => this.selectedCourses()
    };

    const selectedIds = selectionMap[type]();
    this.entityService.deleteEntities({ ids: selectedIds, type }).subscribe();
  }

  /**
   * Check if there are selected items for a given entity type
   */
  hasSelectedItems(type: EntityType): boolean {
    const selectionMap: Record<EntityType, () => string[]> = {
      teacher: () => this.selectedTeachers(),
      group: () => this.selectedGroups(),
      location: () => this.selectedLocations(),
      course: () => this.selectedCourses()
    };

    return selectionMap[type]().length > 0;
  }
}
