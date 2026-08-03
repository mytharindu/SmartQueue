import Department from "../infrastructure/entities/Department.js";

export async function getDepartments() {
  try {
    return await Department.find();
  } catch (error) {
    throw new Error(`Failed to fetch departments: ${error.message}`);
  }
}

export async function getDepartment(id) {
  try {
    const department = await Department.findById(id);
    if (!department) {
      throw new Error('Department not found');
    }
    return department;
  } catch (error) {
    throw new Error(`Failed to fetch department: ${error.message}`);
  }
}

export async function addDepartment(departmentData) {
  try {
    console.log('Adding department with data:', departmentData);
    if (!departmentData.name) {
      throw new Error('Department name is required');
    }
    if (!departmentData.location) {
      throw new Error('Department location is required');
    }
    if (!departmentData.deptId) {
      throw new Error('Department ID is required');
    }

    // Check if department ID already exists
    // const existing = await Department.findOne({ deptId: departmentData.deptId });
    // if (existing) {
    //   throw new Error('Department ID already exists');
    // }

    const newDepartment = new Department(departmentData);
    await newDepartment.save();
    return newDepartment;
  } catch (error) {
    throw new Error(`Failed to create department: ${error.message}`);
  }
}

export async function modifyDepartment(id, updateData) {
  try {
    const exists = await Department.findById(id);
    if (!exists) {
      throw new Error('Department not found');
    }

    // If deptId is being updated, check it doesn't already exist
    if (updateData.deptId && updateData.deptId !== exists.deptId) {
      const conflicting = await Department.findOne({ deptId: updateData.deptId });
      if (conflicting) {
        throw new Error('Department ID already exists');
      }
    }

    const updatedDepartment = await Department.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedDepartment) {
      throw new Error('Failed to update department');
    }
    return updatedDepartment;
  } catch (error) {
    throw new Error(`Failed to update department: ${error.message}`);
  }
}

export async function removeDepartment(id) {
  try {
    const exists = await Department.findById(id);
    if (!exists) {
      throw new Error('Department not found');
    }
    return await Department.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Failed to delete department: ${error.message}`);
  }
}

export async function getDepartmentStats() {
  try {
    return await Department.aggregate([
      {
        $group: {
          _id: null,
          totalDepartments: { $sum: 1 },
          activeDepartments: { $sum: { $cond: ["$isActive", 1, 0] } },
        },
      },
    ]);
  } catch (error) {
    throw new Error(`Failed to fetch department stats: ${error.message}`);
  }
}