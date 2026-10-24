import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const isAdminRoute = window.location.pathname.startsWith('/admin')

if (!import.meta.env.DEV && isAdminRoute) {
  window.history.replaceState(null, '', '/')
}

const AdminPage = import.meta.env.DEV
  ? lazy(() => import('./components/admin/AdminPage.tsx').then((m) => ({ default: m.AdminPage })))
  : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {import.meta.env.DEV && isAdminRoute && AdminPage ? (
      <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
        <AdminPage />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)

