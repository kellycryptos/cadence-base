import { useState, useEffect } from 'react';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { 
  getContractAddresses, 
  FACTORY_ABI, 
  VAULT_ABI, 
  USDC_ABI,
  formatUSDC,
  parseUSDC 
} from '../utils/contracts';

/**
 * Custom hook for contract interactions
 */
export function useContract(provider, chainId) {
  const [publicClient, setPublicClient] = useState(null);
  const [walletClient, setWalletClient] = useState(null);
  const [addresses, setAddresses] = useState(null);

  useEffect(() => {
    if (!provider || !chainId) return;

    const chain = chainId === 8453 ? base : baseSepolia;
    const contractAddresses = getContractAddresses(chainId);
    setAddresses(contractAddresses);

    // Create public client for reading
    const pubClient = createPublicClient({
      chain,
      transport: http()
    });
    setPublicClient(pubClient);

    // Create wallet client for writing
    const walClient = createWalletClient({
      chain,
      transport: custom(provider)
    });
    setWalletClient(walClient);
  }, [provider, chainId]);

  // Factory contract functions
  const createVault = async (userAddress) => {
    if (!walletClient || !addresses) throw new Error('Client not initialized');
    
    const hash = await walletClient.writeContract({
      address: addresses.factoryAddress,
      abi: FACTORY_ABI,
      functionName: 'createVault',
      account: userAddress
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  };

  const getUserVault = async (userAddress) => {
    if (!publicClient || !addresses) return null;
    
    const vaultAddress = await publicClient.readContract({
      address: addresses.factoryAddress,
      abi: FACTORY_ABI,
      functionName: 'getUserVault',
      args: [userAddress]
    });

    return vaultAddress;
  };

  const hasVault = async (userAddress) => {
    if (!publicClient || !addresses) return false;
    
    const exists = await publicClient.readContract({
      address: addresses.factoryAddress,
      abi: FACTORY_ABI,
      functionName: 'hasVault',
      args: [userAddress]
    });

    return exists;
  };

  // Vault contract functions
  const getVaultBalance = async (vaultAddress) => {
    if (!publicClient) return '0';
    
    const balance = await publicClient.readContract({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: 'getBalance'
    });

    return formatUSDC(balance);
  };

  const getVaultInfo = async (vaultAddress) => {
    if (!publicClient) return null;
    
    const [owner, balance, totalSaved] = await publicClient.readContract({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: 'getVaultInfo'
    });

    return {
      owner,
      balance: formatUSDC(balance),
      totalSaved: formatUSDC(totalSaved)
    };
  };

  const depositToVault = async (vaultAddress, amount, userAddress) => {
    if (!walletClient) throw new Error('Wallet client not initialized');
    
    const amountInSmallestUnit = parseUSDC(amount);

    const hash = await walletClient.writeContract({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: 'deposit',
      args: [amountInSmallestUnit],
      account: userAddress
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  };

  const withdrawFromVault = async (vaultAddress, amount, userAddress) => {
    if (!walletClient) throw new Error('Wallet client not initialized');
    
    const amountInSmallestUnit = parseUSDC(amount);

    const hash = await walletClient.writeContract({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: 'withdraw',
      args: [amountInSmallestUnit],
      account: userAddress
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  };

  // USDC contract functions
  const getUSDCBalance = async (userAddress) => {
    if (!publicClient || !addresses) return '0';
    
    const balance = await publicClient.readContract({
      address: addresses.usdcAddress,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [userAddress]
    });

    return formatUSDC(balance);
  };

  const approveUSDC = async (spenderAddress, amount, userAddress) => {
    if (!walletClient || !addresses) throw new Error('Client not initialized');
    
    const amountInSmallestUnit = parseUSDC(amount);

    const hash = await walletClient.writeContract({
      address: addresses.usdcAddress,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [spenderAddress, amountInSmallestUnit],
      account: userAddress
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  };

  const getUSDCAllowance = async (ownerAddress, spenderAddress) => {
    if (!publicClient || !addresses) return '0';
    
    const allowance = await publicClient.readContract({
      address: addresses.usdcAddress,
      abi: USDC_ABI,
      functionName: 'allowance',
      args: [ownerAddress, spenderAddress]
    });

    return formatUSDC(allowance);
  };

  return {
    // Factory functions
    createVault,
    getUserVault,
    hasVault,
    
    // Vault functions
    getVaultBalance,
    getVaultInfo,
    depositToVault,
    withdrawFromVault,
    
    // USDC functions
    getUSDCBalance,
    approveUSDC,
    getUSDCAllowance,
    
    // Utilities
    addresses,
    publicClient,
    walletClient
  };
}
