// Vercel Cron Job for checking due reminders
// Add to vercel.json:
// {
//   "crons": [{
//     "path": "/api/check-reminders",
//     "schedule": "0 9 * * *"
//   }]
// }

export default async function handler(req, res) {
    // Verify this is a cron request
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // TODO: Query database for savings plans with due dates <= today
        // const duePlans = await db.savingsPlan.findMany({
        //   where: {
        //     nextSaveDate: { lte: new Date() },
        //     active: true,
        //   },
        // });

        // TODO: For each due plan, send Farcaster notification
        // for (const plan of duePlans) {
        //   await sendFarcasterNotification(plan.userAddress, {
        //     title: 'Time to Save!',
        //     body: `Your ${plan.interval} savings reminder: ${plan.amount} USDC`,
        //     url: 'https://cadence-base.vercel.app',
        //   });
        //   
        //   // Update next save date based on interval
        //   await updateNextSaveDate(plan);
        // }

        console.log('Checked for due reminders');

        return res.status(200).json({
            success: true,
            message: 'Reminders checked successfully',
        });
    } catch (error) {
        console.error('Error checking reminders:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
