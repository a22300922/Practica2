import { Component, Input} from "@angular/core";
import { Product } from "../../models/producto.model";

@Component({
    selector:'app-producto',
    standalone:true,
    imports:[],
    templateUrl:'./producto.component.html',
    styleUrls:['./producto.css'],
})
export class ProductCardComponent{
    @Input({required:true})product!:Product;
}