import { useEffect, useState } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import Dashboard from './pages/Dashboard'
import WalletConnect from './components/WalletConnect'
import './App.css'

function App() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [showWrongNetwork, setShowWrongNetwork] = useState(false)

  useEffect(() => {
    // Check if connected to Base or Base Sepolia
    if (isConnected && chainId !== base.id && chainId !== baseSepolia.id) {
      setShowWrongNetwork(true)
    } else {
      setShowWrongNetwork(false)
    }
  }, [isConnected, chainId])

  const handleSwitchToBase = () => {
    switchChain({ chainId: base.id })
  }

  return (
    <div className="app">
      {!isConnected ? (
        <WalletConnect />
      ) : showWrongNetwork ? (
        <div className="container">
          <div className="wrong-network-card card fade-in">
            <h2>⚠️ Wrong Network</h2>
            <p className="mt-md">
              Please switch to Base network to use Cadence Base.
            </p>
            <button className="btn-primary mt-lg" onClick={handleSwitchToBase}>
              Switch to Base
            </button>
          </div>
        </div>
      ) : (
        <Dashboard address={address!} />
      )}
    </div>
  )
}

export default App
