import { Component, OnInit } from "@angular/core";
import {ExpenseService} from '../../services/expense.service';
import {sortBy, orderBy} from 'lodash';
import {ExpenseType, ExpenseListItem} from './expenseType';
import { ActivatedRoute, Router } from '@angular/router';
declare var $ : any;
declare var M : any;
import {SortOrder} from '../../utils/utils';

@Component({
    templateUrl : './ExpenseList.html',
    styleUrls: ['./expenseList.css']
})
export class ExpenseListComponent implements OnInit{
    private _data =[];
    expenses = [];
    years = [new Date().getFullYear()];
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    expenseTypes : ExpenseListItem[];
    total : Number;
    isLoading: boolean = false;
    public sub: any = null;
    public queryParams = null;
    public searchTerm = '';

    public currentDateSortBy: SortOrder = SortOrder.ASC;
    public currentAmountSortBy: SortOrder = SortOrder.ASC;

    constructor(private expenseService: ExpenseService,
        private expenseType: ExpenseType,
        private route: ActivatedRoute,
        private router: Router){}

    ngOnInit(): void {
        this.expenseType.getExpenseTypes()
        .then((res: any) => {
          if(res.data.items){
            this.expenseTypes =  res.data.items;
          }else if(res.errors){
              M.toast({html: res.errors[0].message});
          }
        });
        this.getExpensesData();
        this.sub = this.route
        .queryParams
        .subscribe(params => {
            // Defaults to 0 if no query param provided.
            this.queryParams = params;
        });

        $('.collapsible').collapsible();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    onBackToReportsLinkClicked(e) {
        e.preventDefault();
        this.router.navigate(['reports'], {queryParams:this.queryParams});
    }

    toLocale(data) {
        return parseInt(data).toLocaleString('en-IN', {style:'currency',currency:'INR'});
    }

    getExpensesData() {
        this.expenses = [];
        this._data = [];
        this.isLoading = true;

        let _d = new Date();
        if(this.years.indexOf(_d.getFullYear())== -1){
            this.years.push(_d.getFullYear());
        }

        this.expenseService.getExpensesByYearAndMonth(_d.getFullYear(), this.months[_d.getMonth()])
        .then(res => {
            if(res.data.items) {
                this.expenses = this.normalizeData(res.data.items);
                this._data = this.expenses;
                this.total = this.calculateTotal();

                this.setmonthDropdownToCurrentMonth();
                this.isLoading = false;
                // setTimeout(()=>{
                //     var elems = document.querySelectorAll('select');
                //     var instances = M.FormSelect.init(elems, {});
                // }, 2000);
                setTimeout(()=>{
                    this.fetchAllDataInBackground();
                }, 0);
            }else if(res.errors){
                M.toast({html: res.errors[0].message});
            }
        });
    }

    private fetchAllDataInBackground() {
        this.years = [];
        this.expenseService.getAllExpenses()
        .then(res => {
            if(res.data.items) {
                let data = this.normalizeData(res.data.items);
                res.data.items.forEach(item => {
                    if(this.years.indexOf(item.year) == -1){
                        this.years.push(item.year);
                    }
                });
                this._data = data;
                this.setmonthDropdownToCurrentMonth();
                // setTimeout(()=>{
                //     // var elems = document.querySelectorAll('select');
                //     // var instances = M.FormSelect.init(elems, {});
                //     // $(elems).formSelect();
                // }, 2000);
            }else if(res.errors){
                M.toast({html: res.errors[0].message});
            }
        });
    }

    setmonthDropdownToCurrentMonth() {
        let d = new Date();

        if(this.queryParams && this.queryParams.year) {
            let year = this.queryParams.year;
            let month = this.queryParams.month || '';
            let expenseType = this.getExpenseTypeId(this.queryParams.expenseType) || '';
            setTimeout(() => {
                $('#month').val(month);
                $("#year").val(year);
                $('#expenseType').val(expenseType);
            },100);
            console.log(`filtering by year: ${year}, month: ${month} ,expensetype: ${expenseType}`)
            this.filterList(year, month, expenseType);
        }else {
            setTimeout(() => {
                $('#month').val(this.months[d.getMonth()]);
                $("#year").val(d.getFullYear());
            },100);
            this.filterList(d.getFullYear().toString(),this.months[d.getMonth()]);
        }
    }

    filterListByYear(year){
        this.expenses = year ? this._data.filter(_d => _d.year.toString() === year) : this._data;
        this.expenses = this.sortDataByDate(this.expenses);

        this.total = this.calculateTotal();
    }
    filterListByMonth(month, year?){
        let data = this._data;
        if(year) {
            data = this._data.filter(_d => _d.year.toString() === year);
        }
        this.expenses = month ? data.filter(_d => _d.month.toString() === month.toUpperCase()): data;
        this.expenses = this.sortDataByDate(this.expenses);
        this.total = this.calculateTotal();
    }
    filterListByExpenseType(type, month?, year?){
        let data = this._data;
        if(year) {
            data = this._data.filter(_d => _d.year.toString() === year);
        }
        if(month) {
            data = data.filter(_d => _d.month.toString() === month.toUpperCase());
        }
        this.expenses = type ? data.filter(_d => _d.expenseType === type) : data;
        this.expenses = this.sortDataByDate(this.expenses);

        this.total = this.calculateTotal();

    }

    filterList(year, month?, type?) {
        let data = this._data;
        if(year) {
            data = data.filter(_d => _d.year.toString() === year);
        }
        if(month) {
            data = data.filter(_d => _d.month.toString() === month.toUpperCase());
        }
        if(type) {
            data = data.filter(_d => _d.expenseType === type);
        }
        this.expenses = data;
        this.expenses = this.sortDataByDate(this.expenses);

        this.total = this.calculateTotal();
    }

    calculateTotal(){
        let total = 0;
        this.expenses.forEach(_d => {
            total+= _d.amount;
        });

        return total;
    }

    sortDataByDate(data, sortOrder = this.currentDateSortBy) {
        return sortBy(data, (_d) => {
            if(_d.date) {
                let parts = _d.date.split('-');
                // if(parts[0].length === 1) {
                //     parts[0] = `0${parts[0]}`;
                // }
                // if(parts[1].length === 1) {
                //     parts[1] = `0${parts[1]}`;
                // }
                // let md = parts[0]+parts[1];

                return new Date(parts[2],Number(parts[1])-1, parts[0]).getTime();
            }else {
                return -1;
            }

        }, sortOrder === SortOrder.DSC ? true : false);
    }

    ondeleteButtonClicked(expense) {
        let res = confirm("Are you sure you want to delete this record?");
        if(res) {
            this.expenseService.deleteExpense(expense)
            .then(res=>{
                if(res.errors){
                    console.log(res.errors);
                }else{
                    this.getExpensesData();
                    M.toast({html: 'Expense Deleted Successfuly!'});
                }
            });
        }
    }

    getExpenseTypeString(expenseType){
        if(expenseType && this.expenseTypes){
            let expenseTypeItem = this.expenseTypes.find(item => item.id == expenseType);
            if(expenseTypeItem){
                return expenseTypeItem.name;
            }
        }
        return 'Not Available';
    }

    getExpenseTypeId(expenseTypeName) {
        if(expenseTypeName && this.expenseTypes){
            let expenseTypeItem = this.expenseTypes.find(item => item.value == expenseTypeName);
            if(expenseTypeItem){
                return expenseTypeItem.id;
            }
        }
        return null;
    }

    sortByDateClicked() {
        if(this.expenses.length > 0 && this.currentDateSortBy) {
            this.currentDateSortBy =  this.currentDateSortBy === SortOrder.ASC ? SortOrder.DSC : SortOrder.ASC;
            switch(this.currentDateSortBy) {
                case SortOrder.DSC: {
                    this.expenses = orderBy(this.expenses, (d) => d.dateInstance.getTime(), ['desc']);
                    break;
                }

                default : {
                    this.expenses = orderBy(this.expenses, (d) => d.dateInstance.getTime(), ['asc']);
                }
            }
        }
    }

    sortByAmountClicked() {
        if(this.expenses.length > 0 && this.currentAmountSortBy) {
            this.currentAmountSortBy =  this.currentAmountSortBy === SortOrder.ASC ? SortOrder.DSC : SortOrder.ASC;
            switch(this.currentAmountSortBy) {
                case SortOrder.DSC: {
                    this.expenses = orderBy(this.expenses, (d) => d.amount, ['desc']);
                    break;
                }

                default : {
                    this.expenses = orderBy(this.expenses, (d) => d.amount, ['asc']);
                }
            }
        }
    }

    normalizeData(data) {
        if(data.length > 0) {
            data.forEach(d => {
                if(d.date) {
                    let parts = d.date.split('-');
                    d.dateInstance = new Date(parts[2],Number(parts[1])-1, parts[0]);
                }
            });
        }
        return data;
    }
}
