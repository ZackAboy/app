import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  onLogin(): void {
    this.errorMessage = '';

    this.http.post('http://localhost:8080/api/auth/login', {
      email: this.email,
      password: this.password
    }, { withCredentials: true }).subscribe({
      next: (res) => {
        console.log('Login successful:', res);
        // Redirect or show success
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = err.error?.message || 'Login failed';
      }
    });    
  }
}