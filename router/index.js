const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middlewares/auth");
const blogController = require("../controllers/blogController");

const router = express.Router();

//Auth
//endpoint for Register
router.post("/register", authController.register);

//endpoint for Login
router.post("/login", authController.login);

//endpoint for Logout
router.post("/logout", authController.logout);

//endpoint for Refresh
router.get("/refresh", authController.refresh);

//create for blog
router.post("/blog", blogController.create);

//read all blogs
router.get("/blog/all/:userId", blogController.getAll);

//read blog by Id
router.get("/blog/:id", blogController.getById);

//delete
router.delete("/blog/:id", blogController.delete);

module.exports = router;
