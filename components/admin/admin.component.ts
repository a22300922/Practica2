import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus, ShippingStatus } from '../../models/user.model';

const API = 'http://localhost:4000/api/admin';

export interface AdminProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description: string;
  inStock: boolean;
  stock: number;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  private http        = inject(HttpClient);
  private authService = inject(AuthService);
  private router      = inject(Router);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  activeTab = signal<'pedidos' | 'productos' | 'usuarios'>('pedidos');

  // ── Pedidos ───────────────────────────────────────────────────────────────
  pedidos       = signal<Order[]>([]);
  cargandoPedidos = signal(true);

  readonly orderStatuses: { value: OrderStatus; label: string }[] = [
    { value: 'pending',    label: 'Pendiente'   },
    { value: 'processing', label: 'Procesando'  },
    { value: 'shipped',    label: 'Enviado'      },
    { value: 'delivered',  label: 'Entregado'    },
    { value: 'cancelled',  label: 'Cancelado'    },
  ];

  readonly shippingStatuses: { value: ShippingStatus; label: string }[] = [
    { value: 'pending',          label: 'Confirmado'  },
    { value: 'ready',            label: 'Preparando'  },
    { value: 'picked_up',        label: 'Recolectado' },
    { value: 'in_transit',       label: 'En camino'   },
    { value: 'out_for_delivery', label: 'En reparto'  },
    { value: 'delivered',        label: 'Entregado'   },
  ];

  // ── Productos ─────────────────────────────────────────────────────────────
  productos        = signal<AdminProduct[]>([]);
  cargandoProductos = signal(true);
  editandoProducto = signal<AdminProduct | null>(null);
  mostrarFormProducto = signal(false);

  productoForm: Partial<AdminProduct> = {};

  readonly categorias = ['Cremas', 'Esencias', 'Mieles', 'Jabones', 'Aceites', 'Otros'];

  // ── Usuarios ──────────────────────────────────────────────────────────────
  usuarios        = signal<AdminUser[]>([]);
  cargandoUsuarios = signal(true);

  // ── Notificaciones ────────────────────────────────────────────────────────
  toast = signal<{ msg: string; tipo: 'ok' | 'err' } | null>(null);

  // ─────────────────────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.cargarPedidos(),
      this.cargarProductos(),
      this.cargarUsuarios(),
    ]);
  }

  // ── Carga de datos ────────────────────────────────────────────────────────

  async cargarPedidos(): Promise<void> {
    this.cargandoPedidos.set(true);
    try {
      const data = await firstValueFrom(this.http.get<Order[]>(`${API}/pedidos`));
      this.pedidos.set(data);
    } catch { this.pedidos.set([]); }
    finally { this.cargandoPedidos.set(false); }
  }

  async cargarProductos(): Promise<void> {
    this.cargandoProductos.set(true);
    try {
      const data = await firstValueFrom(this.http.get<AdminProduct[]>(`${API}/productos`));
      this.productos.set(data);
    } catch { this.productos.set([]); }
    finally { this.cargandoProductos.set(false); }
  }

  async cargarUsuarios(): Promise<void> {
    this.cargandoUsuarios.set(true);
    try {
      const data = await firstValueFrom(this.http.get<AdminUser[]>(`${API}/usuarios`));
      this.usuarios.set(data);
    } catch { this.usuarios.set([]); }
    finally { this.cargandoUsuarios.set(false); }
  }

  // ── Pedidos — cambio de estado ────────────────────────────────────────────

  async cambiarEstadoPedido(id: string, field: 'orderStatus' | 'shippingStatus', value: string): Promise<void> {
    try {
      const updated = await firstValueFrom(
        this.http.put<Order>(`${API}/pedidos/${id}/status`, { [field]: value })
      );
      this.pedidos.update(list => list.map(p => p.id === id ? updated : p));
      this.showToast('Estado actualizado', 'ok');
    } catch {
      this.showToast('Error al actualizar estado', 'err');
    }
  }

  // ── Productos — CRUD ──────────────────────────────────────────────────────

  abrirNuevoProducto(): void {
    this.productoForm = { inStock: true, stock: 10 };
    this.editandoProducto.set(null);
    this.mostrarFormProducto.set(true);
  }

  abrirEditar(p: AdminProduct): void {
    this.productoForm = { ...p };
    this.editandoProducto.set(p);
    this.mostrarFormProducto.set(true);
  }

  cancelarForm(): void {
    this.mostrarFormProducto.set(false);
    this.editandoProducto.set(null);
    this.productoForm = {};
  }

  async guardarProducto(): Promise<void> {
    const f = this.productoForm;
    if (!f.name || !f.price || !f.category) {
      this.showToast('Nombre, precio y categoría son requeridos', 'err');
      return;
    }
    try {
      const editing = this.editandoProducto();
      if (editing) {
        const updated = await firstValueFrom(
          this.http.put<AdminProduct>(`${API}/productos/${editing.id}`, f)
        );
        this.productos.update(list => list.map(p => p.id === editing.id ? updated : p));
        this.showToast('Producto actualizado', 'ok');
      } else {
        const created = await firstValueFrom(
          this.http.post<AdminProduct>(`${API}/productos`, f)
        );
        this.productos.update(list => [...list, created]);
        this.showToast('Producto creado', 'ok');
      }
      this.cancelarForm();
    } catch {
      this.showToast('Error al guardar producto', 'err');
    }
  }

  async eliminarProducto(id: number): Promise<void> {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await firstValueFrom(this.http.delete(`${API}/productos/${id}`));
      this.productos.update(list => list.filter(p => p.id !== id));
      this.showToast('Producto eliminado', 'ok');
    } catch {
      this.showToast('Error al eliminar producto', 'err');
    }
  }

  async toggleStock(p: AdminProduct): Promise<void> {
    try {
      const updated = await firstValueFrom(
        this.http.put<AdminProduct>(`${API}/productos/${p.id}`, { ...p, inStock: !p.inStock })
      );
      this.productos.update(list => list.map(x => x.id === p.id ? updated : x));
    } catch {
      this.showToast('Error al actualizar disponibilidad', 'err');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private showToast(msg: string, tipo: 'ok' | 'err'): void {
    this.toast.set({ msg, tipo });
    setTimeout(() => this.toast.set(null), 3000);
  }

  getOrderStatusLabel(s: string): string {
    return this.orderStatuses.find(x => x.value === s)?.label ?? s;
  }

  getShippingLabel(s: string): string {
    return this.shippingStatuses.find(x => x.value === s)?.label ?? s;
  }

  logout(): void  { this.authService.logout(); }
  goHome(): void  { this.router.navigate(['/']); }
}
