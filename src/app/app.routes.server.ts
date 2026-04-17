import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Client
  },
  {
    path: 'catalogo',
    renderMode: RenderMode.Client
  },
  {
    path: 'producto/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'carrito',
    renderMode: RenderMode.Client
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
