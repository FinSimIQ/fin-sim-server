const bcrypt = require("bcrypt");
const userModel = require("../models/User.model");

const getAllUsers = async (req, res) => {
	try {
		const users = await userModel.getAllUsers();
		res.json(users);
	} catch (e) {
		res.json({ message: "failure", reason: e.message });
	}
};

const getUserByEmail = async (req, res) => {
	try {
		const { email } = req.params;
		const user = await userModel.getUserByEmail(email);
		res.json(user);
	} catch (e) {
		res.json({ message: "failure", reason: e.message });
	}
};

const getUserByName = async (req, res) => {
	try {
		const { name } = req.params;
		const user = await userModel.getUserByName(name);
		res.json(user);
	} catch (e) {
		res.json({ message: "failure", reason: e.message });
	}
};

const createUser = async (req, res) => {
	try {
		const { fullName, email, password } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await userModel.createUser(fullName, email, hashedPassword);
		res.json(user);
	} catch (e) {
		res.json({ message: "failure", reason: e.message });
	}
};

const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await userModel.deleteUser(id);
		res.json(user);
	} catch (e) {
		res.json({ message: "failure", reason: e.message });
	}
};

module.exports = {
	getAllUsers,
	getUserByEmail,
	getUserByName,
	createUser,
	deleteUser,
};
