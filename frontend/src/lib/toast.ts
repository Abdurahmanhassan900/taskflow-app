export interface ToastItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();
let nextId = 1;

const emit = () => listeners.forEach((l) => l());

const remove = (id: number) => {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
};

const add = (type: ToastItem['type'], message: string) => {
  const id = nextId++;
  toasts = [...toasts, { id, type, message }];
  emit();
  setTimeout(() => remove(id), 3000);
};

// A module-level singleton so any component can fire a toast without prop/context
// wiring, e.g. toast.success('Saved').
export const toast = {
  success: (message: string) => add('success', message),
  error: (message: string) => add('error', message),
};

export const subscribeToToasts = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const getToasts = () => toasts;
