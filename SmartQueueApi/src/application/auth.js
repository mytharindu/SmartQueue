import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../infrastructure/entities/User.js';

const ROLES = ['counter-staff', 'supervisor', 'manager', 'admin'];
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const publicUser = (user) => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
});

export const register = async ({ firstName, lastName, email, phone, password }) => {
    if (!firstName || !lastName || !email || !password) {
        throw new Error('First name, last name, email and password are required');
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
        throw new Error('Please enter a valid email address');
    }
    if (password.length < 4) {
        throw new Error('Password must be at least 4 characters');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
        throw new Error('An account with that email already exists');
    }

    // The very first account created becomes admin so there's always a way
    // in to assign roles to everyone who registers after them.
    const isFirstUser = (await User.countDocuments()) === 0;

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: phone?.trim(),
        password: hashed,
        role: isFirstUser ? 'admin' : 'counter-staff',
    });
    await user.save();
    return publicUser(user);
};

export const login = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !user.isActive) {
        throw new Error('Invalid email or password');
    }
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
        throw new Error('Invalid email or password');
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.authToken = token;
    await user.save();
    return { token, user: publicUser(user) };
};

export const logout = async (token) => {
    if (!token) return;
    await User.updateOne({ authToken: token }, { $unset: { authToken: '' } });
};

export const getUserByToken = async (token) => {
    if (!token) return null;
    const user = await User.findOne({ authToken: token });
    if (!user || !user.isActive) return null;
    return publicUser(user);
};

export const getAllUsers = async () => {
    const users = await User.find().sort({ createdAt: 1 });
    return users.map(publicUser);
};

export const updateUserRole = async (id, role) => {
    if (!ROLES.includes(role)) {
        throw new Error('Invalid role');
    }
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
        throw new Error('User not found');
    }
    return publicUser(user);
};
