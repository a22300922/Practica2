import { Component, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { Product } from '../../models/producto.model';
import { Signal } from '@angular/core';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe], // NO es CommonModule
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
})
export class CarritoComponent {
  carrito: Signal<Product[]>;
  total = computed(() => this.carritoService.total());

  constructor(private carritoService: CarritoService) {
    this.carrito = this.carritoService.productos;
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
}
