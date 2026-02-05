'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check if already connected
    const storedAddress = localStorage.getItem('wallet_address')
    if (storedAddress) {
      setAddress(storedAddress)
    }
  }, [])

  const connect = async () => {
    if (!isMounted) return
    
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        if (accounts.length > 0) {
          const addr = accounts[0]
          setAddress(addr)
          localStorage.setItem('wallet_address', addr)
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  const disconnect = () => {
    setAddress(null)
    localStorage.removeItem('wallet_address')
  }

  return {
    address,
    connect,
    disconnect,
    isConnected: !!address
  }
}