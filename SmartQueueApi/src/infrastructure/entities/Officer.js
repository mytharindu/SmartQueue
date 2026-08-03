import mongoose from 'mongoose';

const officerSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: [true, 'Employee ID is required'],
            unique: true,
            trim: true,
            index: true,
            match: [/^EMP-\d{3,}$/, 'Employee ID must match pattern (e.g., EMP-001)'],
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            lowercase: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
            index: true,
        },
        phone: {
            type: String,
            trim: true,
            maxlength: [20, 'Phone cannot exceed 20 characters'],
        },
        role: {
            type: String,
            enum: ['counter-staff', 'supervisor', 'manager', 'admin'],
            default: 'counter-staff',
            index: true,
        },
        status: {
            type: String,
            enum: ['active', 'on-break', 'off-duty', 'inactive'],
            default: 'active',
            index: true,
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            trim: true,
        },
        assignedCounter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Counter',
        },
        performance: {
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
            satisfactionRating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            totalRatingsCount: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        workSchedule: {
            startTime: {
                type: String,
                required: true,
            },
            endTime: {
                type: String,
                required: true,
            },
            workDays: [
                {
                    type: String,
                    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                },
            ],
        },
        joinDate: {
            type: Date,
            required: [true, 'Join date is required'],
            index: true,
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
        collection: 'officers',
    }
);

// Compound indexes
officerSchema.index({ role: 1, status: 1 });
officerSchema.index({ 'performance.satisfactionRating': -1, role: 1 });
officerSchema.index({ assignedCounter: 1, status: 1 });

const Officer = mongoose.model('Officer', officerSchema);

export default Officer;