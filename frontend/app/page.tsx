'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    ethereum?: any
  }
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('wallet_address')
    if (stored) setAddress(stored)
  }, [])

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          localStorage.setItem('wallet_address', accounts[0])
        }
      } catch (error) {
        console.error('Failed to connect:', error)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  const disconnect = () => {
    setAddress(null)
    localStorage.removeItem('wallet_address')
  }

  if (!mounted) return null

  return (
    <main className="container">
      <div className="hero">
        <h1>Cadence Base</h1>
        <p>Build consistent USDC savings on Base with reminders and your own non-custodial vault.</p>
        
        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">$1.2M+</div>
            <div className="stat-label">Total Saved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">8,400+</div>
            <div className="stat-label">Active Savers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>

        {!address ? (
          <button className="button" onClick={connect}>
            Connect Wallet
          </button>
        ) : (
          <div>
            <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
            <button className="button" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        )}
      </div>
    </main>
  )
}