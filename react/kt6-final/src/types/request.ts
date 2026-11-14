export type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T }

export const idle = { status: 'idle' } as const
export const loading = { status: 'loading' } as const
