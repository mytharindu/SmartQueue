import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema(
    {
        counterNumber: {
            type: String,
            required: [true, 'Counter number is required'],
            unique: true,
            trim: true,
            index: true,
            match: [/^C-\d{2,}$/, 'Counter number must match pattern (e.g., C-01)'],
        },
        counterName: {
            type: String,
            required: [true, 'Counter name is required'],
            trim: true,
            maxlength: [100, 'Counter name cannot exceed 100 characters'],
        },
        service: {
            serviceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Service',
                required: [true, 'Service is required'],
                index: true,
            },
            serviceName: {
                type: String,
                required: true,
            },
        },
        officer: {
            officerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Officer',
                index: true,
            },
            officerName: {
                type: String,
            },
        },
        currentToken: {
            tokenId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Token',
            },
            tokenNumber: {
                type: String,
            },
        },
        status: {
            type: String,
            enum: ['active', 'idle', 'maintenance', 'closed'],
            default: 'idle',
            index: true,
        },
        waitingQueue: {
            count: {
                type: Number,
                default: 0,
                min: 0,
            },
            estimatedWaitTime: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        dailyMetrics: {
            tokensServed: {
                type: Number,
                default: 0,
                min: 0,
            },
            averageServiceTime: {
                type: Number,
                default: 0,
                min: 0,
            },
            dateTracked: {
                type: Date,
                default: Date.now,
                index: true,
            },
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
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
        collection: 'counters',
    }
);

// Compound indexes
countersSchema.index({ 'service.serviceId': 1, status: 1 });
countersSchema.index({ status: 1, 'dailyMetrics.dateTracked': -1 });
countersSchema.index({ counterNumber: 1, 'officer.officerId': 1 });

const Counter = mongoose.model('Counter', counterSchema);
export default Counter;


