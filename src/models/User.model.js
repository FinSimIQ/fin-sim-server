const User = require("../schemas/User.schema");

const getAllUsers = async () => {
  return await User.find({}).exec();
};

const getUserByEmail = async (email) => {
  return await User.find({ email: new RegExp(email, "i") }).exec();
};

const getUserByName = async (name) => {
  return await User.find({ fullName: new RegExp(name, "i") }).exec();
};

const getUserById = async (id) => {
  return await User.findById(id).exec();
};

const createUser = async (fullName, email, password) => {
  return await User.create({
    fullName,
    email,
    password,
  });
};

const deleteUser = async (id) => {
  return await User.deleteOne({ _id: id }).exec();
};

const updateUserPoints = async (email, updates) => {
  return await User.findOneAndUpdate({ email }, updates, { new: true }).exec();
};

const addFriend = async (userId, friendId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $addToSet: { friends: friendId } },
    { new: true }
  ).exec();
};

module.exports = {
  getAllUsers,
  getUserByEmail,
  getUserByName,
  createUser,
  deleteUser,
  updateUserPoints,
  getUserById,
  addFriend,
};
