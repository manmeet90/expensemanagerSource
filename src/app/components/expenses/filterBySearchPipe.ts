import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name:'filterBySearch'})
export class FilterBySearchPipe implements PipeTransform {
    transform(expenses: any[], searchTerm: string = '') {
        if(expenses && expenses.length > 0) {
            return expenses.filter(expense => expense.description && expense.description.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
        }
        return expenses;
    }

}