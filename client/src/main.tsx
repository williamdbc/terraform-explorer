import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from '@/components/ui/sonner.tsx'
import { AuthInitializer } from '@/components/auth/AuthInitializer.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster />
    <AuthInitializer />
  </StrictMode>,
)
