import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService }            from '../../services/auth.service';
import { OrderService }           from '../../services/order.service';
import { AddressService }         from '../../services/address.service';
import { OrderHistoryComponent }  from './order-history/order-history.component';
import { AddressListComponent }   from './address-list/address-list.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [OrderHistoryComponent, AddressListComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  authService    = inject(AuthService);
  orderService   = inject(OrderService);
  addressService = inject(AddressService);
  private router = inject(Router);

  activeTab = signal<'orders' | 'addresses'>('orders');

  get user()      { return this.authService.currentUser; }
  get orders()    { return this.orderService.userOrders; }
  get addresses() { return this.addressService.userAddresses; }

  ngOnInit(): void {
    // Siempre recargar pedidos y direcciones al entrar a la cuenta
    // (garantiza datos frescos tras un pago reciente)
    this.orderService.loadUserOrders();
    this.addressService.loadAddresses();
  }

  setTab(tab: 'orders' | 'addresses') { this.activeTab.set(tab); }
  logout() { this.authService.logout(); }
  goHome() { this.router.navigate(['/']); }
}
