const Leaderboard = require("../schemas/Leaderboard.schema");
const UserSchema = require("../schemas/User.schema");

exports.getLeaderboard = async (req, res) => {
  const size = parseInt(req.query.size) || 10;
  try {
    const leaderboard = await UserSchema.find()
      .sort({ totalPoints: -1 })
      .limit(size);

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving leaderboard", error });
  }
};
