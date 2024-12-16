import { CommonModule } from '@angular/common';
import { Component, computed, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-color-picker',
  imports: [MatMenuModule, CommonModule, MatIconModule],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss'
})
export class ColorPickerComponent {
  colors = ['#818cf8', '#f87171', '#fcd34d', '#4ade80', '#22d3ee', '#c084fc', '#f472b6', '#9ca3af'];

  colorSelected = output<string>();
  selectedColor = signal<string>('#818cf8');
  selectedStyle = computed(() => ({ 'background-color': this.selectedColor }));

  selectColor(color: string) {
    this.colorSelected.emit(color);
    this.selectedColor.set(color);
  }

  isSelected(color: string) {
    return this.selectedColor() === color;
  }
}
