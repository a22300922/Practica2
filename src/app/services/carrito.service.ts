import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product, CartItem } from '../models/producto.model';
import { CfdiService } from './cfdi.service';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private platformId = inject(PLATFORM_ID);
  private cfdiService = inject(CfdiService);
  
  // Lista reactiva del carrito con cantidades
  private itemsSignal = signal<CartItem[]>([]);

  // Exponer como readonly
  items = this.itemsSignal.asReadonly();

  // Contador total de items
  itemCount = computed(() => 
    this.itemsSignal().reduce((acc, item) => acc + item.quantity, 0)
  );

  // Total del carrito
  total = computed(() => 
    this.itemsSignal().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  constructor() {
    // Cargar carrito desde localStorage al iniciar
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('carrito');
      if (saved) {
        try {
          this.itemsSignal.set(JSON.parse(saved));
        } catch {
          this.itemsSignal.set([]);
        }
      }

      // Guardar en localStorage cuando cambie
      effect(() => {
        const items = this.itemsSignal();
        localStorage.setItem('carrito', JSON.stringify(items));
      });
    }
  }

  agregar(producto: Product, cantidad: number = 1) {
    this.itemsSignal.update(lista => {
      const existente = lista.find(item => item.product.id === producto.id);
      if (existente) {
        return lista.map(item => 
          item.product.id === producto.id 
            ? { ...item, quantity: item.quantity + cantidad }
            : item
        );
      }
      return [...lista, { product: producto, quantity: cantidad }];
    });
  }

  actualizarCantidad(productId: number, cantidad: number) {
    if (cantidad <= 0) {
      this.quitar(productId);
      return;
    }
    this.itemsSignal.update(lista => 
      lista.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: cantidad }
          : item
      )
    );
  }

  quitar(id: number) {
    this.itemsSignal.update(lista => lista.filter(item => item.product.id !== id));
  }

  vaciar() {
    this.itemsSignal.set([]);
  }

  exportarXML() {
    const xml = this.cfdiService.generateCFDI40({
      emisor: {
        rfc: 'MIE010101AAA',
        nombre: 'Mieles del Pirineo S.A. de C.V.',
        regimenFiscal: '601'
      },
      receptor: {
        rfc: 'XAXX010101000',
        nombre: 'Publico en General',
        domicilioFiscalReceptor: '00000',
        regimenFiscalReceptor: '616',
        usoCFDI: 'S01'
      },
      conceptos: this.itemsSignal(),
      formaPago: '01',
      metodoPago: 'PUE',
      moneda: 'MXN',
      tipoDeComprobante: 'I',
      exportacion: '01',
      lugarExpedicion: '00000'
    });

    this.cfdiService.downloadCFDI(xml, `CFDI_${Date.now().toString(36).toUpperCase()}.xml`);
  }
}
