'use client';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading data...' }: LoadingSpinnerProps) {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <div className="loader rounded-full h-12 w-12 border-4 border-gray-200 mx-auto"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}
