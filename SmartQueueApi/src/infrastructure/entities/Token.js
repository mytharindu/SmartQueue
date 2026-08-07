import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
    {
        tokenNumber: {
            type: String,
            required: [true, 'Token number is required'],
            unique: true,
            trim: true,
            index: true,
            match: [/^[A-Z]-\d{3,}$/, 'Token number must match pattern (e.g., P-042)'],
        },
        service: {
            serviceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Service',
                required: [true, 'Service ID is required'],
                index: true,
            },
            serviceName: {
                type: String,
                required: true,
            },
        },
        counter: {
            counterId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Counter',
                index: true,
            },
            counterName: {
                type: String,
            },
        },
        citizen: {
            name: {
                type: String,
                required: [true, 'Citizen name is required'],
                trim: true,
                maxlength: [100, 'Name cannot exceed 100 characters'],
            },
            nic: {
                type: String,
                trim: true,
                maxlength: [20, 'NIC cannot exceed 20 characters'],
            },
            phone: {
                type: String,
                trim: true,
                maxlength: [20, 'Phone cannot exceed 20 characters'],
            },
        },
        status: {
            type: String,
            enum: ['pending', 'called', 'serving', 'completed', 'cancelled'],
            default: 'pending',
            index: true,
        },
        priority: {
            type: Boolean,
            default: false,
            index: true,
        },
        priorityReason: {
            type: String,
            trim: true,
            maxlength: [200, 'Priority reason cannot exceed 200 characters'],
        },
        priorityStatus: {
            type: String,
            enum: ['none', 'pending', 'accepted', 'rejected'],
            default: 'none',
            index: true,
        },
        bookedDate: {
            type: Date,
            required: [true, 'Booked date is required'],
            index: true,
        },
        queuePosition: {
            type: Number,
            default: 0,
            min: 0,
        },
        timing: {
            estimatedWaitTime: {
                type: Number,
                default: 0,
                min: 0,
            },
            actualWaitTime: {
                type: Number,
                default: 0,
                min: 0,
            },
            serviceStartTime: {
                type: Date,
            },
            serviceEndTime: {
                type: Date,
            },
        },
        satisfactionRating: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be less than 0'],
            max: [5, 'Rating cannot exceed 5'],
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
            expire: 31536000, // TTL: Auto-delete after 1 year
        },
        updatedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: 'tokens',
    }
);

// Compound indexes for optimized queries
tokenSchema.index({ 'service.serviceId': 1, status: 1, bookedDate: 1 });
tokenSchema.index({ status: 1, priority: 1, createdAt: -1 });
tokenSchema.index({ bookedDate: -1, createdAt: -1 });

// TTL index for automatic deletion after 1 year
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const Token = mongoose.model('Token', tokenSchema);

export default Token;