import { type ReactElement } from 'react';

export const Dashboard = (): ReactElement => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p>Welcome to the protected dashboard!</p>
    </div>
  );
};
