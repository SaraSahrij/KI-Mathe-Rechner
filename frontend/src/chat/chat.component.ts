import { Component } from '@angular/core';
import axios from 'axios';
import { RouterLink } from "@angular/router";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    NgForOf,
    NgIf,
    FormsModule
  ],
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  userMessage: string = '';
  messages: { role: string, content: string }[] = [];
  context: { role: string, content: string }[] = [];
  recommendations: any = null;
  isAuthenticated: boolean = false;

  constructor(private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.isAuthenticated = true;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.isAuthenticated = false;
    this.toastr.info('You have been logged out.', 'Info');
  }

  async sendMessage() {
    if (!this.userMessage.trim() || !this.isAuthenticated) {
      this.toastr.warning('Please enter a message or login first.', 'Warning');
      return;
    }

    this.messages.push({ role: 'user', content: this.userMessage });
    this.context.push({ role: 'user', content: this.userMessage });
    this.spinner.show();

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/solve', {
        problem: this.userMessage,
        context: this.context,
        userId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      this.context = response.data.context; // Update context with assistant's response
      this.messages.push({ role: 'assistant', content: response.data.solution });
      this.toastr.success('Message sent successfully!', 'Success');

      // Get recommendations after solving the problem
      const recommendationsResponse = await axios.post('http://localhost:3000/api/recommend', { userId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      this.recommendations = recommendationsResponse.data; // Store recommendations to display them

    } catch (error) {
      console.error(error);
      this.messages.push({ role: 'assistant', content: 'An error occurred while solving the problem.' });
      this.toastr.error('An error occurred while solving the problem.', 'Error');
    } finally {
      await this.spinner.hide();
    }

    this.userMessage = '';
  }
}
