const Leaderboard = require('../schemas/Leaderboard.schema');


exports.getLeaderboard = async (req, res) => {
  const size = parseInt(req.query.size) || 10; 
  try {
    const leaderboard = await Leaderboard.find()
      .sort({ score: -1 }) 
      .limit(size) 
      .populate('userId', 'username'); 
    
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leaderboard', error });
  }
};

