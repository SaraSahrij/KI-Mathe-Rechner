import { Component, OnInit, ElementRef, Directive, Input, OnChanges } from '@angular/core';
import axios from 'axios';
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

declare var MathJax: any;

@Directive({
  standalone: true,
  selector: '[mathjax]'
})
export class MathjaxDirective implements OnChanges {
  @Input('mathjax') content!: string;

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    this.el.nativeElement.innerHTML = this.content;
    MathJax.typesetPromise();
  }
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIf,
    FormsModule,
    MathjaxDirective
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
  sendenActive = true;

  nonMathKeywords: string[] = [
    "how are you", "how r u", "wie geht's", "wie gehts", "thanks", "thank you",
    "danke dir", "danke", "vielen dank", "wie läuft es", "wie steht’s"
  ];

  constructor(private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.isAuthenticated = true;
    this.username = localStorage.getItem('username') || 'User';
  }

  ngOnInit() {
    this.loadChatData();
    this.fetchUsername();
  }

  loadChatData() {
    const savedMessages = localStorage.getItem('messages');
    const savedContext = localStorage.getItem('context');
    const savedCategories = localStorage.getItem('categories');
    const savedRecommendations = localStorage.getItem('recommendations');

    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
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
      this.username = response.data.username || 'User';
    } catch (error) {
      console.error('Error fetching username:', error);
      this.toastr.error('Unable to fetch username.', 'Error');
    }
  }

  async sendMessage() {
    if (!this.userMessage.trim() || !this.isAuthenticated) {
      this.toastr.warning('Bitte geben Sie eine Nachricht ein oder melden Sie sich zuerst an.', 'Warnung');
      return;
    }

    // Check if the message is a non-math-related phrase
    const messageLower = this.userMessage.toLowerCase();
    if (this.nonMathKeywords.some(keyword => messageLower.includes(keyword))) {
      this.messages.push({ role: 'assistant', content: 'Ich beantworte nur mathematische Fragen! 😊' });
      this.userMessage = '';
      return;
    }

    this.sendenActive = false;
    const messageToSend = this.userMessage;
    this.userMessage = '';

    this.messages.push({ role: 'user', content: messageToSend });
    this.context.push({ role: 'user', content: messageToSend });

    localStorage.setItem('messages', JSON.stringify(this.messages));
    localStorage.setItem('context', JSON.stringify(this.context));

    await this.spinner.show();

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      const response = await axios.post('http://localhost:3000/api/solve', {
        problem: messageToSend,
        context: this.context,
        userId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      this.context = response.data.context;
      this.messages.push({ role: 'assistant', content: response.data.solution });

      localStorage.setItem('messages', JSON.stringify(this.messages));

      this.recommendations = response.data.recommendations;
      this.categories = response.data.categories;
      localStorage.setItem('recommendations', JSON.stringify(this.recommendations));
      localStorage.setItem('categories', JSON.stringify(this.categories));

      this.toastr.success('Nachricht erfolgreich gesendet!', 'Erfolg');
    } catch (error) {
      console.error(error);
      this.messages.push({ role: 'assistant', content: 'Beim Lösen des Problems ist ein Fehler aufgetreten.' });
      localStorage.setItem('messages', JSON.stringify(this.messages));
      this.toastr.error('Ein Fehler ist aufgetreten.', 'Fehler');
    } finally {
      this.sendenActive = true;
      await this.spinner.hide();
    }
  }
}
