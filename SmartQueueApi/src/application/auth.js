import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../infrastructure/entities/User.js';

const ROLES = ['counter-staff', 'supervisor', 'manager', 'admin'];

const publicUser = (user) => ({
    id: user._id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
});

export const register = async ({ username, password }) => {
    if (!username || !password) {
        throw new Error('Username and password are required');
    }
    if (username.trim().length < 3) {
        throw new Error('Username must be at least 3 characters');
    }
    if (password.length < 4) {
        throw new Error('Password must be at least 4 characters');
    }

    const existing = await User.findOne({ username: username.trim().toLowerCase() });
    if (existing) {
        throw new Error('That username is already taken');
    }

    // The very first account created becomes admin so there's always a way
    // in to assign roles to everyone who registers after them.
    const isFirstUser = (await User.countDocuments()) === 0;

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
        username: username.trim().toLowerCase(),
        password: hashed,
        role: isFirstUser ? 'admin' : 'counter-staff',
    });
    await user.save();
    return publicUser(user);
};

export const login = async ({ username, password }) => {
    if (!username || !password) {
        throw new Error('Username and password are required');
    }
    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user || !user.isActive) {
        throw new Error('Invalid username or password');
    }
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
        throw new Error('Invalid username or password');
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
