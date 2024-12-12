import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { Entity } from '../../models/schedule.model';

@Component({
  selector: 'app-dialog',
  imports: [CommonModule, MatDialogContent, MatDialogTitle],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { schedules: Entity[] }
  ) {}

  onSelect(schedule: Entity): void {
    this.dialogRef.close(schedule);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
