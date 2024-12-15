import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-create-schedule-dialog',
  templateUrl: './create-schedule-dialog.component.html',
  styleUrl: './create-schedule-dialog.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatLabel,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class CreateScheduleDialogComponent {
  scheduleName: string = '';

  constructor(public dialogRef: MatDialogRef<CreateScheduleDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    this.dialogRef.close(this.scheduleName);
  }
}
