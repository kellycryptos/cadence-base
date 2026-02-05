import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

/**
 * Custom hook to manage Farcaster SDK initialization and context
 */
export function useFarcasterSDK() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Check if Farcaster SDK is available
        if (!sdk || !sdk.actions) {
          console.log('Not in Farcaster environment');
          setIsSDKLoaded(false);
          return;
        }

        // Wait for SDK to be ready
        await sdk.actions.ready();
        setIsSDKLoaded(true);

        // Get user context
        const userContext = await sdk.context;
        setContext(userContext);

        console.log('Farcaster SDK initialized:', userContext);
      } catch (err) {
        console.log('Farcaster SDK not available, using regular mode:', err.message);
        setError(null); // Don't treat this as an error
        setIsSDKLoaded(false);
      }
    };

    initializeSDK();
  }, []);

  return {
    isSDKLoaded,
    context,
    error,
    sdk
  };
}

/**
 * Get Ethereum provider from Farcaster
 */
export async function getEthereumProvider() {
  try {
    const provider = await sdk.wallet.ethProvider;
    return provider;
  } catch (error) {
    console.error('Failed to get Ethereum provider:', error);
    throw error;
  }
}

/**
 * Sign in with Farcaster
 */
export async function signInWithFarcaster() {
  try {
    const result = await sdk.actions.signIn();
    return result;
  } catch (error) {
    console.error('Failed to sign in:', error);
    throw error;
  }
}

/**
 * Close the mini app
 */
export function closeMiniApp() {
  sdk.actions.close();
}

/**
 * Add mini app to user's collection
 */
export async function addMiniApp() {
  try {
    await sdk.actions.addMiniApp();
  } catch (error) {
    console.error('Failed to add mini app:', error);
    throw error;
  }
}

/**
 * Open a cast composer
 */
export async function composeCast(text, embeds = []) {
  try {
    await sdk.actions.composeCast({ text, embeds });
  } catch (error) {
    console.error('Failed to compose cast:', error);
    throw error;
  }
}
