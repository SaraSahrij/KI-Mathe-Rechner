import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {routes} from './app.routes';
import {LoginComponent} from "../login/login.component";
import {RegisterComponent} from "../register/register.component";
import {NgxSpinnerModule} from "ngx-spinner";
import {ToastrModule} from "ngx-toastr";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
  imports: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    BrowserModule,
    RouterModule.forRoot(routes),
    [NgxSpinnerModule.forRoot({type: 'ball-spin-clockwise'})],
    ToastrModule.forRoot(),
    BrowserAnimationsModule
  ],
})
export class AppModule {
}
