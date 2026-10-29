import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  if (window.location.pathname.replace(/\/$/, '') === '/map-editor') {
    const MapEditor = lazy(() => import('./MapEditor'));
    root.render(<Suspense fallback={<div>Đang mở xưởng vẽ bản đồ…</div>}><MapEditor /></Suspense>);
  } else root.render(<App />);
}
