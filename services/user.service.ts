import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private platformId = inject(PLATFORM_ID);
  private usersSignal = signal<User[]>([]);

  users = this.usersSignal.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('users');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const users = parsed.map((u: any) => ({
            ...u,
            createdAt: new Date(u.createdAt),
          }));
          this.usersSignal.set(users);
        } catch {
          this.usersSignal.set([]);
        }
      }
    }
  }

  private saveUsers() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('users', JSON.stringify(this.usersSignal()));
    }
  }

  emailExists(email: string): boolean {
    return this.usersSignal().some(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  register(fullName: string, email: string, password: string): User | null {
    if (this.emailExists(email)) return null;

    const newUser: User = {
      id: Date.now(),
      fullName,
      email: email.toLowerCase(),
      password,
      createdAt: new Date(),
    };

    this.usersSignal.update(users => [...users, newUser]);
    this.saveUsers();
    return newUser;
  }

  findByEmail(email: string): User | undefined {
    return this.usersSignal().find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  validateCredentials(email: string, password: string): User | null {
    const user = this.findByEmail(email);
    return user && user.password === password ? user : null;
  }

  getUserById(id: number): User | undefined {
    return this.usersSignal().find(u => u.id === id);
  }
}
