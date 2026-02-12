import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useDisconnect } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { VAULT_ADDRESS, VAULT_ABI, USDC_ADDRESS, USDC_ABI } from '../config'
import { useChainId } from 'wagmi'

interface DashboardProps {
    address: `0x${string}`
}

export default function Dashboard({ address }: DashboardProps) {
    const chainId = useChainId()
    const { disconnect } = useDisconnect()
    const [depositAmount, setDepositAmount] = useState('')
    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [savingsPlan, setSavingsPlan] = useState({
        interval: 'weekly',
        amount: '',
    })

    // Read vault balance
    const { data: vaultStats, refetch: refetchStats } = useReadContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'getUserStats',
        args: [address],
    })

    // Read USDC balance
    const { data: usdcBalance, refetch: refetchUSDC } = useReadContract({
        address: USDC_ADDRESS[chainId as keyof typeof USDC_ADDRESS] as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [address],
    })

    // Approve USDC
    const { writeContract: approveUSDC } = useWriteContract()

    // Deposit
    const { writeContract: depositUSDC, data: depositHash } = useWriteContract()
    const { isSuccess: isDeposited } = useWaitForTransactionReceipt({ hash: depositHash })

    // Withdraw
    const { writeContract: withdrawUSDC, data: withdrawHash } = useWriteContract()
    const { isSuccess: isWithdrawn } = useWaitForTransactionReceipt({ hash: withdrawHash })

    useEffect(() => {
        if (isDeposited || isWithdrawn) {
            refetchStats()
            refetchUSDC()
        }
    }, [isDeposited, isWithdrawn, refetchStats, refetchUSDC])

    const handleDeposit = async () => {
        if (!depositAmount) return

        const amount = parseUnits(depositAmount, 6) // USDC has 6 decimals

        // First approve
        approveUSDC({
            address: USDC_ADDRESS[chainId as keyof typeof USDC_ADDRESS] as `0x${string}`,
            abi: USDC_ABI,
            functionName: 'approve',
            args: [VAULT_ADDRESS as `0x${string}`, amount],
        })

        // Wait for approval, then deposit
        setTimeout(() => {
            depositUSDC({
                address: VAULT_ADDRESS as `0x${string}`,
                abi: VAULT_ABI,
                functionName: 'deposit',
                args: [amount],
            })
        }, 2000)
    }

    const handleWithdraw = async () => {
        if (!withdrawAmount) return

        const amount = parseUnits(withdrawAmount, 6)

        withdrawUSDC({
            address: VAULT_ADDRESS as `0x${string}`,
            abi: VAULT_ABI,
            functionName: 'withdraw',
            args: [amount],
        })
    }

    const balance = vaultStats ? formatUnits(vaultStats[0], 6) : '0'
    const totalSaved = vaultStats ? formatUnits(vaultStats[1], 6) : '0'
    const walletBalance = usdcBalance ? formatUnits(usdcBalance, 6) : '0'

    // Calculate progress (example: goal of 1000 USDC)
    const goal = 1000
    const progress = (parseFloat(totalSaved) / goal) * 100

    return (
        <div className="container fade-in">
            <div className="dashboard-header">
                <h1>Your Savings</h1>
                <div className="wallet-info">
                    <span className="wallet-address">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                    <button className="btn-secondary" onClick={() => disconnect()}>
                        Disconnect
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">${parseFloat(balance).toFixed(2)}</div>
                    <div className="stat-label">Current Balance</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">${parseFloat(totalSaved).toFixed(2)}</div>
                    <div className="stat-label">Total Saved</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">${parseFloat(walletBalance).toFixed(2)}</div>
                    <div className="stat-label">Wallet USDC</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="section">
                <h3 className="section-title">Savings Goal Progress</h3>
                <div className="progress-container">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                    <div className="progress-text">
                        ${parseFloat(totalSaved).toFixed(2)} / ${goal.toFixed(2)} ({progress.toFixed(1)}%)
                    </div>
                </div>
            </div>

            {/* Deposit/Withdraw */}
            <div className="section">
                <div className="card">
                    <h3 className="section-title">Manage Funds</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Deposit USDC</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                            />
                            <button className="btn-primary mt-sm" onClick={handleDeposit}>
                                Deposit
                            </button>
                        </div>
                        <div className="form-group">
                            <label>Withdraw USDC</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                            />
                            <button className="btn-secondary mt-sm" onClick={handleWithdraw}>
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Savings Plan */}
            <div className="section">
                <div className="card">
                    <h3 className="section-title">Create Savings Plan</h3>
                    <div className="form-group">
                        <label>Savings Interval</label>
                        <select
                            value={savingsPlan.interval}
                            onChange={(e) => setSavingsPlan({ ...savingsPlan, interval: e.target.value })}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Amount per Interval (USDC)</label>
                        <input
                            type="number"
                            placeholder="10.00"
                            value={savingsPlan.amount}
                            onChange={(e) => setSavingsPlan({ ...savingsPlan, amount: e.target.value })}
                        />
                    </div>
                    <button className="btn-primary">Create Plan</button>
                    <p className="mt-md text-muted" style={{ fontSize: '0.875rem' }}>
                        You'll receive Farcaster reminders when it's time to save. Deposits are always manual.
                    </p>
                </div>
            </div>
        </div>
    )
}
