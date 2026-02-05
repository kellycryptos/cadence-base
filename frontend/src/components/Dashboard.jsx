import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function Dashboard({ userAddress, vaultAddress, contract, onNavigate }) {
  const [vaultInfo, setVaultInfo] = useState(null);
  const [savingsPlan, setSavingsPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextSaveDate, setNextSaveDate] = useState(null);
  const [daysUntilNext, setDaysUntilNext] = useState(0);

  // Fetch vault info from contract
  useEffect(() => {
    const fetchVaultInfo = async () => {
      if (!vaultAddress || !contract.getVaultInfo) return;

      try {
        const info = await contract.getVaultInfo(vaultAddress);
        setVaultInfo(info);
      } catch (error) {
        console.error('Failed to fetch vault info:', error);
      }
    };

    fetchVaultInfo();
    const interval = setInterval(fetchVaultInfo, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, [vaultAddress, contract]);

  // Fetch savings plan from backend
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`${API_URL}/api/plan/${userAddress}`);
        if (response.ok) {
          const data = await response.json();
          setSavingsPlan(data);
          
          if (data.nextSaveDate) {
            const next = new Date(data.nextSaveDate);
            setNextSaveDate(next);
            
            const today = new Date();
            const diffTime = next - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysUntilNext(diffDays >= 0 ? diffDays : 0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch savings plan:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userAddress) {
      fetchPlan();
    }
  }, [userAddress]);

  // Calculate progress
  const calculateProgress = () => {
    if (!savingsPlan || !vaultInfo) return 0;
    
    // Simple progress: current balance as percentage of a target
    // For demo, let's say monthly target is 12x the interval amount
    const monthlyTarget = savingsPlan.amount * 12;
    const currentBalance = parseFloat(vaultInfo.balance);
    const progress = (currentBalance / monthlyTarget) * 100;
    
    return Math.min(progress, 100);
  };

  if (loading) {
    return (
      <div className="card text-center">
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p className="mt-2">Loading your savings...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="text-center mb-3">
        <h1>Your Savings</h1>
      </div>

      {/* Main Balance Card */}
      <div className="card text-center mb-2">
        <div className="stat-label">Total Saved</div>
        <div className="stat-large mt-1">
          ${vaultInfo ? vaultInfo.balance : '0.00'}
        </div>
        <div className="stat-label mt-1">USDC on Base</div>
        
        {savingsPlan && (
          <>
            <div className="progress-container mt-3">
              <div 
                className="progress-bar" 
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <p className="mt-1" style={{ fontSize: '0.875rem' }}>
              {calculateProgress().toFixed(0)}% of monthly goal
            </p>
          </>
        )}
      </div>

      {/* Savings Plan Info */}
      {savingsPlan ? (
        <div className="card mb-2">
          <h3 className="mb-2">Your Plan</h3>
          
          <div className="stat-row">
            <span style={{ color: 'var(--color-text-secondary)' }}>Amount per save</span>
            <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>
              ${savingsPlan.amount.toFixed(2)} USDC
            </span>
          </div>
          
          <div className="stat-row">
            <span style={{ color: 'var(--color-text-secondary)' }}>Interval</span>
            <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
              {savingsPlan.interval === 'custom' 
                ? `Every ${savingsPlan.customDays} days`
                : savingsPlan.interval}
            </span>
          </div>
          
          {nextSaveDate && (
            <div className="stat-row">
              <span style={{ color: 'var(--color-text-secondary)' }}>Next save date</span>
              <span style={{ fontWeight: '600' }}>
                {daysUntilNext === 0 ? 'Today' : 
                 daysUntilNext === 1 ? 'Tomorrow' : 
                 `In ${daysUntilNext} days`}
              </span>
            </div>
          )}

          <div className="stat-row">
            <span style={{ color: 'var(--color-text-secondary)' }}>Est. annual</span>
            <span style={{ fontWeight: '600', color: 'var(--color-accent)' }}>
              ${calculateAnnualSavings(savingsPlan)} USDC
            </span>
          </div>
        </div>
      ) : (
        <div className="card mb-2 text-center">
          <h3 className="mb-2">No Savings Plan Yet</h3>
          <p className="mb-3">Create a plan to start building your savings habit</p>
          <button 
            className="button button-primary"
            onClick={() => onNavigate('create')}
          >
            Create Savings Plan
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-2 mb-2">
        <button 
          className="button button-primary"
          onClick={() => onNavigate('deposit')}
        >
          Deposit
        </button>
        <button 
          className="button button-outline"
          onClick={() => onNavigate('withdraw')}
        >
          Withdraw
        </button>
      </div>

      {savingsPlan && (
        <button 
          className="button button-secondary"
          onClick={() => onNavigate('create')}
        >
          Update Plan
        </button>
      )}
    </div>
  );
}

// Helper function to calculate annual savings
function calculateAnnualSavings(plan) {
  if (!plan) return '0.00';
  
  const { amount, interval, customDays } = plan;
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
      savesPerYear = Math.floor(365 / customDays);
      break;
    default:
      savesPerYear = 12;
  }
  
  return (amount * savesPerYear).toFixed(2);
}

export default Dashboard;
