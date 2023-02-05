import { Component, EventEmitter } from '@angular/core';
import { AuthGuard } from '../../services/auth.service';
import { Router } from '@angular/router';
declare var firebase: any;

@Component({
    templateUrl : './login.component.html'
})
export class LoginComponent {
    disableLoginBtn: boolean = true;
    loginError: boolean = false;
    message: string;
    loginInProgress: boolean = false;
    loginButtonText: string = "Login";

    constructor(private authService: AuthGuard, private router: Router) {

    }
    updateLoginBtnState(email, password) {
        if(email && password) {
            this.disableLoginBtn = false;
        }else {
            this.disableLoginBtn = true;
        }
    }

    onLoginButtonClicked(e, email, password) {
        e.preventDefault();
        if(email && password) {
            this.loginInProgress = true;
            this.loginButtonText = "logging in...";
            this.authService.login(email, password)
            .then(response => {
                if(response.data) {
                    this.loginError = false;
                    this.loginInProgress = false;
                    this.loginButtonText = "Login";
                    sessionStorage.setItem('isLoggedIn', JSON.stringify(true));
                    this.authService.loginEvent.emit('login');
                    this.router.navigate(['expenses']);
                }else{
                    this.handleError(response.errors[0]);
                }
                
            })
            .catch((error) => {
                // Handle Errors here.
                this.handleError(error);
            });
        }
    }

    handleError(error) {
        this.loginInProgress = false;
        this.loginButtonText = "Login";
        this.loginError = true;
        this.message = error.message;
        console.log(error);
        sessionStorage.setItem('isLoggedIn', JSON.stringify(false));
    }
}
