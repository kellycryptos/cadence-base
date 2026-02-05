import cron from 'node-cron';
import SavingsPlan from './database.js';
import { sendNotification } from './notifier.js';

/**
 * Start the scheduler to check for reminders daily
 */
export function startScheduler() {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily reminder check...');
    await checkAndSendReminders();
  });

  // Also run every hour for testing/development
  if (process.env.NODE_ENV === 'development') {
    cron.schedule('0 * * * *', async () => {
      console.log('⏰ [DEV] Running hourly reminder check...');
      await checkAndSendReminders();
    });
  }

  console.log('✅ Scheduler started');
}

/**
 * Check all active plans and send reminders for due dates
 */
async function checkAndSendReminders() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all active plans where nextSaveDate is today or in the past
    const duePlans = await SavingsPlan.find({
      isActive: true,
      nextSaveDate: { $lte: new Date() }
    });

    console.log(`📋 Found ${duePlans.length} plans due for reminder`);

    for (const plan of duePlans) {
      try {
        await sendNotification(plan);
        
        // Update reminder count
        plan.remindersSent += 1;
        await plan.save();
        
        console.log(`✅ Reminder sent for wallet ${plan.walletAddress}`);
      } catch (error) {
        console.error(`❌ Failed to send reminder for wallet ${plan.walletAddress}:`, error);
      }
    }

    return duePlans.length;
  } catch (error) {
    console.error('Error checking reminders:', error);
    return 0;
  }
}

/**
 * Manual trigger for testing
 */
export async function triggerReminderCheck() {
  return await checkAndSendReminders();
}
