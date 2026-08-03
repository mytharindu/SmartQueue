import Counter from "../infrastructure/entities/Counter.js";

export const getCounters = async () => {
   try {
    return await Counter.find();
  } catch (error) {
    throw new Error(`Failed to fetch counters: ${error.message}`);
  }
}

export const getCounter = async (id) => {
  try {
    return await Counter.findById(id);
  } catch (error) {
    throw new Error(`Failed to fetch counter: ${error.message}`);
  }
}

export const addCounter = async (counterData) => {
  try {
    if (!counterData.name || !counterData.number) {
      throw new Error('Counter name and number are required');
    }
    const newCounter = new Counter(counterData);
    await newCounter.save();
    return newCounter;
  } catch (error) {
    throw new Error(`Failed to create counter: ${error.message}`);
  }
}   

export const modifyCounter = async (id, updateData) => {
  try {
    const existingCounter = await Counter.findById(id);
    if (!existingCounter) {
      throw new Error('Counter not found');
    }
    await Counter.findByIdAndUpdate(id, updateData, { new: true });
    return await Counter.findById(id);
  } catch (error) {
    throw new Error(`Failed to update counter: ${error.message}`);
  }
}

export const removeCounter = async (id) => {
  try {
    const existingCounter = await Counter.findById(id);
    if (!existingCounter) {
      throw new Error('Counter not found');
    }
    await Counter.findByIdAndDelete(id);
    return existingCounter;
  } catch (error) {
    throw new Error(`Failed to delete counter: ${error.message}`);
  }
}