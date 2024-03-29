import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbValidationModule } from 'mdb-angular-ui-kit/validation';

@Component({
  selector: 'app-grocery-list',
  standalone: true,
  imports: [
    CommonModule,
    MdbFormsModule,
    ReactiveFormsModule,
    MdbValidationModule,
  ],
  templateUrl: './grocery-list.component.html',
  styleUrl: './grocery-list.component.css',
})
export class GroceryListComponent implements OnInit {
  groceryListForm!: FormGroup;

  ngOnInit(): void {
    this.groceryListForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      items: new FormArray([
        new FormGroup({ name: new FormControl('', [Validators.required]) }),
      ]),
    });
  }

  getItemsArrayControls(): AbstractControl<any, any>[] {
    return (this.groceryListForm.get('items') as FormArray).controls;
  }

  addItem(): void {
    (this.groceryListForm.get('items') as FormArray).push(
      new FormArray([
        new FormGroup({ name: new FormControl('', [Validators.required]) }),
      ])
    );
  }

  deleteItem(index: number): void {
    (this.groceryListForm.get('items') as FormArray).removeAt(index);
  }
}