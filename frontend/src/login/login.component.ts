import { Component } from '@angular/core';
import axios from 'axios';
import {Router, RouterLink} from '@angular/router';
import {NgxSpinnerComponent, NgxSpinnerService} from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    NgxSpinnerComponent,
  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  async login() {
    if (!this.email || !this.password) {
      this.toastr.error('Please enter your email and password.', 'Login Failed');
      return;
    }

    await this.spinner.show();

    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        email: this.email,
        password: this.password
      });

      // Use AuthService to handle login and notify other components
      this.authService.login(response.data.token, response.data.userId);

      this.toastr.success('Login successful', 'Welcome!');
      await this.spinner.hide();
      await this.router.navigate(['/']);
    } catch (error) {
      await this.spinner.hide();
      this.toastr.error('Invalid credentials', 'Login Failed');
    }
  }
}
