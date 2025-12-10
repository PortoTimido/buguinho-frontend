import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './Components/about/about.component';
import { DeveloperComponent } from './Components/developer/developer.component';
import { BugsComponent } from './Components/bugs/bugs.component';

const routes: Routes = [
  { path: 'developer', component: DeveloperComponent},
  { path: 'about'  , component: AboutComponent},
  { path: 'bugs'  , component: BugsComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
