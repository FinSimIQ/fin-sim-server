const userSchema = require("../schemas/User.schema");

const getAllUsers = async () => {
	return await userSchema.find();
};

const getUserById = async ({ id }) => {
	return await userSchema.findById(id);
};

module.exports = { getAllUsers, getUserById };
