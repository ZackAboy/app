import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: { message: string; color: 'success' | 'danger'; show: boolean }[] = [];

  show(message: string, color: 'success' | 'danger' = 'success'): void {
    const toast = { message, color, show: true };
    this.toasts.push(toast);

    setTimeout(() => {
      toast.show = false;
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t !== toast);
      }, 300);
    }, 3000);
  }

  getToasts() {
    return this.toasts;
  }
}