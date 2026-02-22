import { useConnect } from 'wagmi'
import { Wallet, ChevronRight } from 'lucide-react'

export default function WalletConnect() {
    const { connectors, connect } = useConnect()

    return (
        <div className="hero fade-in">
            <h1>Cadence Base</h1>
            <p>
                Build consistent USDC savings on Base with structured plans and reminders.
                <br />
                Non-custodial, secure, and simple.
            </p>

            <div className="stats-grid mt-lg">
                <div className="stat-card">
                    <div className="stat-value">$2.4M+</div>
                    <div className="stat-label">Total Saved</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">12K+</div>
                    <div className="stat-label">Active Savers</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">99.9%</div>
                    <div className="stat-label">Uptime</div>
                </div>
            </div>

            <div className="mt-xl">
                <div className="mt-xl">
                    {connectors
                        .filter(connector => connector.id === 'farcaster' || connector.id === 'metaMask' || connector.id === 'coinbaseWalletSDK')
                        .map((connector) => (
                            <button
                                key={connector.uid}
                                onClick={() => connect({ connector })}
                                className="btn-primary w-full mb-3"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <Wallet size={18} />
                                Connect {connector.name}
                                <ChevronRight size={18} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                            </button>
                        ))}
                </div>
            </div>

            <p className="mt-lg text-muted" style={{ fontSize: '0.875rem' }}>
                Your funds stay in your wallet. We never have custody.
            </p>
        </div>
    )
}
