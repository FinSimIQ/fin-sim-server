const bcrypt = require("bcrypt");
const userModel = require("../models/User.model");
const { sendEmail } = require("../services/emailService");

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

const addFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.body;

    if (userId === friendId) {
      return res.status(400).json({ message: "Cannot add yourself as a friend." });
    }

    await userModel.addFriend(userId, friendId);
    await userModel.addFriend(friendId, userId);

    res.status(200).json({ message: "Friend added successfully!" });
  } catch (e) {
    console.error('Error in addFriend:', e.message);  // Log any error
    res.status(500).json({ message: "failure", reason: e.message });
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

const updateUserPoints = async (email, updates) => {
  try {
    return await userModel.findOneAndUpdate({ email }, updates, { new: true });
  } catch (error) {
    throw new Error("Failed to update user points: " + error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const resetToken = await userModel.generatePasswordResetToken(email);
    
    if (!resetToken) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetPasswordUrl = `http://localhost:5173/resetPassword?token=${resetToken}`;
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    const emailBody = `
      <html>
        <body>
          <p>You requested a password reset. Please use the following link to reset your password:</p>
          <p><a href="${resetPasswordUrl}" style="color: #4CAF50; font-size: 16px;">Click here to reset your password</a></p>
          <p>If you did not request this, please ignore this email. The link will expire in 1 hour.</p>
        </body>
      </html>
    `;

    await sendEmail(email, 'Password Reset Request', emailBody)
      .then(() => console.log('Email sent successfully!'))
      .catch(err => console.error(err));

    res.json({ message: "Password reset token generated. Check email for instructions." });
  } catch (e) {
    res.status(500).json({ message: "Failed to generate reset token for this email", reason: e.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await userModel.resetPassword(token, newPassword);
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    res.json({ message: "Password reset successful" });
  } catch (e) {
    res.status(500).json({ message: "Failed password reset", reason: e.message });
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
  forgotPassword,
  resetPassword
};
