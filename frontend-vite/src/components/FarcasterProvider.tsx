import { useEffect, useRef } from 'react';
import sdk from '@farcaster/frame-sdk';

/**
 * Ensures Farcaster SDK is initialized only once, handling StrictMode dual-renders.
 */
export function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const hasInitialized = useRef(false);

    useEffect(() => {
        // If we've already initialized, or if we're not inside an iframe/Farcaster, bail early.
        // window.parent !== window implies we are embedded.
        if (hasInitialized.current) return;

        // In some environments, testing might need relaxed constraints, but production
        // Farcaster miniapps are always embedded. However, we'll try to explicitly catch errors
        // gracefully if it fails instead of failing blindly.
        hasInitialized.current = true;

        async function init() {
            try {
                // Instruct Farcaster that the mini app is fully loaded and ready
                await sdk.actions.ready();
            } catch (err) {
                console.error("Farcaster ready error:", err);
            }
        }

        // Call ready unconditionally to support both web iframes and mobile WebViews.
        // A slight delay ensures the DOM is fully painted before we tell Warpcast we're ready.
        setTimeout(() => {
            init();
        }, 100);
    }, []);

    // While we are waiting for SDK to initialize inside Farcaster, we can show a loader or just render.
    // Rendering children immediately usually ensures components mount, and then ready() is called in a good state.
    return <>{children}</>;
}
