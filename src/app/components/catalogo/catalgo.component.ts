import { Component, inject, signal, afterNextRender } from '@angular/core';
import { ProductCardComponent } from '../producto/producto.component';
import { Product } from '../../models/producto.model';
import { ProductService } from '../../services/producto.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.css'],
})
export class CatalogoComponent {
  private productsService = inject(ProductService);
  products = signal<Product[]>([]);

  constructor() {
    afterNextRender(() => {
      this.productsService.getAll().subscribe({
        next: (data) => this.products.set(data),
        error: (err) => console.error('Error cargando productos:', err)
      });
    });
  }
}