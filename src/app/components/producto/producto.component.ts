import { Component, Input} from "@angular/core";
import { Product } from "../../models/producto.model";
import { EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [],
  templateUrl:'./producto.component.html',
  styleUrls:['./producto.css'],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<Product>();

  onAdd() {
    this.add.emit(this.product);
  }
}
