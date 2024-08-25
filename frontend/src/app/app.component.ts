import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAuthenticated: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isAuthenticated = !!localStorage.getItem('token');
    }
  }
}
