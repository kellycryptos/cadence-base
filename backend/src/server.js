import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './database.js';
import SavingsPlan from './database.js';
import { startScheduler } from './scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
await connectDatabase();

// Start scheduler for reminders
startScheduler();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create or update savings plan
app.post('/api/plan/create', async (req, res) => {
  try {
    const { walletAddress, vaultAddress, amount, interval, customDays, startDate, fid } = req.body;

    // Validation
    if (!walletAddress || !vaultAddress || !amount || !interval) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (interval === 'custom' && (!customDays || customDays <= 0)) {
      return res.status(400).json({ error: 'Custom days must be greater than 0' });
    }

    const start = new Date(startDate || Date.now());
    const nextSave = new Date(start);

    // Check if plan already exists
    let plan = await SavingsPlan.findOne({ walletAddress });

    if (plan) {
      // Update existing plan
      plan.amount = amount;
      plan.interval = interval;
      plan.customDays = customDays;
      plan.startDate = start;
      plan.nextSaveDate = nextSave;
      plan.isActive = true;
      if (fid) plan.fid = fid;
      
      await plan.save();
      return res.json({ message: 'Plan updated successfully', plan });
    } else {
      // Create new plan
      plan = new SavingsPlan({
        fid,
        walletAddress,
        vaultAddress,
        amount,
        interval,
        customDays,
        startDate: start,
        nextSaveDate: nextSave
      });

      await plan.save();
      return res.status(201).json({ message: 'Plan created successfully', plan });
    }
  } catch (error) {
    console.error('Error creating/updating plan:', error);
    res.status(500).json({ error: 'Failed to create/update plan' });
  }
});

// Get savings plan by FID or wallet address
app.get('/api/plan/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by wallet address first
    let plan = await SavingsPlan.findOne({ 
      walletAddress: identifier.toLowerCase() 
    });

    // If not found and identifier is numeric, try FID
    if (!plan && !isNaN(identifier)) {
      plan = await SavingsPlan.findOne({ fid: parseInt(identifier) });
    }

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

// Record a deposit and update next save date
app.put('/api/plan/:identifier/deposit', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { amount, txHash } = req.body;

    let plan = await SavingsPlan.findOne({ 
      walletAddress: identifier.toLowerCase() 
    });

    if (!plan && !isNaN(identifier)) {
      plan = await SavingsPlan.findOne({ fid: parseInt(identifier) });
    }

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Update plan
    plan.lastDepositDate = new Date();
    plan.totalSaved += amount;
    plan.nextSaveDate = plan.calculateNextSaveDate();

    await plan.save();

    res.json({ 
      message: 'Deposit recorded successfully', 
      nextSaveDate: plan.nextSaveDate,
      plan 
    });
  } catch (error) {
    console.error('Error recording deposit:', error);
    res.status(500).json({ error: 'Failed to record deposit' });
  }
});

// Pause/resume plan
app.put('/api/plan/:identifier/pause', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { isActive } = req.body;

    let plan = await SavingsPlan.findOne({ 
      walletAddress: identifier.toLowerCase() 
    });

    if (!plan && !isNaN(identifier)) {
      plan = await SavingsPlan.findOne({ fid: parseInt(identifier) });
    }

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    plan.isActive = isActive;
    await plan.save();

    res.json({ message: `Plan ${isActive ? 'resumed' : 'paused'} successfully`, plan });
  } catch (error) {
    console.error('Error updating plan status:', error);
    res.status(500).json({ error: 'Failed to update plan status' });
  }
});

// Delete plan
app.delete('/api/plan/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    let result = await SavingsPlan.deleteOne({ 
      walletAddress: identifier.toLowerCase() 
    });

    if (result.deletedCount === 0 && !isNaN(identifier)) {
      result = await SavingsPlan.deleteOne({ fid: parseInt(identifier) });
    }

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

// Webhook endpoint for Farcaster notifications
app.post('/api/webhook', async (req, res) => {
  try {
    console.log('Webhook received:', req.body);
    // Handle Farcaster webhook events here
    res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cadence Base backend running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}`);
  console.log(`💾 Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/cadencebase'}`);
});
