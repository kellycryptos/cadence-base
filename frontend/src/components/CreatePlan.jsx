import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function CreatePlan({ userAddress, vaultAddress, onNavigate }) {
  const [interval, setInterval] = useState('weekly');
  const [amount, setAmount] = useState('');
  const [customDays, setCustomDays] = useState('');
  const [startDate, setStartDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (interval === 'custom' && (!customDays || parseInt(customDays) <= 0)) {
      setError('Please enter valid custom days');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/plan/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: userAddress,
          vaultAddress,
          amount: parseFloat(amount),
          interval,
          customDays: interval === 'custom' ? parseInt(customDays) : null,
          startDate: new Date(startDate).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create plan');
      }

      onNavigate('dashboard');
    } catch (err) {
      console.error('Error creating plan:', err);
      setError('Failed to create savings plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimate = () => {
    if (!amount) return '0.00';
    
    const amt = parseFloat(amount);
    let savesPerYear;
    
    switch (interval) {
      case 'daily':
        savesPerYear = 365;
        break;
      case 'weekly':
        savesPerYear = 52;
        break;
      case 'monthly':
        savesPerYear = 12;
        break;
      case 'yearly':
        savesPerYear = 1;
        break;
      case 'custom':
        savesPerYear = customDays ? Math.floor(365 / parseInt(customDays)) : 0;
        break;
      default:
        savesPerYear = 12;
    }
    
    return (amt * savesPerYear).toFixed(2);
  };

  return (
    <div className="fade-in">
      <button 
        className="button button-outline mb-2"
        onClick={() => onNavigate('dashboard')}
        style={{ width: 'auto', padding: '8px 16px' }}
      >
        ← Back
      </button>

      <div className="text-center mb-3">
        <h1>Create Savings Plan</h1>
        <p>Set up your automatic savings reminders</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-2">
          {/* Amount Input */}
          <div className="input-group">
            <label className="input-label">Amount per Save (USDC)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              placeholder="10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Interval Selector */}
          <div className="input-group">
            <label className="input-label">Savings Interval</label>
            <select
              className="select"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Custom Days (shown only when custom is selected) */}
          {interval === 'custom' && (
            <div className="input-group">
              <label className="input-label">Every N Days</label>
              <input
                type="number"
                min="1"
                className="input"
                placeholder="7"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                required
              />
            </div>
          )}

          {/* Start Date */}
          <div className="input-group">
            <label className="input-label">Start Date</label>
            <input
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={getTodayDate()}
              required
            />
          </div>

          {/* Estimated Annual Savings */}
          {amount && (
            <div className="alert alert-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Estimated Annual Savings:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-accent)' }}>
                  ${calculateEstimate()} USDC
                </strong>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="button button-primary"
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div className="spinner"></div>
              Creating Plan...
            </span>
          ) : (
            'Create Plan'
          )}
        </button>
      </form>

      <div className="card mt-2" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
          <strong>Note:</strong> You'll receive reminders when it's time to save, but you'll always need to manually confirm each deposit. Your funds stay in your control.
        </p>
      </div>
    </div>
  );
}

// Helper to get today's date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export default CreatePlan;
