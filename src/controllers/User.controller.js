const userModel = require("../models/User.model");

const getAllUsers = async (req, res) => {
	try {
		const users = await userModel.getAllUsers();
		res.json(users);
	} catch (e) {
		res.json({ message: "failure", reason: e.message });
	}
};

const getUserById = async (req, res) => {
	try {
		const user = await userModel.getUserById(req.params);
		res.json(user);
	} catch (e) {
		res.json({ message: "failure", reason: e.message });
	}
};

module.exports = { getAllUsers, getUserById };
