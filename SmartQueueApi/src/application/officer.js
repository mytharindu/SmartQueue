import Officer from "../infrastructure/entities/Officer.js";


export const getOfficers = async () => {
    try {
        return await Officer.find();
    } catch (error) {
        throw new Error(`Failed to fetch officers: ${error.message}`);
    }
};

export const getOfficer = async (id) => {
    try {
        const officer = await Officer.findById(id);
        if (!officer) {
            throw new Error("Officer not found");
        }
        return officer;
    } catch (error) {
        throw new Error(`Failed to fetch officer: ${error.message}`);
    }
};

export const getOfficerByDept = async (department) => {
    try {
        const officers = await Officer.find({ department });
        if (!officers || officers.length === 0) {
            throw new Error("No officers found in this department");
        }
        return officers;
    } catch (error) {
        throw new Error(`Failed to fetch officers by department: ${error.message}`);
    }
};

export const addOfficer = async (officerData) => {
    try {
        if (!officerData.name || !officerData.department) {
            throw new Error("Officer name and department are required");
        }
        const newOfficer = new Officer(officerData);
        await newOfficer.save();
        return newOfficer;
    } catch (error) {
        throw new Error(`Failed to create officer: ${error.message}`);
    }   
};

export const modifyOfficer = async (id, updateData) => {
    try {
        const existingOfficer = await Officer.findById(id);
        if (!existingOfficer) {
            throw new Error("Officer not found");
        }
        await Officer.findByIdAndUpdate(id, updateData, { new: true });
        return await Officer.findById(id);
    } catch (error) {
        throw new Error(`Failed to update officer: ${error.message}`);
    }
};

export const removeOfficer = async (id) => {
    try {
        const existingOfficer = await Officer.findById(id);
        if (!existingOfficer) {
            throw new Error("Officer not found");
        }
        await Officer.findByIdAndDelete(id);
        return existingOfficer;
    } catch (error) {
        throw new Error(`Failed to delete officer: ${error.message}`);
    }
};
