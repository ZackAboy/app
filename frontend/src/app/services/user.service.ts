import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface UserInfo {
  fullname: string;
  email: string;
  profileImageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private loginStateSubject = new BehaviorSubject<boolean>(false);
  loginState$ = this.loginStateSubject.asObservable();

  private userInfo: UserInfo | null = null;

  setLoggedIn(fullname: string, email: string, profileImageUrl: string): void {
    this.userInfo = { fullname, email, profileImageUrl };
    this.loginStateSubject.next(true);
  }

  setLoggedOut(): void {
    this.loginStateSubject.next(false);
    this.userInfo = null;
  }  

  getUser(): UserInfo | null {
    return this.userInfo;
  }

  checkLoginStatus(): void {
    fetch('http://localhost:8080/api/auth/verify', {
      credentials: 'include'
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      if (data?.email && data?.fullname && data?.profileImageUrl) {
        this.setLoggedIn(data.fullname, data.email, data.profileImageUrl);
      }
    })
    .catch(() => {
      this.setLoggedOut(); // clean fallback
    });
  }
}