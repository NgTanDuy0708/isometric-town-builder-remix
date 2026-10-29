import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  if (window.location.pathname.replace(/\/$/, '') === '/warehouse-editor') {
    const WarehouseEditor = lazy(() => import('./WarehouseEditor'));
    root.render(<Suspense fallback={<div>Đang mở trình chỉnh kho…</div>}><WarehouseEditor /></Suspense>);
  } else if (window.location.pathname.replace(/\/$/, '') === '/town-hall-editor') {
    const TownHallEditor = lazy(() => import('./TownHallEditor'));
    root.render(<Suspense fallback={<div>Đang mở trình chỉnh tòa thị chính…</div>}><TownHallEditor /></Suspense>);
  } else if (window.location.pathname.replace(/\/$/, '') === '/map-editor') {
    const MapEditor = lazy(() => import('./MapEditor'));
    root.render(<Suspense fallback={<div>Đang mở xưởng vẽ bản đồ…</div>}><MapEditor /></Suspense>);
  } else root.render(<App />);
}
