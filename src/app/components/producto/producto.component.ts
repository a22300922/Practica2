import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { Product } from "../../models/producto.model";
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl:'./producto.component.html',
  styleUrls:['./producto.css'],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<Product>();
  @Output() viewDetails = new EventEmitter<Product>();

  addedToCart = signal(false);

  onAdd(event: Event) {
    event.stopPropagation();
    this.add.emit(this.product);
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 1500);
  }

  onViewDetails() {
    this.viewDetails.emit(this.product);
  }
}
