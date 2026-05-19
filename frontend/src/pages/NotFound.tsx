import { type ReactElement } from 'react';

export const NotFound = (): ReactElement => {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-xl">Page not found</p>
    </div>
  );
};
