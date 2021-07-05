import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { ExpenseType, ExpenseListItem } from './expenseType';
import { ExpenseService } from '../../services/expense.service';
declare var $: any;
declare var M: any;
@Component({
    templateUrl: './CreateExpense.html'
})
export class CreateExpenseComponent implements OnInit {

    expenseForm: FormGroup;
    expenseTypeForm: FormGroup;
    expenseTypes: ExpenseListItem[];
    showMsg = false;
    dpConfig: any = { format: "DD-MM-YYYY" };
    public isLoading: boolean = false;

    constructor(private fb: FormBuilder, private expenseType: ExpenseType,
        private expenseService: ExpenseService) {

    }

    ngOnInit(): void {
        this.isLoading = true;
        this.getExpenseTypes()
        .then((res: any) => {
            // start init of component
            this.expenseForm = this.fb.group({
                date: [this.today()],
                description: ['', Validators.required],
                amount: ['', Validators.required],
                expenseType: [this.expenseTypes[0].id, Validators.required],
                remarks: ['']
            });

            this.expenseTypeForm = this.fb.group({
                newExpenseType: [''],
                newName:[''],
                expenseType:[this.expenseTypes[0].id]
            });

            this.isLoading = false;

            setTimeout(() => {
                var elems = document.querySelector('.datepicker');
                var instances = M.Datepicker.init(elems, {
                    format: "dd-mm-yyyy",
                    setDefaultDate: true,
                    defaultDate: new Date(),
                    onSelect:  (date) => {
                        let _d = new Date(date);
                        this.expenseForm.get('date').setValue(`${_d.getDate()}-${_d.getMonth() + 1}-${_d.getFullYear()}`);
                    }
                });
                var elemsForModal = document.querySelectorAll('.modal');
                var instances = M.Modal.init(elemsForModal, {});
                // $('select').formSelect();
            }, 1000);
        });
    }

    getExpenseTypes(){
        return this.expenseType.getExpenseTypes()
        .then((res: any) => {
          if(res.data.items){
            this.expenseTypes =  res.data.items;
            }else if(res.errors){
                M.toast({html: res.errors[0].message})
                this.isLoading = false;
            }
          });
    }

    onCreateExpenseTypeBtnClicked(){
        if(!this.expenseTypeForm.value.newExpenseType) {
            return;
        }
        this.expenseService.createExpenseType(this.expenseTypeForm.value.newExpenseType)
        .then(res => {
            if (res.errors) {
                console.log(res.errors);
            }else{
                M.toast({html: `expense type created successfully`});
                this.getExpenseTypes();
            }
        });
    }

    onUpdateExpenseTypeBtnClicked(){
        if(!this.expenseTypeForm.value.expenseType || !this.expenseTypeForm.value.newName) {
            return;
        }
        this.expenseService.updateExpenseType(this.expenseTypeForm.value.expenseType,
            this.expenseTypeForm.value.newName)
        .then(res => {
            if (res.errors) {
                M.toast({html: `${res.errors[0].message}`});
            }else{
                M.toast({html: `expense type updated successfully`});
                this.getExpenseTypes();
            }
        });
    }

    onDeleteExpenseTypeBtnClicked(){
        if(!this.expenseTypeForm.value.expenseType) {
            return;
        }
        this.expenseService.deleteExpenseType(this.expenseTypeForm.value.expenseType)
        .then(res => {
            if (res.errors) {
                console.log(res.errors);
            }else{
                M.toast({html: `expense type deleted successfully`});
                this.getExpenseTypes();
            }
        });
    }

    onCreateButtonClicked() {
        if (!this.expenseForm.value.amount) {
            return;
        }
        console.log(this.expenseForm.value);
        this.expenseService.saveExpense(this.expenseForm.value)
            .then((res) => {
                if (res.errors) {
                    console.log(res.errors);
                } else {
                    this.showMsg = true;
                    setTimeout(() => {
                        this.showMsg = false;
                    }, 2000);
                    this.expenseForm.reset();
                    this.expenseForm.controls.date.setValue(this.today());
                    this.expenseForm.controls.date.updateValueAndValidity();
                }
            });
    }

    today() {
        let today = '';
        const _d = new Date();
        let month:any = _d.getMonth() + 1;
        if(month <10) {
          month = ['0', month].join('');
        }
        today = `${_d.getDate() < 10 ? ['0', _d.getDate()].join('') : _d.getDate()}-${month}-${_d.getFullYear()}`;
        return today;
    }

}
