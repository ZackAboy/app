import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private loginStateSubject = new BehaviorSubject<boolean>(false);
  loginState$ = this.loginStateSubject.asObservable();

  private userInfo: { fullname: string, email: string } | null = null;

  setLoggedIn(fullname: string, email: string): void {
    this.loginStateSubject.next(true);
    this.userInfo = { fullname, email };
  }

  logout(): void {
    fetch('http://localhost:8080/api/auth/logout', {
      method: 'POST',
      credentials: 'include' // Send cookie
    })
      .then(res => {
        if (!res.ok) throw new Error('Logout failed');
      })
      .catch(err => {
        console.error('Logout API error:', err);
      })
      .finally(() => {
        // Always clear local state
        this.loginStateSubject.next(false);
        this.userInfo = null;
      });
  }  

  getUser(): { fullname: string, email: string } | null {
    return this.userInfo;
  }
  checkLoginStatus(): void {
    fetch('http://localhost:8080/api/auth/verify', {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data?.email && data?.message === 'User is logged in') {
          this.setLoggedIn(data.fullname || 'User', data.email);
        }
      })
      .catch(() => {
        this.logout(); // optional: ensures clean state on failure
      });
  }
  
}