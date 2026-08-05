import Token from "../infrastructure/entities/Token.js";
import Counter from "../infrastructure/entities/Counter.js";
import Service from "../infrastructure/entities/Service.js";
import { getServiceSlots } from "./timeslot.js";

const generateTokenNumber = (serviceName) => {
    const prefix = (serviceName?.trim().charAt(0) || "T").toUpperCase();
    const sequence = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${sequence}`;
};

const refreshCounterQueueCount = async (counterId) => {
    if (!counterId) return;
    const pendingCount = await Token.countDocuments({
        "counter.counterId": counterId,
        status: "pending",
    });
    await Counter.findByIdAndUpdate(counterId, {
        $set: { "waitingQueue.count": pendingCount },
    });
};

const assignLeastBusyCounter = async (serviceId) => {
    const counters = await Counter.find({ "service.serviceId": serviceId, isActive: true }).sort({
        "waitingQueue.count": 1,
    });
    return counters[0] ?? null;
};

const toLocalDateOnly = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const toLocalClock = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

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

        const bookedAt = bookedDate ? new Date(bookedDate) : new Date();
        const slotInfo = await getServiceSlots(serviceId, toLocalDateOnly(bookedAt));
        if (slotInfo.isClosed) {
            throw new Error("This service has no counters available on the selected date");
        }
        const matchingSlot = slotInfo.slots.find((s) => s.time === toLocalClock(bookedAt));
        if (!matchingSlot) {
            throw new Error("Selected time slot is not available");
        }
        if (!matchingSlot.available) {
            throw new Error("Selected time slot is full, please choose another slot");
        }

        const assignedCounter = await assignLeastBusyCounter(serviceId);

        let estimatedWaitTime = 0;
        if (assignedCounter) {
            const service = await Service.findById(serviceId);
            const aheadCount = await Token.countDocuments({
                "counter.counterId": assignedCounter._id,
                status: "pending",
            });
            estimatedWaitTime = aheadCount * (service?.duration || 30);
        }

        const token = new Token({
            tokenNumber,
            service: { serviceId, serviceName },
            citizen: { name: citizenName, nic, phone },
            bookedDate: bookedAt,
            priority: !!priority,
            timing: { estimatedWaitTime },
            ...(assignedCounter && {
                counter: { counterId: assignedCounter._id, counterName: assignedCounter.counterName },
            }),
        });
        await token.save();
        if (assignedCounter) {
            await refreshCounterQueueCount(assignedCounter._id);
        }
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

        counter.currentToken = { tokenId: token._id, tokenNumber: token.tokenNumber };
        counter.status = "active";
        await counter.save();
        await refreshCounterQueueCount(counter._id);

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

        if (token.counter?.counterId) {
            const counter = await Counter.findById(token.counter.counterId);
            if (counter) {
                if (String(counter.currentToken?.tokenId) === String(token._id)) {
                    counter.currentToken = undefined;
                    counter.status = "idle";
                }
                counter.dailyMetrics.tokensServed = (counter.dailyMetrics.tokensServed || 0) + 1;
                await counter.save();
            }
        }

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

        if (token.counter?.counterId) {
            const counter = await Counter.findById(token.counter.counterId);
            if (counter) {
                if (String(counter.currentToken?.tokenId) === String(token._id)) {
                    counter.currentToken = undefined;
                    counter.status = "idle";
                }
                await counter.save();
            }
            await refreshCounterQueueCount(token.counter.counterId);
        }

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
