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

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (e) {
    res.status(500).json({ message: "failure", reason: e.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createUser(fullName, email, hashedPassword);
    res.json(user);
  } catch (e) {
    res.json({ message: "failure", reason: e.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.getUserByEmail(email);
    if (user.length == 1) {
      const result = await bcrypt.compare(password, user[0].password);
      if (result) {
        res.json(user);
      } else {
        res.json({ message: "Invalid credentials" });
      }
    } else {
      res.json({ message: "Account not found" });
    }
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

const addFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.body;

    if (userId === friendId) {
      return res
        .status(400)
        .json({ message: "Cannot add yourself as a friend." });
    }

    await userModel.addFriend(userId, friendId);
    await userModel.addFriend(friendId, userId);

    res.status(200).json({ message: "Friend added successfully!" });
  } catch (e) {
    res.status(500).json({ message: "failure", reason: e.message });
  }
};

const updateUserPoints = async (email, updates) => {
  try {
    return await userModel.findOneAndUpdate({ email }, updates, { new: true });
  } catch (error) {
    throw new Error("Failed to update user points: " + error.message);
  }
};

module.exports = {
  getAllUsers,
  getUserByEmail,
  getUserByName,
  createUser,
  loginUser,
  deleteUser,
  updateUserPoints,
  getUserById,
  addFriend,
};
