import {Routes, RouterModule} from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import {PageNotFoundComponent} from './components/404/PageNotFound.component';
import {ReportsComponent} from './components/reports/Reports.component';
import {CreateExpenseComponent, ExpenseComponent, ExpenseListComponent} from './components/expenses';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './services/auth.service';

const routes: Routes = [
    {
        path : '',
        redirectTo : 'login',
        pathMatch : 'full'
    },
    {
        path : 'login',
        component: LoginComponent
    },
    {
        path : 'expenses',
        component : ExpenseListComponent,
        canActivate : [AuthGuard],
        children: [
            {
                path : ":year/:month",
                component : ExpenseComponent
            }
        ]
    },
    {
        path : 'create',
        component : CreateExpenseComponent,
        canActivate : [AuthGuard]
    },
    {
        path : 'reports',
        component : ReportsComponent,
        canActivate : [AuthGuard]
    },
    {
        path : '**',
        component : PageNotFoundComponent
    }
];

export const APP_ROUTES: ModuleWithProviders =  RouterModule.forRoot(routes);
