import {Component} from '@angular/core';
import axios from "axios";
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule
  ],
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private router: Router, private toaster: ToastrService, private spinner: NgxSpinnerService) {
  }

  async register() {
    await this.spinner.show();
    try {
      const response = await axios.post('http://localhost:3000/api/register', {
        username: this.username,
        email: this.email,
        password: this.password
      });
      this.toaster.success(response.data.message, 'Registration Successful');
      await this.router.navigate(['/login']);
    } catch (error: any) {
      this.toaster.error('Registration failed: ' + error.response.data.error, 'Error');
    } finally {
      await this.spinner.hide();
    }
  }
}
