import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './Components/sidebar/sidebar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AboutComponent } from './Components/about/about.component';
import { DeveloperComponent } from './Components/developer/developer.component';
import { provideHttpClient } from '@angular/common/http';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BugsComponent } from './Components/bugs/bugs.component';
import { HomeComponent } from './Components/home/home.component';
import { ProjectsComponent } from './Components/projects/projects.component';


@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    AboutComponent,
    DeveloperComponent,
    BugsComponent,
    HomeComponent,
    ProjectsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    NgxMaskDirective,
    NgxMaskPipe
  ],
  providers: [provideHttpClient(), provideNgxMask()],
  bootstrap: [AppComponent]
})
export class AppModule { }