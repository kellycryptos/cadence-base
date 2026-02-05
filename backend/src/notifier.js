import axios from 'axios';

/**
 * Send a notification to a user via Farcaster
 * Note: This is a placeholder implementation. You'll need to integrate with
 * Farcaster's actual notification API once available.
 */
export async function sendNotification(plan) {
  try {
    const message = `Time to save! $${plan.amount.toFixed(2)} USDC is due for your savings plan.`;
    
    // For now, we'll just log the notification
    // In production, this would send via Farcaster's notification API
    console.log(`📬 Notification for ${plan.walletAddress}:`, message);

    // Placeholder for actual Farcaster notification
    // Once Farcaster provides notification API, implement here
    if (plan.fid && process.env.FARCASTER_API_KEY) {
      // This is a placeholder - update with actual Farcaster notification endpoint
      // when it becomes available
      console.log(`Would send notification to FID: ${plan.fid}`);
    }

    // Alternative: Send via webhook if configured
    if (process.env.NOTIFICATION_WEBHOOK_URL) {
      await axios.post(process.env.NOTIFICATION_WEBHOOK_URL, {
        walletAddress: plan.walletAddress,
        fid: plan.fid,
        message: message,
        amount: plan.amount,
        nextSaveDate: plan.nextSaveDate
      });
    }

    return { success: true, message };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Send a test notification
 */
export async function sendTestNotification(walletAddress, fid) {
  const testPlan = {
    walletAddress,
    fid,
    amount: 10.00,
    nextSaveDate: new Date()
  };

  return await sendNotification(testPlan);
}
