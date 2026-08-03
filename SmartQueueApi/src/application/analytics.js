import Analytics from "../infrastructure/entities/Analytic.js";

export const getAnalytics = async () => {
    try {
        return await Analytics.find();
    } catch (error) {
        throw new Error("Failed to fetch analytics: " + error.message);
    }
};

export const getAnalytic = async (id) => {
    try {
        const analytic = await Analytics.findById(id);
        if (!analytic) {
            throw new Error("Analytic record not found");
        }
        return analytic;
    } catch (error) {
        throw new Error("Failed to fetch analytic: " + error.message);
    }
};

export const getAnalyticsByRange = async (startDate, endDate) => {
    try {
        return await Analytics.find({
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });
    } catch (error) {
        throw new Error("Failed to fetch analytics by date range: " + error.message);
    }
};

export const recordAnalytic = async (analyticData) => {
    try {
        if (!analyticData.date) {
            throw new Error("Date is required to record analytic");
        }
        const newAnalytic = new Analytics(analyticData);
        await newAnalytic.save();
        return newAnalytic;
    } catch (error) {
        throw new Error("Failed to record analytic: " + error.message);
    }
};

export const updateAnalytic = async (id, updateData) => {
    try {
        const existingAnalytic = await Analytics.findById(id);
        if (!existingAnalytic) {
            throw new Error("Analytic record not found");
        }
        const updated = await Analytics.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) {
            throw new Error("Failed to update analytic record");
        }
        return updated;
    } catch (error) {
        throw new Error("Failed to update analytic: " + error.message);
    }
};

export const getSummary = async () => {
    try {
        const summary = await Analytics.aggregate([
            {
                $group: {
                    _id: null,
                    totalTokens: { $sum: "$summary.totalTokensIssued" },
                    completedToday: { $sum: "$summary.totalTokensServed" },
                    avgWaitTime: { $avg: "$waitTime.average" },
                },
            },
        ]);
        return (
            summary[0] || {
                totalTokens: 0,
                completedToday: 0,
                avgWaitTime: 0,
            }
        );
    } catch (error) {
        throw new Error("Failed to fetch analytics summary: " + error.message);
    }
};
