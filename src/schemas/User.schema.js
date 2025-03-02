// user model

// import mongoose
const mongoose = require("mongoose");

// define user model schema
const userSchema = new mongoose.Schema({
	fullName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	resetToken: { type: String, default: null }, 
	resetTokenExpires: { type: Date, default: null },
	totalPoints: { type: Number, required: false, default: 0, min: 0 },
	totalQuizzes: { type: Number, required: false, default: 0, min: 0 },
	quizzesCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],


	/////// Adding portfolio changes
	liquidMoney: { type: Number, required: true, default: 0, min: 0 },   //// Amount of cash
  	totalInvested: { type: Number, required: true, default: 0, min: 0 },   ///// Amount invested

	portfolio: {   /// Information about their total portfolio
	assetType: { type: String, enum: ["Stock", "Bond", "ETF", "Crypto"], required: true },
	assetSymbol: { type: String, required: true },
  	quantity: { type: Number, required: true, min: 0 },
  	buyPrice: { type: Number, required: true, min: 0 },
  	investedAmount: { type: Number, required: true, min: 0 },
  	dateInvested: { type: Date, default: Date.now },
	},

	transactions: [    //// Keeps track of all the transactions they made
		{
		  type: { type: String, enum: ["BUY", "SELL"], required: true },
		  assetType: { type: String, required: true },
		  assetSymbol: { type: String, required: true },
		  quantity: { type: Number, required: true },
		  price: { type: Number, required: true },
		  totalAmount: { type: Number, required: true },
		  date: { type: Date, default: Date.now },
		}
	],

	assetAllocation: {   ////// How much of each type of investment they have, number is percentage, so start with 100% cash
		cash: { type: Number, required: true, default: 100 },
		stocks: { type: Number, required: true, default: 0 },
		bonds: { type: Number, required: true, default: 0 },
		etfs: { type: Number, required: true, default: 0 },
		crypto: { type: Number, required: true, default: 0 },
	  },

	riskScore: { type: Number, required: false, default: 0 },    //// Shows how risky their investments are, basically more stocks vs bonds or etfs
	diversificationScore: { type: Number, required: false, default: 100 },     //// Shows how diverse their portfolio is based on sector variation

	favorites: [{ type: String }],    //// List of stocks that they favorite, could be but doesn't have to be stocks they invest in
	
	stockAlerts: [     ///// Sends an alert when an asset has risen or fallen to a certain price
		{
		  assetSymbol: { type: String, required: true },
		  targetPrice: { type: Number, required: true },
		  alertType: { type: String, enum: ["rise", "fall"], required: true },
		  alertTriggered: { type: Boolean, default: false },
		  createdAt: { type: Date, default: Date.now },
		}
	  ],
});

// export user model
module.exports = mongoose.model("User", userSchema);