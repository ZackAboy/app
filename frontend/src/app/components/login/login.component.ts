import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  private readonly API_URL = 'http://localhost:8080/api/auth/login';

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private ngZone: NgZone // ✅ Add this
  ) {}  

  onLogin(): void {
    this.errorMessage = '';

    this.http.post(this.API_URL, {
      email: this.email,
      password: this.password
    }, {
      withCredentials: true
    }).subscribe({
      next: (res: any) => {
        console.log('✅ Login successful:', res);
      
        // ✅ Update the user service with fullname and email
        this.userService.setLoggedIn(res.fullname, res.email, res.profileImageUrl); // ✅
      
        // ✅ Navigate to search
        this.ngZone.run(() => {
          this.router.navigate(['/']);
        });               
      },
      error: (err) => {
        console.error('❌ Login error:', err);
        this.errorMessage = err.error?.message || 'Login failed';
      }
    });    
  }
}