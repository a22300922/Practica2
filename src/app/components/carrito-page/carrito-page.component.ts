import { Component, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { CartItem } from '../../models/producto.model';
import { Signal } from '@angular/core';

@Component({
  selector: 'app-carrito-page',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './carrito-page.component.html',
  styleUrls: ['./carrito-page.component.css'],
})
export class CarritoPageComponent {
  carrito: Signal<CartItem[]>;
  total = computed(() => this.carritoService.total());
  itemCount = computed(() => this.carritoService.itemCount());

  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {
    this.carrito = this.carritoService.items;
  }

  incrementar(productId: number) {
    const item = this.carrito().find(i => i.product.id === productId);
    if (item) {
      this.carritoService.actualizarCantidad(productId, item.quantity + 1);
    }
  }

  decrementar(productId: number) {
    const item = this.carrito().find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      this.carritoService.actualizarCantidad(productId, item.quantity - 1);
    }
  }

  quitar(id: number) {
    this.carritoService.quitar(id);
  }

  vaciar() {
    this.carritoService.vaciar();
  }

  exportarXML() {
    this.carritoService.exportarXML();
  }

  volver() {
    this.router.navigate(['/']);
  }

  irACheckout() {
    this.router.navigate(['/checkout']);
  }

  verProducto(id: number) {
    this.router.navigate(['/producto', id]);
  }
}
