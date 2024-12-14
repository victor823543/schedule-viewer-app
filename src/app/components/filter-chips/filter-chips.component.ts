import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { Entity, FilterOption } from '../../models/schedule.model';
import { FilterService } from '../../services/filter.service';
import { ChipAction, ChipItemComponent } from '../chip-item/chip-item.component';

@Component({
  selector: 'app-filter-chips',
  imports: [MatChipsModule, ChipItemComponent, CommonModule],
  templateUrl: './filter-chips.component.html',
  styleUrl: './filter-chips.component.scss'
})
export class FilterChipsComponent {
  // Convert the filter options to an array of objects that can be used in the template
  filterOptions = computed(() => {
    let options: { option: FilterOption; value: Entity; active: boolean }[] = [];
    const teacher = this.filterService.teacher();
    const group = this.filterService.group();
    const location = this.filterService.location();

    if (teacher.value) {
      options.push({
        option: FilterOption.TEACHER,
        value: teacher.value,
        active: teacher.active
      });
    }
    if (group.value) {
      options.push({
        option: FilterOption.GROUP,
        value: group.value,
        active: group.active
      });
    }
    if (location.value) {
      options.push({
        option: FilterOption.LOCATION,
        value: location.value,
        active: location.active
      });
    }
    return options;
  });

  constructor(private filterService: FilterService) {}

  handleChipAction(action: ChipAction): void {
    switch (action.filterOption) {
      case FilterOption.TEACHER:
        this.filterService.setTeacher(action.payload.value, action.payload.active);
        break;
      case FilterOption.GROUP:
        this.filterService.setGroup(action.payload.value, action.payload.active);
        break;
      case FilterOption.LOCATION:
        this.filterService.setLocation(action.payload.value, action.payload.active);
        break;
    }
  }
}
