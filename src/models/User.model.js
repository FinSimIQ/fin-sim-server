const User = require("../schemas/User.schema");
const bcrypt = require("bcrypt");
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

////// Adding portfolio changes
const buyAsset = async (userId, assetType, assetSymbol, quantity, price) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const totalCost = quantity * price;
  if (user.liquidMoney < totalCost) throw new Error("Insufficient funds");

  user.liquidMoney -= totalCost;
  user.totalInvested += totalCost;

  const existingAsset = user.portfolio.find(
    (asset) => asset.assetSymbol === assetSymbol
  );

  if (existingAsset) {
    existingAsset.quantity += quantity;
    existingAsset.investedAmount += totalCost;
    existingAsset.buyPrice =
      existingAsset.investedAmount / existingAsset.quantity;
  } else {
    user.portfolio.push({
      assetType,
      assetSymbol,
      quantity,
      buyPrice: price,
      investedAmount: totalCost,
      dateInvested: new Date(),
    });
  }

  user.transactions.push({
    type: "BUY",
    assetType,
    assetSymbol,
    quantity,
    price,
    totalAmount: totalCost,
  });

  await updateAssetAllocation(user);
  await updateDiversificationScore(user);
  await updateRiskScore(user);
  await user.save();
  return user;
};

const sellAsset = async (userId, assetSymbol, quantity, sellPrice) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const assetIndex = user.portfolio.findIndex(
    (asset) => asset.assetSymbol === assetSymbol
  );
  if (assetIndex === -1 || user.portfolio[assetIndex].quantity < quantity) {
    throw new Error("Not enough assets to sell");
  }

  const asset = user.portfolio[assetIndex];
  const totalSale = quantity * sellPrice;
  const investedAmount = asset.buyPrice * quantity;
  const profitLoss = totalSale - investedAmount;

  user.liquidMoney += totalSale;
  user.totalInvested -= investedAmount;

  asset.quantity -= quantity;
  asset.investedAmount -= investedAmount;

  if (asset.quantity === 0) {
    user.portfolio.splice(assetIndex, 1);
  }

  user.transactions.push({
    type: "SELL",
    assetType: asset.assetType,
    assetSymbol,
    quantity,
    price: sellPrice,
    totalAmount: totalSale,
  });

  await updateAssetAllocation(user);
  await updateDiversificationScore(user);
  await updateRiskScore(user);
  await user.save();
  return { user, profitLoss };
};

const updateAssetAllocation = async (user) => {
  //// Updates percentages of assets
  const totalValue = user.liquidMoney + user.totalInvested;
  if (totalValue === 0) return;

  const newAllocation = {
    cash: (user.liquidMoney / totalValue) * 100,
    stocks: 0,
    bonds: 0,
    etfs: 0,
    crypto: 0,
  };

  user.portfolio.forEach((asset) => {
    const percentage = (asset.investedAmount / totalValue) * 100;
    newAllocation[asset.assetType.toLowerCase() + "s"] += percentage;
  });

  user.assetAllocation = newAllocation;
  await user.save();
};

const updateRiskScore = async (user) => {
  let riskScore = 0;

  user.portfolio.forEach((asset) => {
    switch (asset.assetType) {
      case "Stock":
        riskScore += 15;
        break;
      case "Bond":
        riskScore += 5;
        break;
      case "ETF":
        riskScore += 8;
        break;
      case "Crypto":
        riskScore += 20;
        break;
      default:
        riskScore += 10;
        break;
    }
  });

  const assetTypes = user.portfolio.map((asset) => asset.assetType);
  const uniqueAssetTypes = [...new Set(assetTypes)];
  diversificationScore = (uniqueAssetTypes.length / 4) * 100;

  user.riskScore = riskScore;
  await user.save();
};

const updateDiversificationScore = async (user) => {
  const diversificationScore = calculateDiversificationScore(user.portfolio);

  user.diversificationScore = diversificationScore;
  await user.save();
};

const checkStockAlerts = async (user, currentPrices) => {
  user.stockAlerts.forEach((alert) => {
    const currentPrice = currentPrices[alert.assetSymbol];

    if (alert.alertType === "rise") {
      if (currentPrice >= alert.targetPrice && !alert.alertTriggered) {
        alert.alertTriggered = true;
        console.log(
          `Alert: ${alert.assetSymbol} has risen to the target price of ${alert.targetPrice}`
        ); //// Method to signify the alert, can change this to email user
      }
    } else if (alert.alertType === "fall") {
      if (currentPrice <= alert.targetPrice && !alert.alertTriggered) {
        alert.alertTriggered = true;
        console.log(
          `Alert: ${alert.assetSymbol} has fallen to the target price of ${alert.targetPrice}`
        ); //// Method to signify the alert, can change this to email user
      }
    }
  });

  await user.save();
};

/////// Helper method for calculation of diversification score
const calculateDiversificationScore = (portfolio) => {
  const sectorDistribution = {};
  let totalInvestedAmount = 0;

  portfolio.forEach((asset) => {
    totalInvestedAmount += asset.investedAmount;

    if (sectorDistribution[asset.sector]) {
      sectorDistribution[asset.sector] += asset.investedAmount;
    } else {
      sectorDistribution[asset.sector] = asset.investedAmount;
    }
  });

  let diversificationScore = 0;
  const totalSectors = Object.keys(sectorDistribution).length;

  if (totalSectors > 0) {
    const sectorScores = Object.values(sectorDistribution).map(
      (sectorAmount) => {
        return (sectorAmount / totalInvestedAmount) * 100;
      }
    );
    diversificationScore = Math.min(
      100,
      sectorScores.reduce(
        (sum, sectorPercent) =>
          sum + (100 - Math.abs(sectorPercent - 100 / totalSectors))
      ),
      0
    );
  }

  return diversificationScore;
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
  buyAsset,
  sellAsset,
  updateAssetAllocation,
  updateRiskScore,
  updateDiversificationScore,
  checkStockAlerts,
};
