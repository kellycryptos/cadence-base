import mongoose from 'mongoose';

const SavingsPlanSchema = new mongoose.Schema({
  fid: {
    type: Number,
    required: false,
    index: true
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  vaultAddress: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  interval: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom']
  },
  customDays: {
    type: Number,
    required: function() {
      return this.interval === 'custom';
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  nextSaveDate: {
    type: Date,
    required: true
  },
  lastDepositDate: {
    type: Date,
    default: null
  },
  totalSaved: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  remindersSent: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
SavingsPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate next save date
SavingsPlanSchema.methods.calculateNextSaveDate = function() {
  const currentNext = this.nextSaveDate || this.startDate;
  const nextDate = new Date(currentNext);
  
  switch (this.interval) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'custom':
      nextDate.setDate(nextDate.getDate() + this.customDays);
      break;
  }
  
  return nextDate;
};

const SavingsPlan = mongoose.model('SavingsPlan', SavingsPlanSchema);

export default SavingsPlan;


// Database connection helper
export async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cadencebase';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}
