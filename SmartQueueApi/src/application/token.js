import Token from "../infrastructure/entities/Token.js";

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

export const getTokenByService = async (serviceId) => {
    try {
        const token = await Token.findOne({ serviceId });
        if (!token) {
            throw new Error("Token not found for the given service");
        }
        return token;
    } catch (error) {
        throw new Error("Failed to fetch token by service: " + error.message);
    }
};

export const reserveToken = async (tokenData) => {
    try {
        if (!tokenData.visitorName || !tokenData.serviceId) {
            throw new Error("Visitor name and service ID are required to reserve a token");
        }
        const newToken = {
            ...tokenData,
            status: "pending",
            createdAt: new Date(),
        };
        const token = new Token(newToken);
        await token.save();
        return token;
    } catch (error) {
        throw new Error("Failed to reserve token: " + error.message);
    }
};

export const callToken = async (id, counterNumber) => {
    try {
        const token = await Token.findById(id);
        if (!token) {
            throw new Error("Token not found");
        }
        token.status = "called";
        token.counterNumber = counterNumber;
        token.calledAt = new Date();
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
        token.completedAt = new Date();
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
        token.cancelledAt = new Date();
        await token.save();
        return token;
    } catch (error) {
        throw new Error("Failed to cancel token: " + error.message);
    }
};

export const getTokenStats = async () => {
    try {
        const pendingTokens = await Token.find({ status: "pending" });
        const calledTokens = await Token.find({ status: "called" });
        const completedTokens = await Token.find({ status: "completed" });
        const cancelledTokens = await Token.find({ status: "cancelled" });

        return {
            pending: pendingTokens.length,
            called: calledTokens.length,
            completed: completedTokens.length,
            cancelled: cancelledTokens.length,
            total: pendingTokens.length + calledTokens.length + completedTokens.length + cancelledTokens.length,
        };
    } catch (error) {
        throw new Error("Failed to fetch token stats: " + error.message);
    }
};