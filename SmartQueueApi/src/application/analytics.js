
export const getAnalytics = async () => {
    try {
        return  await analyticsRepo.getAllAnalytics();
    } catch (error) {
        throw new Error("Failed to fetch analytics: " + error.message);
    }
};

export const getAnalytic = async (id) => {
    try {
        const analytic = await analyticsRepo.getAnalyticById(id);
        if (!analytic) {
            throw new Error("Analytic record not found");
        }
        return analytic;
    } catch (error) {
        throw new Error("Failed to fetch analytic: " + error.message);
    }
};

export const addAnalyticByRange = async (startDate, endDate) => {
    try {
        return await analyticsRepo.getAnalyticsByDateRange(startDate, endDate);
    } catch (error) {
        throw new Error("Failed to fetch analytics by date range: " + error.message);
    }
};

export const recordAnalytic = async (analyticData) => {
    try {
            if (!analyticData.date) {
                throw new Error("Date is required to record analytic");
            }
        return await analyticsRepo.createAnalytic(analyticData);
    } catch (error) {
        throw new Error("Failed to record analytic: " + error.message);
    }
};

export const updateAnalytic = async (id, updateData) => {
    try {
        const existingAnalytic = await analyticsRepo.getAnalyticById(id);
        if (!existingAnalytic) {
            throw new Error("Analytic record not found");
        }
        const success = await analyticsRepo.updateAnalytic(id, updateData);
        if (!success) {
            throw new Error("Failed to update analytic record");
        }
        return await analyticsRepo.getAnalyticById(id);
    } catch (error) {
        throw new Error("Failed to update analytic: " + error.message);
    }
};

export const getSummary = async () => {
    try {
        const summary = await analyticsRepo.getAnalyticsSummary();
        return summary[0] || {
            totalTokens: 0,
            completedToday: 0,
            avgWaitTime: 0,
        };
    } catch (error) {
        throw new Error("Failed to fetch analytics summary: " + error.message);
    }
};