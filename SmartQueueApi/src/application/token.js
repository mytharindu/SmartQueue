import Token from "../infrastructure/entities/Token.js";
import Counter from "../infrastructure/entities/Counter.js";

const generateTokenNumber = (serviceName) => {
    const prefix = (serviceName?.trim().charAt(0) || "T").toUpperCase();
    const sequence = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${sequence}`;
};

export const getTokens = async () => {
    try {
        return await Token.find();
    } catch (error) {
        throw new Error("Failed to fetch tokens: " + error.message);
    }
};

export const getToken = async (id) => {
    try {
        const token = await Token.findById(id);
        if (!token) {
            throw new Error("Token not found");
        }
        return token;
    } catch (error) {
        throw new Error("Failed to fetch token: " + error.message);
    }
};

export const getTokensByStatus = async (status) => {
    try {
        return await Token.find({ status });
    } catch (error) {
        throw new Error("Failed to fetch tokens by status: " + error.message);
    }
};

export const reserveToken = async (tokenData) => {
    try {
        const { serviceId, serviceName, citizenName, nic, phone, bookedDate, priority } = tokenData;
        if (!citizenName || !serviceId || !serviceName) {
            throw new Error("Citizen name, service ID and service name are required to reserve a token");
        }

        let tokenNumber;
        let isDuplicate = true;
        for (let attempts = 0; attempts < 5 && isDuplicate; attempts += 1) {
            tokenNumber = generateTokenNumber(serviceName);
            isDuplicate = await Token.exists({ tokenNumber });
        }
        if (isDuplicate) {
            throw new Error("Could not generate a unique token number, please try again");
        }

        const token = new Token({
            tokenNumber,
            service: { serviceId, serviceName },
            citizen: { name: citizenName, nic, phone },
            bookedDate: bookedDate ? new Date(bookedDate) : new Date(),
            priority: !!priority,
        });
        await token.save();
        return token;
    } catch (error) {
        throw new Error("Failed to reserve token: " + error.message);
    }
};

export const modifyToken = async (id, updateData) => {
    try {
        const updated = await Token.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            throw new Error("Token not found");
        }
        return updated;
    } catch (error) {
        throw new Error("Failed to update token: " + error.message);
    }
};

export const callToken = async (id, counterNumber) => {
    try {
        const token = await Token.findById(id);
        if (!token) {
            throw new Error("Token not found");
        }
        const counter = await Counter.findOne({ counterNumber });
        if (!counter) {
            throw new Error("Counter not found");
        }
        token.status = "called";
        token.counter = { counterId: counter._id, counterName: counter.counterName };
        token.timing.serviceStartTime = new Date();
        await token.save();
        return token;
    } catch (error) {
        throw new Error("Failed to call token: " + error.message);
    }
};

export const completeToken = async (id) => {
    try {
        const token = await Token.findById(id);
        if (!token) {
            throw new Error("Token not found");
        }
        token.status = "completed";
        token.timing.serviceEndTime = new Date();
        if (token.timing.serviceStartTime) {
            token.timing.actualWaitTime = Math.round(
                (token.timing.serviceStartTime - token.createdAt) / 60000
            );
        }
        await token.save();
        return token;
    } catch (error) {
        throw new Error("Failed to complete token: " + error.message);
    }
};

export const cancelToken = async (id) => {
    try {
        const token = await Token.findById(id);
        if (!token) {
            throw new Error("Token not found");
        }
        token.status = "cancelled";
        await token.save();
        return token;
    } catch (error) {
        throw new Error("Failed to cancel token: " + error.message);
    }
};

export const getTokenStats = async () => {
    try {
        const [pending, called, serving, completed, cancelled] = await Promise.all([
            Token.countDocuments({ status: "pending" }),
            Token.countDocuments({ status: "called" }),
            Token.countDocuments({ status: "serving" }),
            Token.countDocuments({ status: "completed" }),
            Token.countDocuments({ status: "cancelled" }),
        ]);

        return {
            pending,
            called,
            serving,
            completed,
            cancelled,
            total: pending + called + serving + completed + cancelled,
        };
    } catch (error) {
        throw new Error("Failed to fetch token stats: " + error.message);
    }
};
