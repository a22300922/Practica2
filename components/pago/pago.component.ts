import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ViewChild,
  ElementRef,
  signal,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService }        from '../../services/carrito.service';
import { EnvioService }          from '../../services/envio.service';
import { PagoService }           from '../../services/pago.service';
import { PaypalSdkService }      from '../../services/paypal-sdk.service';
import { ResumenEnvioComponent } from './resumen-envio/resumen-envio.component';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, NgClass, ResumenEnvioComponent],
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css'],
})
export class PagoComponent implements OnInit, OnDestroy, AfterViewChecked {

  // ── Servicios ─────────────────────────────────────────────────────────────
  carritoService   = inject(CarritoService);
  envioService     = inject(EnvioService);
  pagoService      = inject(PagoService);
  private paypalSdk = inject(PaypalSdkService);
  private router   = inject(Router);

  // ── Referencia al contenedor de botones PayPal ────────────────────────────
  @ViewChild('paypalButtonContainer') paypalButtonContainer?: ElementRef<HTMLElement>;

  // ── Estado de UI ──────────────────────────────────────────────────────────
  metodoPago = signal<'tarjeta' | 'paypal'>('tarjeta');

  /** Evita renderizar los botones más de una vez por ciclo */
  private _paypalRendered = false;

  /** Señal para mostrar spinner mientras PayPal captura el pago */
  sdkCapturando = signal(false);

  // Formulario tarjeta
  titularTarjeta  = signal('');
  numeroTarjeta   = signal('');
  fechaExpiracion = signal('');
  cvv             = signal('');

  // ── Totales reactivos ─────────────────────────────────────────────────────
  get items()  { return this.carritoService.items; }
  subtotal     = computed(() => this.carritoService.total());
  total        = computed(() => this.subtotal() + this.envioService.costoEnvio());

  // ── Validaciones ──────────────────────────────────────────────────────────
  get formTarjetaValido(): boolean {
    return (
      this.titularTarjeta().trim().length > 3 &&
      this.numeroTarjeta().replace(/\s/g, '').length === 16 &&
      this.fechaExpiracion().length === 5 &&
      this.cvv().length >= 3
    );
  }

  get puedePagar(): boolean {
    return this.formTarjetaValido && this.carritoService.items().length > 0;
  }

  // ── Ciclo de vida ─────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.pagoService.resetear();
  }

  ngOnDestroy(): void {
    if (this.pagoService.estado() === 'procesando') {
      this.pagoService.resetear();
    }
  }

  /**
   * Se ejecuta después de cada ciclo de detección de cambios.
   * Cuando el tab de PayPal está visible y el contenedor aparece en el DOM,
   * renderiza los botones una sola vez.
   */
  ngAfterViewChecked(): void {
    if (
      this.metodoPago() === 'paypal' &&
      !this._paypalRendered &&
      this.paypalButtonContainer?.nativeElement
    ) {
      this._paypalRendered = true;
      this._renderPaypalButtons();
    }

    // Si el usuario cambia a tarjeta, permitir re-render al volver a PayPal
    if (this.metodoPago() === 'tarjeta') {
      this._paypalRendered = false;
    }
  }

  // ── Renderizado SDK PayPal ────────────────────────────────────────────────

  private _renderPaypalButtons(): void {
    const container = this.paypalButtonContainer?.nativeElement;
    if (!container) return;

    this.paypalSdk
      .renderButtons(container, {
        createOrder: () => this.pagoService.crearOrdenPaypal(),

        onApprove: async (data) => {
          this.sdkCapturando.set(true);
          try {
            await this.pagoService.capturarPaypal(data.orderID);
          } finally {
            this.sdkCapturando.set(false);
          }
        },

        onError: (err) => {
          console.error('[PayPal SDK] Error en botones:', err);
          this.pagoService['_setError']('paypal_error');
        },

        onCancel: () => {
          console.log('[PayPal SDK] Pago cancelado');
        },
      })
      .catch((err) => {
        console.error('[PaypalSdkService] renderButtons falló:', err);
        this.pagoService['_setError']('paypal_error');
      });
  }

  // ── Acciones ──────────────────────────────────────────────────────────────

  procesarPago(): void {
    if (!this.puedePagar) return;
    this.pagoService.procesarPago('card_simulated');
  }

  reintentar(): void {
    this._paypalRendered = false;
    this.pagoService.reintentar();
  }

  verPedido(): void {
    const pedido = this.pagoService.pedidoCreado();
    if (pedido) this.router.navigate(['/pedido', pedido.id]);
  }

  volver(): void       { this.router.navigate(['/carrito']); }
  volverTienda(): void { this.router.navigate(['/']); }
  irACuenta(): void    { this.router.navigate(['/cuenta']); }

  // ── Formateo de inputs ────────────────────────────────────────────────────

  formatearNumeroTarjeta(event: Event): void {
    const input  = event.target as HTMLInputElement;
    let valor    = input.value.replace(/\D/g, '');
    let formateado = '';
    for (let i = 0; i < valor.length; i++) {
      if (i > 0 && i % 4 === 0) formateado += ' ';
      formateado += valor[i];
    }
    this.numeroTarjeta.set(formateado.substring(0, 19));
    input.value = this.numeroTarjeta();
  }

  formatearExpiracion(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor   = input.value.replace(/\D/g, '');
    if (valor.length >= 2) valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
    this.fechaExpiracion.set(valor.substring(0, 5));
    input.value = this.fechaExpiracion();
  }
}
