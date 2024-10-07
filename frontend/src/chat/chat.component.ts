import {Component, OnInit} from '@angular/core';
import axios from 'axios';
import {RouterLink} from "@angular/router";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';

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
export class ChatComponent implements OnInit {
  userMessage: string = '';
  messages: { role: string, content: string }[] = [];
  context: { role: string, content: string }[] = [];
  recommendations: any = null;
  categories: any = null;
  username: string = '';
  isAuthenticated: boolean = false;

  constructor(private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.isAuthenticated = true;
    this.username = localStorage.getItem('username') || 'User';
  }

  ngOnInit() {
    this.loadChatData();  // Call function to load data from localStorage
    this.fetchUsername() // Fetch username, as before
  }

  loadChatData() {
    const savedMessages = localStorage.getItem('messages');
    const savedContext = localStorage.getItem('context');
    const savedCategories = localStorage.getItem('categories');
    const savedRecommendations = localStorage.getItem('recommendations');

    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);  // Load both user and AI messages
    }

    if (savedContext) {
      this.context = JSON.parse(savedContext);
    }

    if (savedCategories) {
      this.categories = JSON.parse(savedCategories);
    }

    if (savedRecommendations) {
      this.recommendations = JSON.parse(savedRecommendations);
    }
  }

  async fetchUsername() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      this.username = response.data.username || 'User';  // Set username, fallback to 'User'
    } catch (error) {
      console.error('Error fetching username:', error);
      this.toastr.error('Unable to fetch username.', 'Error');
    }
  }

  async sendMessage() {
    if (!this.userMessage.trim() || !this.isAuthenticated) {
      this.toastr.warning('Please enter a message or login first.', 'Warning');
      return;
    }

    // Push user message to the messages array
    this.messages.push({role: 'user', content: this.userMessage});
    this.context.push({role: 'user', content: this.userMessage});

    // Save user message and context immediately to localStorage
    localStorage.setItem('messages', JSON.stringify(this.messages));
    localStorage.setItem('context', JSON.stringify(this.context));

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

      // Update context and push AI response
      this.context = response.data.context;
      this.messages.push({role: 'assistant', content: response.data.solution});

      // Save the entire messages array, including the AI's response, to localStorage
      localStorage.setItem('messages', JSON.stringify(this.messages));

      // Save recommendations and categories
      this.recommendations = response.data.recommendations;
      this.categories = response.data.categories;
      localStorage.setItem('recommendations', JSON.stringify(this.recommendations));
      localStorage.setItem('categories', JSON.stringify(this.categories));

      this.toastr.success('Message sent successfully!', 'Success');

    } catch (error) {
      console.error(error);
      this.messages.push({role: 'assistant', content: 'An error occurred while solving the problem.'});

      // Save the error response as well
      localStorage.setItem('messages', JSON.stringify(this.messages));
      this.toastr.error('An error occurred while solving the problem.', 'Error');
    } finally {
      await this.spinner.hide();
    }

    this.userMessage = ''; // Clear the user's input
  }

  protected readonly onkeypress = onkeypress;
}
