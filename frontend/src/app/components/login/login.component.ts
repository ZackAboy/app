import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule, RouterModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  // ✅ Use environment-based URL for easy switching later
  private readonly API_URL = 'http://localhost:8080/api/auth/login';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin(): void {
    this.errorMessage = '';

    this.http.post(this.API_URL, {
      email: this.email,
      password: this.password
    }, {
      withCredentials: true  // ✅ Needed for cookie-based auth
    }).subscribe({
      next: (res) => {
        console.log('✅ Login successful:', res);
        this.router.navigate(['/search']);
      },
      error: (err) => {
        console.error('❌ Login error:', err);
        this.errorMessage = err.error?.message || 'Login failed';
      }
    });    
  }
}