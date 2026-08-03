import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true,
            maxlength: [100, 'Service name cannot exceed 100 characters'],
            index: true,
        },
        office: {
            type: String,
            required: [true, 'Office name is required'],
            trim: true,
            maxlength: [150, 'Office name cannot exceed 150 characters'],
        },
        department: {
            departmentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Department',
                required: [true, 'Department is required'],
                index: true,
            },
            departmentName: {
                type: String,
                required: true,
            },
        },
        duration: {
            type: Number,
            required: [true, 'Service duration is required'],
            min: [1, 'Duration must be at least 1 minute'],
            max: [240, 'Duration cannot exceed 240 minutes'],
        },
        icon: {
            type: String,
            required: [true, 'Service icon is required'],
            trim: true,
        },
        docs: [
            {
                type: String,
                trim: true,
                maxlength: [100, 'Document name cannot exceed 100 characters'],
            },
        ],
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
        collection: 'services',
    }
);

// Compound indexes for optimized queries
serviceSchema.index({ 'department.departmentId': 1, 'department.departmentName': 1 });
serviceSchema.index({ name: 1, isActive: 1 });
serviceSchema.index({ isActive: 1, createdAt: -1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service;