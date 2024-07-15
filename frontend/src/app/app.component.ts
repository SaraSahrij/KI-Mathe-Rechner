import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import axios from "axios";
import {FormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, NgIf, NgClass, NgForOf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  userMessage: string = '';
  messages: { role: string, content: string }[] = [];

  async sendMessage() {
    if (!this.userMessage.trim()) return;

    this.messages.push({ role: 'user', content: this.userMessage });

    try {
      const response = await axios.post('http://localhost:3000/api/solve', { problem: this.userMessage });
      this.messages.push({ role: 'assistant', content: response.data.solution });
    } catch (error) {
      console.error(error);
      this.messages.push({ role: 'assistant', content: 'An error occurred while solving the problem.' });
    }

    this.userMessage = '';
  }
}
