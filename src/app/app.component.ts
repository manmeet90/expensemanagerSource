import { Component, EventEmitter, OnInit } from '@angular/core';
import { AuthGuard } from './services/auth.service';
import { Router } from '@angular/router';
declare var firebase: any;
declare var M: any;
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  title = 'Expense Manager';
  isLoggedIn = false;

  constructor(private authService: AuthGuard, private router: Router) {

  }

  ngOnInit(): void {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems, {});
    this.authService.loginEvent.subscribe(() => {
      this.isLoggedIn = true;
    });

    let isLoggedIn = sessionStorage.getItem('isLoggedIn');
    this.isLoggedIn = JSON.parse(isLoggedIn);
    $('.sidenav').sidenav();
  }

  signOut(e) {
    e.preventDefault();
      sessionStorage.setItem('isLoggedIn', JSON.stringify(false));
      this.isLoggedIn = false;
      this.router.navigate(['login']);
  }

}
