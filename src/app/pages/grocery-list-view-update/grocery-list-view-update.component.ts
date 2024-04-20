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
import {
  GroceryListService,
  UserGroceryListItemResponse,
  UserGroceryListResponse,
  UserGroceryListSummaryExportResponse,
} from '../../services/grocery-list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentEditableDirective } from '../../directives/content-editable.directive';
import { map } from 'rxjs';

interface MeasurementUnit {
  id: string;
  value: 'Unit' | 'Kilogram' | 'Gram';
}

interface UserGroceryListFormItemsFormGroupChangeActions {
  added: FormGroup[];
  deleted: FormGroup[];
  modified: FormGroup[];
}

@Component({
  selector: 'app-grocery-list-view-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ContentEditableDirective],
  templateUrl: './grocery-list-view-update.component.html',
  styleUrl: './grocery-list-view-update.component.css',
})
export class GroceryListViewUpdateComponent implements OnInit {
  measurementUnits: MeasurementUnit[] = [
    { id: '1', value: 'Unit' },
    { id: '2', value: 'Kilogram' },
    { id: '3', value: 'Gram' },
  ];

  id: string | null | undefined;

  groceryListForm!: FormGroup;

  groceryListFormStatus:
    | 'NotSubmitted'
    | 'Submitted'
    | 'SubmissionError'
    | 'InProgress' = 'NotSubmitted';

  groceryListFormMessage!: string;

  userGroceryListSummaryExportStatus: 'NotExported' | 'Exported' =
    'NotExported';

  userGroceryListFormItemsFormGroupChangeActions: UserGroceryListFormItemsFormGroupChangeActions =
    {
      added: [],
      deleted: [],
      modified: [],
    };

  constructor(
    private route: ActivatedRoute,
    private groceryListService: GroceryListService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.url[1].path;

    this.groceryListService.getUserGroceryList(this.id).subscribe({
      next: (response: UserGroceryListResponse) => {
        this.groceryListForm = new FormGroup({
          name: new FormControl(response.name, [Validators.required]),
          description: new FormControl(response.description),
          totalPrice: new FormControl(response.total_price),
          items: new FormArray([]),
        });

        this.groceryListService
          .getUserGroceryListItems(response.id)
          .pipe(
            map((response: UserGroceryListItemResponse[]) => {
              return response.map((item) => {
                return new FormGroup({
                  name: new FormControl(item.name, [Validators.required]),
                  description: new FormControl(item.description),
                  rateMeasurementQuantity: new FormControl(
                    item.rate_measurement_quantity,
                    [Validators.required]
                  ),
                  rateMeasurementUnit: new FormControl(
                    this.measurementUnits.find(
                      (obj) => obj.value === item.rate_measurement_unit
                    )!.id,
                    [Validators.required]
                  ),
                  rate: new FormControl(item.rate, [Validators.required]),
                  quantityMeasurementUnit: new FormControl(
                    this.measurementUnits.find(
                      (obj) => obj.value === item.quantity_measurement_unit
                    )!.id,
                    [Validators.required]
                  ),
                  quantity: new FormControl(item.quantity, [
                    Validators.required,
                  ]),
                  pricerice: new FormControl(item.price, [
                    Validators.required,
                  ]),
                });
              });
            })
          )
          .subscribe({
            next: (formGroups: FormGroup[]) => {
              if (this.groceryListForm) {
                formGroups.forEach((formGroup) =>
                  (this.groceryListForm.get('items') as FormArray).push(
                    formGroup
                  )
                );
              }
            },
            error: (err) => {
              this.groceryListFormStatus = 'SubmissionError';
              this.groceryListFormMessage =
                'Apologies, there seems to be a technical issue. Our team is working on it. Please try again later. Thank you for your understanding.';
            },
          });
      },
      error: (err) => {
        this.groceryListFormStatus = 'SubmissionError';
        this.groceryListFormMessage =
          'Apologies, there seems to be a technical issue. Our team is working on it. Please try again later. Thank you for your understanding.';
      },
    });
  }

  getItemsArrayControls(): AbstractControl<any, any>[] {
    return (this.groceryListForm.get('items') as FormArray).controls;
  }

  addUserGroceryListItem(): void {
    (this.groceryListForm.get('items') as FormArray).push(
      new FormGroup({
        name: new FormControl('', [Validators.required]),
        description: new FormControl(''),
        rateMeasurementQuantity: new FormControl(0, [Validators.required]),
        rateMeasurementUnit: new FormControl('1', [Validators.required]),
        rate: new FormControl(0, [Validators.required]),
        quantityMeasurementUnit: new FormControl('1', [Validators.required]),
        quantity: new FormControl(0, [Validators.required]),
        price: new FormControl(0, [Validators.required]),
      })
    );
  }

  deleteItem(index: number): void {
    if (this.id) {
      this.userGroceryListFormItemsFormGroupChangeActions.deleted.push(
        (this.groceryListForm.controls['items'] as FormArray).controls[
          index
        ] as FormGroup
      );
    }

    (this.groceryListForm.get('items') as FormArray).removeAt(index);
  }

  updateItemPrice(index: number): void {
    const oldTotalPrice = this.groceryListForm.controls['totalPrice'].value;

    const oldPrice = (
      (this.groceryListForm.controls['items'] as FormArray).controls[
        index
      ] as FormGroup
    ).controls['price'].value;

    const newPrice = this.groceryListService.getItemPrice(
      (
        (this.groceryListForm.controls['items'] as FormArray).controls[
          index
        ] as FormGroup
      ).controls['rateMeasurementQuantity'].value,
      this.measurementUnits.find(
        (obj) =>
          obj.id ===
          (
            (this.groceryListForm.controls['items'] as FormArray).controls[
              index
            ] as FormGroup
          ).controls['rateMeasurementUnit'].value
      )!.value,
      (
        (this.groceryListForm.controls['items'] as FormArray).controls[
          index
        ] as FormGroup
      ).controls['rate'].value,
      this.measurementUnits.find(
        (obj) =>
          obj.id ===
          (
            (this.groceryListForm.controls['items'] as FormArray).controls[
              index
            ] as FormGroup
          ).controls['quantityMeasurementUnit'].value
      )!.value,
      (
        (this.groceryListForm.controls['items'] as FormArray).controls[
          index
        ] as FormGroup
      ).controls['quantity'].value
    );

    (
      (this.groceryListForm.controls['items'] as FormArray).controls[
        index
      ] as FormGroup
    ).controls['price'].setValue(newPrice);

    this.groceryListForm.controls['totalPrice'].setValue(
      oldTotalPrice + newPrice - oldPrice
    );
  }

  updateUserGroceryList() {
    console.log(1);
  }

  deleteUserGroceryList() {
    this.groceryListService.deleteUserGroceryList(this.id!).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
    });
  }

  exportUserGroceryListSummary() {
    this.groceryListService.exportUserGroceryListSummary(this.id!).subscribe({
      next: (response: UserGroceryListSummaryExportResponse) => {
        window.open(response.download_url, '_blank');
      },
    });
  }
}