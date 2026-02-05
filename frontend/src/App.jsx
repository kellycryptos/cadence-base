import { useState, useEffect } from 'react';
import { useFarcasterSDK, getEthereumProvider } from './hooks/useFarcasterSDK';
import { useContract } from './hooks/useContract';
import Dashboard from './components/Dashboard';
import CreatePlan from './components/CreatePlan';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';

function App() {
  const { isSDKLoaded, context, error: sdkError } = useFarcasterSDK();
  const [ethProvider, setEthProvider] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [vaultAddress, setVaultAddress] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isFarcasterEnv, setIsFarcasterEnv] = useState(false);

  const contract = useContract(ethProvider, context?.client?.chainId || 84532);

  // Initialize Ethereum provider
  useEffect(() => {
    const init = async () => {
      try {
        // Check if we're in a browser with MetaMask
        if (window.ethereum) {
          console.log('MetaMask detected');
          setIsFarcasterEnv(false);
          setEthProvider(window.ethereum);
          setLoading(false);
          return;
        }
        
        // Check for Farcaster SDK
        if (isSDKLoaded) {
          console.log('Farcaster SDK detected');
          setIsFarcasterEnv(true);
          const provider = await getEthereumProvider();
          setEthProvider(provider);
          
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            setUserAddress(accounts[0]);
          }
          setLoading(false);
          return;
        }
        
        // No provider found, stop loading
        console.log('No wallet provider found');
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize provider:', error);
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Initialization timeout');
      setLoading(false);
    }, 3000);

    init();
    
    return () => clearTimeout(timeout);
  }, [isSDKLoaded]);

  // Check if user has a vault
  useEffect(() => {
    const checkVault = async () => {
      if (!userAddress || !contract.getUserVault) return;

      try {
        const vault = await contract.getUserVault(userAddress);
        if (vault && vault !== '0x0000000000000000000000000000000000000000') {
          setVaultAddress(vault);
        }
      } catch (error) {
        console.error('Failed to get user vault:', error);
      }
    };

    checkVault();
  }, [userAddress, contract]);

  // Handle vault creation
  const handleCreateVault = async () => {
    if (!contract.createVault || !userAddress) return;

    try {
      setLoading(true);
      await contract.createVault(userAddress);
      
      // Refresh vault address
      const vault = await contract.getUserVault(userAddress);
      setVaultAddress(vault);
    } catch (error) {
      console.error('Failed to create vault:', error);
      alert('Failed to create vault. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container">
        <div className="card text-center" style={{ marginTop: '50%' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p className="mt-2">Loading Cadence Base...</p>
        </div>
      </div>
    );
  }

  // Show wallet connection prompt if no provider
  if (!ethProvider) {
    return (
      <div className="container">
        <div className="text-center mb-3" style={{ marginTop: '30%' }}>
          <h1 className="mb-2">Cadence Base</h1>
          <p className="mb-3">Build consistent USDC savings on Base</p>
        </div>
        
        <div className="card text-center">
          <h3 className="mb-2">Connect Your Wallet</h3>
          <p className="mb-3">Connect MetaMask to start saving USDC</p>
          <button 
            className="button button-primary"
            onClick={async () => {
              if (window.ethereum) {
                try {
                  setLoading(true);
                  const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                  });
                  setEthProvider(window.ethereum);
                  if (accounts && accounts.length > 0) {
                    setUserAddress(accounts[0]);
                  }
                  setLoading(false);
                } catch (error) {
                  console.error('Failed to connect wallet:', error);
                  alert('Failed to connect wallet. Please try again.');
                  setLoading(false);
                }
              } else {
                window.open('https://metamask.io/download/', '_blank');
              }
            }}
          >
            {window.ethereum ? 'Connect Wallet' : 'Install MetaMask'}
          </button>
        </div>
      </div>
    );
  }

  // Render vault creation prompt if no vault exists
  if (!vaultAddress) {
    return (
      <div className="container">
        <div className="text-center mb-3" style={{ marginTop: '30%' }}>
          <h1 className="mb-2">Welcome to Cadence Base</h1>
          <p className="mb-3">Build consistent USDC savings on Base with reminders and your own non-custodial vault.</p>
        </div>
        
        <div className="card text-center">
          <h3 className="mb-2">Create Your Savings Vault</h3>
          <p className="mb-3">Get started by creating your personal savings vault. You'll have full control of your funds.</p>
          <button className="button button-primary" onClick={handleCreateVault}>
            Create Vault
          </button>
        </div>
      </div>
    );
  }

  // Render main app views
  return (
    <div className="container">
      {currentView === 'dashboard' && (
        <Dashboard
          userAddress={userAddress}
          vaultAddress={vaultAddress}
          contract={contract}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'create' && (
        <CreatePlan
          userAddress={userAddress}
          vaultAddress={vaultAddress}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'deposit' && (
        <Deposit
          userAddress={userAddress}
          vaultAddress={vaultAddress}
          contract={contract}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'withdraw' && (
        <Withdraw
          userAddress={userAddress}
          vaultAddress={vaultAddress}
          contract={contract}
          onNavigate={setCurrentView}
        />
      )}
    </div>
  );
}

export default App;
