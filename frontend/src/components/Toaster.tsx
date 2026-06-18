import { useSyncExternalStore } from 'react';
import { subscribeToToasts, getToasts } from '../lib/toast';

export const Toaster = () => {
  const items = useSyncExternalStore(subscribeToToasts, getToasts, getToasts);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-2 rounded-md shadow-lg text-sm text-white ${
            t.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};
