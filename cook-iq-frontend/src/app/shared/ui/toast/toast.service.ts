import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'secondary' | 'contrast';

export interface ToastMessage {
    id: number;
    severity: ToastVariant;
    summary: string;
    detail: string;
    duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private counter = 0;

    toasts = signal<ToastMessage[]>([]);

    add(message: Omit<ToastMessage, 'id'>) {
        const id = ++this.counter;

        const durationMap: Record<ToastVariant, number> = {
            success: 2800,
            info: 3000,
            warning: 4000,
            error: 5000,
            secondary: 2500,
            contrast: 3000,
        };

        const toast: ToastMessage = {
            id,
            duration: durationMap[message.severity] || 3000,
            ...message,
        };

        this.toasts.update((prev) => [...prev, toast]);

        setTimeout(() => {
            this.remove(id);
        }, toast.duration);
    }

    remove(id: number) {
        this.toasts.update((prev) => prev.filter((t) => t.id !== id));
    }

}