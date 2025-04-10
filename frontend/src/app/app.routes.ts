import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { SearchComponent } from './components/search/search.component';
import { FavoritesComponent } from './favorites/favorites.component';

export const routes: Routes = [
  { path: '', component: SearchComponent },         // ✅ Default route is now Search
  { path: 'login', component: LoginComponent },     // ✅ Login is now /login
  { path: 'signup', component: SignupComponent },
  { path: 'favorites', component: FavoritesComponent } // Add the favorites route

];