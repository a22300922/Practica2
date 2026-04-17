import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { CarritoPageComponent } from './components/carrito-page/carrito-page.component';
import { ProductoDetalleComponent } from './components/producto-detalle/producto-detalle.component';
import { CheckoutComponent } from './components/checkout/checkout.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'producto/:id', component: ProductoDetalleComponent },
  { path: 'carrito', component: CarritoPageComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: '**', redirectTo: '' },
];
