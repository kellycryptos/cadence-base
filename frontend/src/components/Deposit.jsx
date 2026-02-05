import { useState, useEffect } from 'react';
import { parseUSDC } from '../utils/contracts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function Deposit({ userAddress, vaultAddress, contract, onNavigate }) {
  const [amount, setAmount] = useState('');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // '', 'approving', 'depositing', 'success'
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  // Fetch user's USDC balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!contract.getUSDCBalance || !userAddress) return;

      try {
        const balance = await contract.getUSDCBalance(userAddress);
        setUsdcBalance(balance);
      } catch (error) {
        console.error('Failed to fetch USDC balance:', error);
      }
    };

    fetchBalance();
  }, [contract, userAddress]);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(usdcBalance)) {
      setError('Insufficient USDC balance');
      return;
    }

    setError('');
    setLoading(true);
    setStatus('approving');

    try {
      // Step 1: Check allowance
      const currentAllowance = await contract.getUSDCAllowance(userAddress, vaultAddress);
      
      if (parseFloat(currentAllowance) < parseFloat(amount)) {
        // Need to approve
        setStatus('approving');
        const approveHash = await contract.approveUSDC(vaultAddress, amount, userAddress);
        console.log('Approval tx:', approveHash);
      }

      // Step 2: Deposit
      setStatus('depositing');
      const depositHash = await contract.depositToVault(vaultAddress, amount, userAddress);
      setTxHash(depositHash);
      console.log('Deposit tx:', depositHash);

      // Step 3: Update backend
      try {
        await fetch(`${API_URL}/api/plan/${userAddress}/deposit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseFloat(amount),
            txHash: depositHash
          })
        });
      } catch (err) {
        console.error('Failed to update backend:', err);
      }

      setStatus('success');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 2000);
    } catch (err) {
      console.error('Deposit failed:', err);
      setError(err.message || 'Deposit failed. Please try again.');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <button 
        className="button button-outline mb-2"
        onClick={() => onNavigate('dashboard')}
        style={{ width: 'auto', padding: '8px 16px' }}
        disabled={loading}
      >
        ← Back
      </button>

      <div className="text-center mb-3">
        <h1>Deposit USDC</h1>
        <p>Add funds to your savings vault</p>
      </div>

      {status === 'success' ? (
        <div className="card text-center">
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✓</div>
          <h2 className="text-accent mb-2">Deposit Successful!</h2>
          <p className="mb-2">Your USDC has been saved to your vault</p>
          <div className="alert alert-info" style={{ fontSize: '0.875rem' }}>
            <strong>Transaction:</strong> {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </div>
        </div>
      ) : (
        <>
          <div className="card mb-2">
            <div className="input-group">
              <label className="input-label">
                Amount (USDC)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '8px',
                fontSize: '0.875rem',
                color: 'var(--color-text-tertiary)'
              }}>
                <span>Your balance: {usdcBalance} USDC</span>
                <button
                  type="button"
                  onClick={() => setAmount(usdcBalance)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  disabled={loading}
                >
                  Max
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error mt-2">
                {error}
              </div>
            )}

            {status && (
              <div className="alert alert-info mt-2">
                {status === 'approving' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="spinner"></div>
                    Approving USDC...
                  </span>
                )}
                {status === 'depositing' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="spinner"></div>
                    Depositing to vault...
                  </span>
                )}
              </div>
            )}
          </div>

          <button 
            className="button button-primary mb-2"
            onClick={handleDeposit}
            disabled={loading || !amount}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="spinner"></div>
                Processing...
              </span>
            ) : (
              'Confirm Deposit'
            )}
          </button>

          <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
              <strong>How it works:</strong>
            </p>
            <ol style={{ 
              fontSize: '0.875rem', 
              color: 'var(--color-text-tertiary)',
              marginTop: '8px',
              paddingLeft: '20px'
            }}>
              <li>Approve USDC spending (if needed)</li>
              <li>Transfer USDC to your vault</li>
              <li>Funds are secured in your non-custodial vault</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}

export default Deposit;
