
import { WritableSignal } from '@angular/core';
import { finalize, Observable } from 'rxjs';

interface AsyncRequestOptions<T> {
    request: Observable<T>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    errorMessage: string;
    onSuccess: (data: T) => void;
    onError?: () => void;
}

export function handleAsyncRequest<T>({
    request,
    loading,
    error,
    errorMessage,
    onSuccess,
    onError,
}: AsyncRequestOptions<T>): void {
    loading.set(true);
    error.set(null);

    request
        .pipe(finalize(() => loading.set(false)))
        .subscribe({
            next: onSuccess,
            error: () => {
                error.set(errorMessage);
                onError?.();
            },
        });

}