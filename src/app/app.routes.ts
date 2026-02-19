import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/catalogo/catalgo.component';

export const routes: Routes = [
    {path: '',component: CatalogoComponent},
    {path: '**', redirectTo: ''},
    
];
