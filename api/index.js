import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import backend modules
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Schema
const SavingsPlanSchema = new mongoose.Schema({
  fid: Number,
  walletAddress: { type: String, required: true, unique: true, index: true },
  vaultAddress: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  interval: { type: String, required: true, enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'] },
  customDays: Number,
  startDate: { type: Date, required: true },
  nextSaveDate: { type: Date, required: true },
  lastDepositDate: Date,
  totalSaved: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  remindersSent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SavingsPlanSchema.methods.calculateNextSaveDate = function() {
  const currentNext = this.nextSaveDate || this.startDate;
  const nextDate = new Date(currentNext);
  
  switch (this.interval) {
    case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
    case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
    case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
    case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
    case 'custom': nextDate.setDate(nextDate.getDate() + this.customDays); break;
  }
  
  return nextDate;
};

let SavingsPlan;
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    SavingsPlan = mongoose.model('SavingsPlan', SavingsPlanSchema);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/plan/create', async (req, res) => {
  await connectDB();
  
  try {
    const { walletAddress, vaultAddress, amount, interval, customDays, startDate, fid } = req.body;

    if (!walletAddress || !vaultAddress || !amount || !interval) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const start = new Date(startDate || Date.now());
    let plan = await SavingsPlan.findOne({ walletAddress });

    if (plan) {
      plan.amount = amount;
      plan.interval = interval;
      plan.customDays = customDays;
      plan.startDate = start;
      plan.nextSaveDate = start;
      plan.isActive = true;
      if (fid) plan.fid = fid;
      await plan.save();
      return res.json({ message: 'Plan updated successfully', plan });
    } else {
      plan = new SavingsPlan({
        fid, walletAddress, vaultAddress, amount, interval, customDays,
        startDate: start, nextSaveDate: start
      });
      await plan.save();
      return res.status(201).json({ message: 'Plan created successfully', plan });
    }
  } catch (error) {
    console.error('Error creating/updating plan:', error);
    res.status(500).json({ error: 'Failed to create/update plan' });
  }
});

app.get('/api/plan/:identifier', async (req, res) => {
  await connectDB();
  
  try {
    const { identifier } = req.params;
    let plan = await SavingsPlan.findOne({ walletAddress: identifier.toLowerCase() });

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

app.put('/api/plan/:identifier/deposit', async (req, res) => {
  await connectDB();
  
  try {
    const { identifier } = req.params;
    const { amount } = req.body;

    let plan = await SavingsPlan.findOne({ walletAddress: identifier.toLowerCase() });
    if (!plan && !isNaN(identifier)) {
      plan = await SavingsPlan.findOne({ fid: parseInt(identifier) });
    }

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    plan.lastDepositDate = new Date();
    plan.totalSaved += amount;
    plan.nextSaveDate = plan.calculateNextSaveDate();
    await plan.save();

    res.json({ message: 'Deposit recorded successfully', nextSaveDate: plan.nextSaveDate, plan });
  } catch (error) {
    console.error('Error recording deposit:', error);
    res.status(500).json({ error: 'Failed to record deposit' });
  }
});

app.post('/api/webhook', async (req, res) => {
  console.log('Webhook received:', req.body);
  res.status(200).json({ status: 'received' });
});

export default app;
