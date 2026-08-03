import Service from "../infrastructure/entities/Service.js";

export const getAllServices = async () => {
   try {
    return await Service.find();
   } catch (error) {
    throw new Error("Failed to fetch services: " + error.message);
   }
};

export const getServiceById = async (id) => {
  try {
    const service = await Service.findById(id);
    if (!service) {
      throw new Error("Service not found");
    }
    return service;
  } catch (error) {
    throw new Error("Failed to fetch service: " + error.message);
  }
};

export const addService = async (serviceData) => {
  try {
    if (!serviceData.name) {
      throw new Error("Service name is required");
    }
    const newService = new Service(serviceData);
    await newService.save();
    return newService;
  } catch (error) {
    throw new Error("Failed to add service: " + error.message);
  }
};

export const modifyService = async (id, updateData) => {
  try {
    const existingService = await Service.findById(id);
    if (!existingService) {
      throw new Error("Service not found");
    }
    const updatedService = await Service.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedService) {
      throw new Error("Failed to update service");
    }
    return updatedService;
  } catch (error) {
    throw new Error("Failed to modify service: " + error.message);
  }
};

export const removeService = async (id) => {
  try {
    const existingService = await Service.findById(id);
    if (!existingService) {
      throw new Error("Service not found");
    }
    return await Service.findByIdAndDelete(id);
  } catch (error) {
    throw new Error("Failed to remove service: " + error.message);
  }
};
