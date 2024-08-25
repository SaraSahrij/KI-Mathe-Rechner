import { Component, OnInit } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  imports: [
    NgIf,
    NgClass,
    RouterLink,
  ],
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
      }
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
