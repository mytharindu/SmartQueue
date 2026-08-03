import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
    {
        deptId: {
            type: String,
            required: [true, 'Department ID is required'],
            unique: true,
            trim: true,
            match: [/^DEPT-\d{3}$/, 'Department ID must be in format DEPT-XXX'],
        },
        name: {
            type: String,
            required: [true, 'Department name is required'],
            trim: true,
            minlength: [3, 'Department name must be at least 3 characters'],
            maxlength: [100, 'Department name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        location: {
            type: String,
            required: [true, 'Department location is required'],
            trim: true,
        },
        email: {
            type: String,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Please enter a valid email'
            ],
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        head: {
            type: String,
            trim: true,
            maxlength: [100, 'Head name cannot exceed 100 characters'],
        },
        icon: {
            type: String,
            default: '🏛️',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        operatingHours: {
            monday: { open: String, close: String },
            tuesday: { open: String, close: String },
            wednesday: { open: String, close: String },
            thursday: { open: String, close: String },
            friday: { open: String, close: String },
            saturday: { open: String, close: String },
            sunday: { open: String, close: String },
        },
        totalCounters: {
            type: Number,
            default: 0,
            min: [0, 'Total counters cannot be negative'],
        },
        totalServices: {
            type: Number,
            default: 0,
            min: [0, 'Total services cannot be negative'],
        },
    },
    {
        timestamps: true,
    }
);

departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ location: 1 });

const Department = mongoose.model('Department', departmentSchema);

export default Department;