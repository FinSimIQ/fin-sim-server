const User = require("../schemas/User.schema");
const bcrypt = require('bcrypt'); 
const crypto = require("crypto");

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

const generatePasswordResetToken = async (email) => {
  const users = await getUserByEmail(email);
  if (!users || users.length === 0) return null;
  const user = users[0];

  // generate a random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  //const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetToken = resetToken;
  user.resetTokenExpires = Date.now() + 3600000; // token expires in 1 hour
  await user.save();

  return resetToken;
};

const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetToken: token, 
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) return null;
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return user;
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
  generatePasswordResetToken,
  resetPassword,
};
