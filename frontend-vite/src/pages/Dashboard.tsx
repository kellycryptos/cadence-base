import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useDisconnect } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { VAULT_ADDRESS, VAULT_ABI, USDC_ADDRESS, USDC_ABI } from '../utils/config'
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
    const [planStatus, setPlanStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const usdcAddress = USDC_ADDRESS[chainId as keyof typeof USDC_ADDRESS] as `0x${string}`
    const vaultAddress = VAULT_ADDRESS as `0x${string}`

    // Read vault stats
    const { data: vaultStats, refetch: refetchStats } = useReadContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'getUserStats',
        args: [address],
    })

    // Read USDC balance
    const { data: usdcBalance, refetch: refetchUSDC } = useReadContract({
        address: usdcAddress,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [address],
    })

    // Read Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: usdcAddress,
        abi: USDC_ABI,
        functionName: 'allowance',
        args: [address, vaultAddress],
    })

    // Write Hooks
    const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract()
    const { writeContract: writeDeposit, data: depositHash, isPending: isDepositPending } = useWriteContract()
    const { writeContract: writeWithdraw, data: withdrawHash, isPending: isWithdrawPending } = useWriteContract()

    // Transaction Receipts
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })
    const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash })
    const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash })

    useEffect(() => {
        if (isApproveSuccess) refetchAllowance()
        if (isDepositSuccess || isWithdrawSuccess) {
            refetchStats()
            refetchUSDC()
            setDepositAmount('')
            setWithdrawAmount('')
        }
    }, [isApproveSuccess, isDepositSuccess, isWithdrawSuccess, refetchAllowance, refetchStats, refetchUSDC])

    const handleApprove = () => {
        if (!depositAmount) return
        const amount = parseUnits(depositAmount, 6)
        writeApprove({
            address: usdcAddress,
            abi: USDC_ABI,
            functionName: 'approve',
            args: [vaultAddress, amount],
        })
    }

    const handleDeposit = () => {
        if (!depositAmount) return
        const amount = parseUnits(depositAmount, 6)
        writeDeposit({
            address: vaultAddress,
            abi: VAULT_ABI,
            functionName: 'deposit',
            args: [amount],
        })
    }

    const handleWithdraw = () => {
        if (!withdrawAmount) return
        const amount = parseUnits(withdrawAmount, 6)
        writeWithdraw({
            address: vaultAddress,
            abi: VAULT_ABI,
            functionName: 'withdraw',
            args: [amount],
        })
    }

    const handleCreatePlan = async () => {
        if (!savingsPlan.amount) return
        setPlanStatus('loading')
        try {
            const response = await fetch('/api/savings-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAddress: address,
                    interval: savingsPlan.interval,
                    amount: savingsPlan.amount
                })
            })
            if (!response.ok) throw new Error('Failed to create plan')
            setPlanStatus('success')
            setSavingsPlan(prev => ({ ...prev, amount: '' }))
            setTimeout(() => setPlanStatus('idle'), 3000)
        } catch (error) {
            console.error(error)
            setPlanStatus('error')
            setTimeout(() => setPlanStatus('idle'), 3000)
        }
    }

    const balance = vaultStats ? formatUnits(vaultStats[0], 6) : '0'
    const totalSaved = vaultStats ? formatUnits(vaultStats[1], 6) : '0' // Using same value for now as per contract
    const walletBalance = usdcBalance ? formatUnits(usdcBalance, 6) : '0'
    const currentAllowance = allowance ? allowance : 0n

    const parsedDepositAmount = depositAmount ? parseUnits(depositAmount, 6) : 0n
    const needsApproval = parsedDepositAmount > currentAllowance

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
                    <div className="stat-label">Vault Balance</div>
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
                            {needsApproval ? (
                                <button
                                    className="btn-primary mt-sm"
                                    onClick={handleApprove}
                                    disabled={isApprovePending || isApproveConfirming || !depositAmount}
                                >
                                    {isApprovePending || isApproveConfirming ? 'Approving...' : 'Approve USDC'}
                                </button>
                            ) : (
                                <button
                                    className="btn-primary mt-sm"
                                    onClick={handleDeposit}
                                    disabled={isDepositPending || isDepositConfirming || !depositAmount}
                                >
                                    {isDepositPending || isDepositConfirming ? 'Depositing...' : 'Deposit'}
                                </button>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Withdraw USDC</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                            />
                            <button
                                className="btn-secondary mt-sm"
                                onClick={handleWithdraw}
                                disabled={isWithdrawPending || isWithdrawConfirming || !withdrawAmount}
                            >
                                {isWithdrawPending || isWithdrawConfirming ? 'Withdrawing...' : 'Withdraw'}
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
                    <button
                        className="btn-primary"
                        onClick={handleCreatePlan}
                        disabled={planStatus === 'loading' || !savingsPlan.amount}
                    >
                        {planStatus === 'loading' ? 'Creating...' : 'Create Plan'}
                    </button>
                    {planStatus === 'success' && <p className="success-text mt-sm">Plan created successfully!</p>}
                    {planStatus === 'error' && <p className="error-text mt-sm">Failed to create plan.</p>}
                    <p className="mt-md text-muted" style={{ fontSize: '0.875rem' }}>
                        You'll receive Farcaster reminders when it's time to save. Deposits are always manual.
                    </p>
                </div>
            </div>
        </div>
    )
}
