const express = require("express");
const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const userController = new UserController();
const upload = require("../middlewares/UploadConfig");

const userRoutes = express.Router();

userRoutes.get(
  "/users/totalLikes",
  AuthMiddleware,
  userController.userTotalLikes
);
userRoutes.get("/users/", AuthMiddleware, userController.getUsers);
userRoutes.get(
  "/users/topUser",
  AuthMiddleware,
  userController.getTopLikedUser
);

userRoutes.put(
  "/users/follow/:userId/:streamerId",
  userController.followAStreamerById
);

userRoutes.put(
  "/users/unfollow/:userId/:streamerId",
  userController.unfollowAStreamerById
);

userRoutes.patch(
  "/users/:userId",
  AuthMiddleware,
  upload.single("avatar"),
  userController.updateUser
);

userRoutes.get("/users/:userId", AuthMiddleware, userController.getUser);

userRoutes.delete("/users/:userId", AuthMiddleware, userController.deleteUser);

module.exports = userRoutes;
