import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet, RouterModule } from '@angular/router';
import { UserService } from './services/user.service';
import { filter } from 'rxjs/operators';

interface Toast {
  message: string;
  show: boolean;
  color: 'success' | 'danger';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'frontend';
  isLoggedIn = false;
  userName = 'Guest';
  userGravatarUrl = 'https://www.gravatar.com/avatar/?d=identicon';
  currentRoute = '';

  // Toasts will live globally here
  toasts: Toast[] = [];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.checkLoginStatus();

    this.userService.loginState$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;

      const user = this.userService.getUser();
      if (isLoggedIn && user) {
        this.userName = user.fullname;
        this.userGravatarUrl = user.profileImageUrl;
      } else {
        this.userName = 'Guest';
        this.userGravatarUrl = 'https://www.gravatar.com/avatar/?d=identicon';
      }
    });

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
    });
  }

  // Global toast handler
  showToast(message: string, color: 'success' | 'danger' = 'success', duration: number = 3000): void {
    const toast: Toast = { message, show: true, color };
    this.toasts.push(toast);

    setTimeout(() => {
      toast.show = false;
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t !== toast);
      }, 500);
    }, duration);
  }

  logout(): void {
    fetch('http://localhost:8080/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Logout failed');
        this.showToast('Logged out successfully', 'success');
        
        // Clear local storage on logout
        localStorage.removeItem('artists');
        localStorage.removeItem('favoriteArtistIds');
        localStorage.removeItem('searchTerm');
        localStorage.removeItem('favorites');
      })
      .catch(err => {
        console.error('Logout API error:', err);
        this.showToast('Logout failed', 'danger');
      })
      .finally(() => {
        this.userService.setLoggedOut();
        if (this.router.url === '/') {
          window.location.reload(); // Force reload
        } else {
          this.router.navigate(['/']).then(() => {
            window.location.reload();
          });
        }
      });
  }  

  deleteAccount(): void {
    fetch('http://localhost:8080/api/auth/delete', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      this.logout();
    }).catch(err => {
      console.error('Delete failed:', err);
      this.showToast('Account deletion failed', 'danger');
    });
  }
}