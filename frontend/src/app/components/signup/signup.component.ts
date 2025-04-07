import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [FormsModule, CommonModule]
})
export class SignupComponent {
  fullname: string = '';
  email: string = '';
  password: string = '';

  errorMessage: string = '';
  emailError: string = '';
  passwordError: string = '';
  fullnameError: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSignup(form: NgForm): void {
    this.clearErrors();

    if (form.invalid) return;

    const payload = {
      fullname: this.fullname.trim(),
      email: this.email.trim(),
      password: this.password
    };

    this.http.post('http://localhost:8080/api/auth/signup', payload, { withCredentials: true }).subscribe({
      next: (res) => {
        console.log('Signup successful:', res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const message = err.error?.message || 'Signup failed';
        console.error('Signup error:', message);

        // 🔍 Error mapping to fields
        if (message.includes('User already exists')) {
          this.emailError = message;
        } else if (message.toLowerCase().includes('email')) {
          this.emailError = message;
        } else if (message.toLowerCase().includes('fullname')) {
          this.fullnameError = message;
        } else if (message.toLowerCase().includes('password')) {
          this.passwordError = message;
        } else {
          this.errorMessage = message;
        }
      }
    });
  }

  private clearErrors(): void {
    this.errorMessage = '';
    this.emailError = '';
    this.passwordError = '';
    this.fullnameError = '';
  }
}