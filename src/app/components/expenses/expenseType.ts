import { Injectable } from "@angular/core";


// export enum EXPENSETYPE{
//     OTHERS = "Others",
//     RENT = "Rent",
//     ONLINE_PAYMENT = "Online Payment",
//     MAID = "Maid",
//     GROCERIES = "Groceries",
//     SHOPPING = 'Shopping',
//     DINNER = 'Dinner',
//     LUNCH = 'Lunch',
//     MUTUAL_FUND = 'Mutual Fund',
//     SNACKS = 'Snacks',
//     LOAN_EMI = 'LOAN EMI',
//     TICKETS = 'Tickets',
//     CABS = 'Cabs',
//     EATING_OUTSIDE = "Eating Outside",
//     RATION = "Ration",
//     BILLS = "BILLS",
//     MEDICAL = "Medical"
// };

export interface ExpenseListItem {
    name:string,
    value: string,
    id:string
}

@Injectable()
export class ExpenseType {

    private expenseTypeUrl = "expensetype";

    getExpenseTypes() {
        let baseUrl = sessionStorage.getItem('apiBaseUrl');
        let url = `${baseUrl}/${this.expenseTypeUrl}`;
        return fetch(url,{
          method:'GET',
          headers:{
            'Content-Type':'application/json',
            'Accept':'application/json'
          }
        }).then(res => res.json());

    }
};
