import { useState, useEffect } from 'react';

function Withdraw({ userAddress, vaultAddress, contract, onNavigate }) {
  const [amount, setAmount] = useState('');
  const [vaultBalance, setVaultBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // '', 'withdrawing', 'success'
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch vault balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!contract.getVaultBalance || !vaultAddress) return;

      try {
        const balance = await contract.getVaultBalance(vaultAddress);
        setVaultBalance(balance);
      } catch (error) {
        console.error('Failed to fetch vault balance:', error);
      }
    };

    fetchBalance();
  }, [contract, vaultAddress]);

  const handleWithdrawClick = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(vaultBalance)) {
      setError('Insufficient vault balance');
      return;
    }

    setError('');
    setShowConfirm(true);
  };

  const handleConfirmWithdraw = async () => {
    setLoading(true);
    setStatus('withdrawing');
    setShowConfirm(false);

    try {
      const withdrawHash = await contract.withdrawFromVault(vaultAddress, amount, userAddress);
      setTxHash(withdrawHash);
      console.log('Withdraw tx:', withdrawHash);

      setStatus('success');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 2000);
    } catch (err) {
      console.error('Withdrawal failed:', err);
      setError(err.message || 'Withdrawal failed. Please try again.');
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
        <h1>Withdraw USDC</h1>
        <p>Remove funds from your savings vault</p>
      </div>

      {status === 'success' ? (
        <div className="card text-center">
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✓</div>
          <h2 className="text-accent mb-2">Withdrawal Successful!</h2>
          <p className="mb-2">USDC has been sent to your wallet</p>
          <div className="alert alert-info" style={{ fontSize: '0.875rem' }}>
            <strong>Transaction:</strong> {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </div>
        </div>
      ) : showConfirm ? (
        <div className="card text-center">
          <h2 className="mb-2">Confirm Withdrawal</h2>
          <div className="stat-large mb-2">${amount}</div>
          <p className="mb-3">Are you sure you want to withdraw this amount?</p>
          
          <div className="grid grid-2">
            <button 
              className="button button-outline"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="button button-primary"
              onClick={handleConfirmWithdraw}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="card mb-2">
            {/* Vault Balance Display */}
            <div className="text-center mb-3">
              <div className="stat-label">Available Balance</div>
              <div className="stat-large mt-1">${vaultBalance}</div>
              <div className="stat-label mt-1">USDC</div>
            </div>

            <div className="input-group">
              <label className="input-label">
                Withdrawal Amount (USDC)
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
                justifyContent: 'flex-end', 
                marginTop: '8px',
                fontSize: '0.875rem'
              }}>
                <button
                  type="button"
                  onClick={() => setAmount(vaultBalance)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'Lexend'
                  }}
                  disabled={loading}
                >
                  Withdraw All
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error mt-2">
                {error}
              </div>
            )}

            {status === 'withdrawing' && (
              <div className="alert alert-info mt-2">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="spinner"></div>
                  Processing withdrawal...
                </span>
              </div>
            )}
          </div>

          <button 
            className="button button-primary mb-2"
            onClick={handleWithdrawClick}
            disabled={loading || !amount || parseFloat(vaultBalance) === 0}
          >
            Withdraw
          </button>

          <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
              <strong>Note:</strong> Withdrawing funds will not affect your savings plan. You can continue saving according to your schedule.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Withdraw;
