import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
      unique: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: [true, 'Day of week is required'],
    },
    summary: {
      totalTokensIssued: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalTokensServed: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalTokensCancelled: {
        type: Number,
        default: 0,
        min: 0,
      },
      activeServices: {
        type: Number,
        default: 0,
        min: 0,
      },
      activeCounters: {
        type: Number,
        default: 0,
        min: 0,
      },
      activeOfficers: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    waitTime: {
      average: {
        type: Number,
        default: 0,
        min: 0,
      },
      maximum: {
        type: Number,
        default: 0,
        min: 0,
      },
      minimum: {
        type: Number,
        default: 0,
        min: 0,
      },
      median: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    serviceBreakdown: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
        },
        serviceName: {
          type: String,
        },
        tokensIssued: {
          type: Number,
          default: 0,
        },
        tokensServed: {
          type: Number,
          default: 0,
        },
        averageWaitTime: {
          type: Number,
          default: 0,
        },
      },
    ],
    officerBreakdown: [
      {
        officerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Officer',
        },
        officerName: {
          type: String,
        },
        tokensServed: {
          type: Number,
          default: 0,
        },
        averageServiceTime: {
          type: Number,
          default: 0,
        },
        satisfactionRating: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
      },
    ],
    counterBreakdown: [
      {
        counterId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Counter',
        },
        counterName: {
          type: String,
        },
        tokensServed: {
          type: Number,
          default: 0,
        },
        utilizationRate: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],
    peakHours: [
      {
        hour: {
          type: Number,
          min: 0,
          max: 23,
        },
        tokensIssued: {
          type: Number,
          default: 0,
        },
      },
    ],
    customerSatisfaction: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
        min: 0,
      },
      ratingDistribution: {
        one: { type: Number, default: 0 },
        two: { type: Number, default: 0 },
        three: { type: Number, default: 0 },
        four: { type: Number, default: 0 },
        five: { type: Number, default: 0 },
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'analytics',
  }
);

// Indexes for optimized queries
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ 'summary.totalTokensServed': -1 });
analyticsSchema.index({ 'customerSatisfaction.averageRating': -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
