import { Injectable } from "@angular/core";
import * as uuid from 'uuid';

@Injectable()
export class ExpenseService {
    private baseUrl: string = '';
    private expenseUrl: string = 'expense';
    private incomeUrl: string = 'income';
    private reportUrl: string = 'report';
    private expenseTypeUrl: string = 'expensetype';

    constructor(){
        this.baseUrl = sessionStorage.getItem('apiBaseUrl');
    }

    createExpenseType(expenseType){
        let url = `${this.baseUrl}/${this.expenseTypeUrl}`;
        return fetch(url,{
            method: 'PUT',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({expenseType})
        }).then(res => res.json());
    }

    deleteExpenseType(expenseTypeToDelete){
        let url = `${this.baseUrl}/${this.expenseTypeUrl}/${expenseTypeToDelete}`;
        return fetch(url,{
            method: 'DELETE',
            headers: {
                'Content-Type':'application/json'
            }
        }).then(res => res.json());
    }

    updateExpenseType(expenseType, newName){
        let url = `${this.baseUrl}/${this.expenseTypeUrl}`;
        return fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({expenseType, newName})
        }).then(res => res.json());
    }

    saveExpense(expense) {
        let dateParts = expense.date.split('-');
        let _d = new Date(Date.UTC(dateParts[2], dateParts[1]-1, dateParts[0])); //new Date();
        // expense.id = uuid();
        let _rootRefYear = _d.getFullYear();
        let _rootRefMonth = this.getMonthString(_d.getMonth());
        expense.year = _rootRefYear;
        expense.month = _rootRefMonth.toUpperCase();
        let url = `${this.baseUrl}/${this.expenseUrl}`;
        return fetch(url,{
            method: 'PUT',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify(expense)
        }).then(res => res.json());
    }

    getMonthString(month): String {
        let result: string;
        switch (parseInt(month)) {
            case 0:
                result = "Jan";
                break;
            case 1:
                result = "Feb";
                break;
            case 2:
                result = "Mar";
                break;

            case 3:
                result = "Apr";
                break;

            case 4:
                result = "May";
                break;

            case 5:
                result = "Jun";
                break;

            case 6:
                result = "Jul";
                break;

            case 7:
                result = "Aug";
                break;

            case 8:
                result = "Sep";
                break;

            case 9:
                result = "Oct";
                break;

            case 10:
                result = "Nov";
                break;

            case 11:
                result = "Dec";
                break;

        }
        return result;
    }

    getAllExpenses(){
        let url = `${this.baseUrl}/${this.expenseUrl}`;
        return fetch(url,{
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            }
        }).then(res => res.json());
    }

    getExpensesByYear(year){
        let url = `${this.baseUrl}/${this.expenseUrl}?year=${year}`;
        return fetch(url,{
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            }
        }).then(res => res.json());
    }

    getExpensesByYearAndMonth(year,month){
        let url = `${this.baseUrl}/${this.expenseUrl}?year=${year}`;
        if(month) {
            url+=`&month=${month}`;
        }
        return fetch(url,{
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            }
        }).then(res => res.json());
    }

    deleteExpense(expense) {
        let url = `${this.baseUrl}/${this.expenseUrl}/${expense.id}`;
        return fetch(url,{
            method:'DELETE',
            headers:{
                'Content-Type':'application/json'
            }
        }).then(res => res.json());
    }

    setEarning( year, month, earning) {
        let payload = {
            year: year,
            month: month.toUpperCase(),
            amount: earning
        };
        let url = `${this.baseUrl}/${this.incomeUrl}`;
        return fetch(url,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify(payload)
        }).then(res => res.json());
    }

    getExpenseReport(filter){
        if(filter.year && !filter.expenseType) {
            filter.year = parseInt(filter.year, 10);
            filter.month = filter.month || null; 
        } else if(!filter.duration) {
            filter.year = filter.year ? filter.year.trim() : `${new Date().getFullYear()}-${new Date().getFullYear()}`
        }
        let payload = { filter : {}};
        payload.filter = filter;
        let url = `${this.baseUrl}/${this.reportUrl}`;
        return fetch(url,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify(payload)
        }).then(res => res.json());
    }
}
