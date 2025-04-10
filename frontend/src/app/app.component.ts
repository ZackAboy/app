import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet, RouterModule } from '@angular/router';
import { UserService } from './services/user.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule
  ]
})
export class AppComponent implements OnInit {
  title = 'frontend';
  isLoggedIn = false;
  userName = 'Guest';
  currentRoute = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    // Check the cookie and update user state
    this.userService.checkLoginStatus();
    
    // Subscribe to the login state observable from the UserService
    this.userService.loginState$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
      this.userName = isLoggedIn ? this.userService.getUser()?.fullname || 'User' : 'Guest';
    });
    
    // Subscribe to router events using a type guard so that only NavigationEnd events are processed
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
    });
  }

  logout(): void {
    this.userService.logout();
  
    if (this.router.url === '/') {
      // Full browser reload if already on search
      window.location.href = '/';
    } else {
      this.router.navigate(['/']);
    }
  }   
}