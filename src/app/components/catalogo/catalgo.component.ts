import { Component, inject, signal, afterNextRender, computed } from '@angular/core';
import { ProductCardComponent } from '../producto/producto.component';
import { Product } from '../../models/producto.model';
import { ProductService } from '../../services/producto.service';
import {  EventEmitter, Input, Output } from '@angular/core';
import { CarritoComponent } from '../carrito/carrito.component';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ProductCardComponent, CarritoComponent],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.css'],
})
export class CatalogoComponent {
  products = signal<Product[]>([]);
  inStockCount = computed(() => this.products().filter(p => p.inStock).length);

  constructor(
    private productsService: ProductService,
    private carritoService: CarritoService
  ) {
    this.productsService.getAll().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Error cargando XML:', err),
    });
  }

  agregar(producto: Product) {
    this.carritoService.agregar(producto);
  }
}
