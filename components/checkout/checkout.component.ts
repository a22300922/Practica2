import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { CfdiService, CFDIData } from '../../services/cfdi.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { Address } from '../../models/user.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent {
  // Form fields - Cliente
  nombre = signal('');
  email = signal('');
  telefono = signal('');
  direccion = signal('');
  ciudad = signal('');
  codigoPostal = signal('');
  notas = signal('');

  // Form fields - Datos fiscales
  requiereFactura = signal(false);
  rfcCliente = signal('');
  nombreFiscal = signal('');
  regimenFiscal = signal('601');
  usoCFDI = signal('G03');
  domicilioFiscal = signal('');

  // Payment
  formaPago = signal('01');
  metodoPago = signal('PUE');

  // State
  submitting = signal(false);
  orderComplete = signal(false);
  orderNumber = signal('');

  // Catalogos SAT
  regimenesFiscales = [
    { clave: '601', descripcion: 'General de Ley Personas Morales' },
    { clave: '603', descripcion: 'Personas Morales con Fines no Lucrativos' },
    { clave: '605', descripcion: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
    { clave: '606', descripcion: 'Arrendamiento' },
    { clave: '607', descripcion: 'Regimen de Enajenacion o Adquisicion de Bienes' },
    { clave: '608', descripcion: 'Demas ingresos' },
    { clave: '610', descripcion: 'Residentes en el Extranjero sin Establecimiento Permanente en Mexico' },
    { clave: '611', descripcion: 'Ingresos por Dividendos (socios y accionistas)' },
    { clave: '612', descripcion: 'Personas Fisicas con Actividades Empresariales y Profesionales' },
    { clave: '614', descripcion: 'Ingresos por intereses' },
    { clave: '615', descripcion: 'Regimen de los ingresos por obtencion de premios' },
    { clave: '616', descripcion: 'Sin obligaciones fiscales' },
    { clave: '620', descripcion: 'Sociedades Cooperativas de Produccion que optan por diferir sus ingresos' },
    { clave: '621', descripcion: 'Incorporacion Fiscal' },
    { clave: '622', descripcion: 'Actividades Agricolas, Ganaderas, Silvicolas y Pesqueras' },
    { clave: '623', descripcion: 'Opcional para Grupos de Sociedades' },
    { clave: '624', descripcion: 'Coordinados' },
    { clave: '625', descripcion: 'Regimen de las Actividades Empresariales con ingresos a traves de Plataformas Tecnologicas' },
    { clave: '626', descripcion: 'Regimen Simplificado de Confianza' },
  ];

  usosCFDI = [
    { clave: 'G01', descripcion: 'Adquisicion de mercancias' },
    { clave: 'G02', descripcion: 'Devoluciones, descuentos o bonificaciones' },
    { clave: 'G03', descripcion: 'Gastos en general' },
    { clave: 'I01', descripcion: 'Construcciones' },
    { clave: 'I02', descripcion: 'Mobiliario y equipo de oficina por inversiones' },
    { clave: 'I03', descripcion: 'Equipo de transporte' },
    { clave: 'I04', descripcion: 'Equipo de computo y accesorios' },
    { clave: 'I05', descripcion: 'Dados, troqueles, moldes, matrices y herramental' },
    { clave: 'I06', descripcion: 'Comunicaciones telefonicas' },
    { clave: 'I07', descripcion: 'Comunicaciones satelitales' },
    { clave: 'I08', descripcion: 'Otra maquinaria y equipo' },
    { clave: 'D01', descripcion: 'Honorarios medicos, dentales y gastos hospitalarios' },
    { clave: 'D02', descripcion: 'Gastos medicos por incapacidad o discapacidad' },
    { clave: 'D03', descripcion: 'Gastos funerales' },
    { clave: 'D04', descripcion: 'Donativos' },
    { clave: 'D05', descripcion: 'Intereses reales efectivamente pagados por creditos hipotecarios (casa habitacion)' },
    { clave: 'D06', descripcion: 'Aportaciones voluntarias al SAR' },
    { clave: 'D07', descripcion: 'Primas por seguros de gastos medicos' },
    { clave: 'D08', descripcion: 'Gastos de transportacion escolar obligatoria' },
    { clave: 'D09', descripcion: 'Depositos en cuentas para el ahorro, primas que tengan como base planes de pensiones' },
    { clave: 'D10', descripcion: 'Pagos por servicios educativos (colegiaturas)' },
    { clave: 'S01', descripcion: 'Sin efectos fiscales' },
    { clave: 'CP01', descripcion: 'Pagos' },
    { clave: 'CN01', descripcion: 'Nomina' },
  ];

  formasPago = [
    { clave: '01', descripcion: 'Efectivo' },
    { clave: '02', descripcion: 'Cheque nominativo' },
    { clave: '03', descripcion: 'Transferencia electronica de fondos' },
    { clave: '04', descripcion: 'Tarjeta de credito' },
    { clave: '28', descripcion: 'Tarjeta de debito' },
    { clave: '99', descripcion: 'Por definir' },
  ];

  private carritoService  = inject(CarritoService);
  private cfdiService     = inject(CfdiService);
  private orderService    = inject(OrderService);
  private authService     = inject(AuthService);
  private addressService  = inject(AddressService);
  private router          = inject(Router);

  constructor() {
    // Pre-llenar con datos del usuario autenticado y su dirección predeterminada
    const user = this.authService.currentUser();
    if (user) {
      this.nombre.set(user.fullName);
      this.email.set(user.email);
    }

    const addr = this.addressService.defaultAddress();
    if (addr) {
      this.telefono.set(addr.phone);
      this.direccion.set(addr.street);
      this.ciudad.set(addr.city);
      this.codigoPostal.set(addr.postalCode);
    }
  }

  get items()   { return this.carritoService.items; }
  get total()   { return this.carritoService.total; }
  get subtotal(){ return this.carritoService.total() / 1.16; }
  get iva()     { return this.carritoService.total() - this.subtotal; }

  get isFormValid() {
    const basicValid = this.nombre().trim() && 
           this.email().trim() && 
           this.telefono().trim() && 
           this.direccion().trim() && 
           this.ciudad().trim() && 
           this.codigoPostal().trim();
    
    if (this.requiereFactura()) {
      return basicValid && 
             this.rfcCliente().trim() && 
             this.nombreFiscal().trim() &&
             this.domicilioFiscal().trim();
    }
    
    return basicValid;
  }

  volver() {
    this.router.navigate(['/carrito']);
  }

  volverTienda() {
    this.router.navigate(['/']);
  }

  submitOrder() {
    if (!this.isFormValid || this.items().length === 0) return;

    this.submitting.set(true);

    setTimeout(async () => {
      // Construir dirección desde el formulario
      const address: Address = {
        id:         0,
        userId:     0,
        label:      'Checkout',
        fullName:   this.nombre(),
        street:     this.direccion(),
        city:       this.ciudad(),
        postalCode: this.codigoPostal(),
        phone:      this.telefono(),
        isDefault:  false,
      };

      // Guardar el pedido en OrderService (solo si el usuario tiene sesión)
      const savedOrder = await this.orderService.createOrder({ shippingAddress: address });
      // Si no hay sesión activa, generar un ID local de respaldo
      this.orderNumber.set(savedOrder?.id ?? ('ORD-' + Date.now().toString(36).toUpperCase()));

      this.generarCFDI();
      this.carritoService.vaciar();
      this.submitting.set(false);
      this.orderComplete.set(true);
    }, 1500);
  }

  private generarCFDI() {
    const esFactura = this.requiereFactura();

    const cfdiData: CFDIData = {
      emisor: {
        rfc: 'MIE010101AAA',
        nombre: 'Mieles del Pirineo S.A. de C.V.',
        regimenFiscal: '601'
      },
      receptor: {
        rfc: esFactura ? this.rfcCliente() : 'XAXX010101000',
        nombre: esFactura ? this.nombreFiscal() : this.nombre(),
        domicilioFiscalReceptor: esFactura ? this.domicilioFiscal() : this.codigoPostal(),
        regimenFiscalReceptor: esFactura ? this.regimenFiscal() : '616',
        usoCFDI: esFactura ? this.usoCFDI() : 'S01'
      },
      conceptos: this.items(),
      formaPago: esFactura ? this.formaPago() : '01',
      metodoPago: esFactura ? this.metodoPago() : 'PUE',
      moneda: 'MXN',
      tipoDeComprobante: 'I',
      exportacion: '01',
      lugarExpedicion: this.codigoPostal()
    };

    const xml = this.cfdiService.generateCFDI40(cfdiData);
    this.cfdiService.downloadCFDI(xml, `CFDI_${this.orderNumber()}.xml`);
  }
}
