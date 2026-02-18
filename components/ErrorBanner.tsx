'use client';

interface ErrorBannerProps {
  error: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <strong>Error:</strong> {error}
      <button onClick={onDismiss} className="float-right font-bold">&times;</button>
    </div>
  );
}
