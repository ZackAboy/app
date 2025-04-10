import { Component, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  fullname: string = '';
  email: string = '';
  password: string = '';

  errorMessage: string = '';
  emailError: string = '';
  passwordError: string = '';
  fullnameError: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private ngZone: NgZone // ✅ Add NgZone
  ) {}

  onSignup(form: NgForm): void {
    this.clearErrors();

    if (form.invalid) return;

    const payload = {
      fullname: this.fullname.trim(),
      email: this.email.trim(),
      password: this.password
    };

    this.http.post<{ fullname: string; email: string; message: string }>(
      'http://localhost:8080/api/auth/signup',
      payload,
      { withCredentials: true }
    ).subscribe({
      next: (res:any) => {
        console.log('✅ Signup successful:', res);
        this.userService.setLoggedIn(res.fullname, res.email, res.profileImageUrl); // ✅
        // ✅ Safe router navigation inside Angular zone
        this.ngZone.run(() => {
          this.router.navigate(['/']);
        });
      },
      error: (err) => {
        const message = err.error?.message || 'Signup failed';
        console.error('Signup error:', message);

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