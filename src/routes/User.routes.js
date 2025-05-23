const express = require("express");
const router = express.Router();
const userController = require("../controllers/User.controller");

router.get("/", userController.getAllUsers);
router.get("/email/:email", userController.getUserByEmail);
router.get("/name/:name", userController.getUserByName);
router.post("/signup", userController.createUser);
router.post("/login", userController.loginUser);
router.delete("/:id", userController.deleteUser);
router.post("/addFriend", userController.addFriend);
router.post("/forgotPassword", userController.forgotPassword);
router.post("/resetPassword", userController.resetPassword);

module.exports = router;
