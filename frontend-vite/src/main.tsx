import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './utils/config'
import { FarcasterProvider } from './components/FarcasterProvider'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FarcasterProvider>
          <App />
        </FarcasterProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
