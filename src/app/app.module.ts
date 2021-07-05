import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {DpDatePickerModule} from 'ng2-date-picker';
import { AppComponent } from './app.component';

import {APP_ROUTES} from './app.routing';
import {LoginComponent} from './components/login/login.component';
import {PageNotFoundComponent} from './components/404/PageNotFound.component';
import {ReportsComponent} from './components/reports/Reports.component';
import {CreateExpenseComponent, ExpenseComponent, ExpenseListComponent, ExpenseType} from './components/expenses';
import {ExpenseService} from './services/expense.service';
import {AuthGuard} from './services/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    ReportsComponent,
    CreateExpenseComponent,
    ExpenseComponent,
    ExpenseListComponent
  ],
  imports: [
    APP_ROUTES,
    ReactiveFormsModule,
    FormsModule,
    DpDatePickerModule,
    BrowserModule
  ],
  providers: [
    ExpenseType,
    ExpenseService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
