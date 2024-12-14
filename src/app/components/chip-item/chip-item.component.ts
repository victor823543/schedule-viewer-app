import { Component, computed, input, output } from '@angular/core';
import { MatChipSelectionChange, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Entity, FilterOption } from '../../models/schedule.model';
import { SetFilterPayload } from '../../services/filter.service';

export type ChipAction = {
  filterOption: FilterOption;
  payload: SetFilterPayload;
};

@Component({
  selector: 'app-chip-item',
  imports: [MatChipsModule, MatIconModule],
  templateUrl: './chip-item.component.html',
  styleUrl: './chip-item.component.scss'
})
export class ChipItemComponent {
  filterOption = input.required<FilterOption>();
  active = input.required<boolean>();
  item = input.required<Entity>();
  label = computed(() => this.item()?.displayName || '');
  optionLabel = computed(() => {
    switch (this.filterOption()) {
      case FilterOption.TEACHER:
        return 'Teacher';
      case FilterOption.GROUP:
        return 'Group';
      case FilterOption.LOCATION:
        return 'Location';
      default:
        return '';
    }
  });

  chipAction = output<ChipAction>();

  onRemove(): void {
    this.chipAction.emit({
      filterOption: this.filterOption(),
      payload: { value: null, active: false }
    });
  }

  // Toggle the active state of the filter option
  onSelectionChange(event: MatChipSelectionChange): void {
    if (event.selected !== this.active()) {
      // Only emit if state actually changed
      this.chipAction.emit({
        filterOption: this.filterOption(),
        payload: { value: this.item(), active: event.selected }
      });
    }
  }
}
