import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-list-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './list-dialog.component.html',
  styleUrl: './list-dialog.component.scss',
})
export class ListDialogComponent {
  selectedData: any;
  data = inject(MAT_DIALOG_DATA);
  constructor(  public dialogRef: MatDialogRef<ListDialogComponent>){

  }
  handleItemClick(item: any) {
    this.selectedData = item;
  }

   onNoClick(): void {
    console.log("this.selectedData",this.selectedData);
    this.dialogRef.close(this.selectedData);
  }
}
