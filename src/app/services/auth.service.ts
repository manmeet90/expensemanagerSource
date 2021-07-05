import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable, EventEmitter } from "@angular/core";

@Injectable()
export class AuthGuard implements CanActivate{
    public loginEvent: EventEmitter<any> = new EventEmitter();
    private loginUrl = "login";

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.isUserLoggedIn();
    }

    isUserLoggedIn() {
        let isLoggedIn = sessionStorage.getItem('isLoggedIn');
        return JSON.parse(isLoggedIn);
    }

    login(username, password) {
      let payload = {
        username,password
      };
      let baseUrl = sessionStorage.getItem('apiBaseUrl');
      let url = `${baseUrl}/${this.loginUrl}`;
      return fetch(url, {
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify(payload)
      }).then(res => res.json());
    }
}
