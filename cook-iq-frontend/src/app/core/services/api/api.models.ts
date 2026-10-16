export interface ApiError {
    status: number;
    message: string;
}

export function toApiError(e: any): ApiError {
    return {
        status: e?.status ?? 0,
        message:
            e?.error?.error?.message ??
            e?.error?.message ??
            (e?.status === 0 ? 'Cannot reach the server.' : 'Something went wrong.'),
    };
}
