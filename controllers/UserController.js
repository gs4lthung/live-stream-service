const {
  findUser,
  updateUserProfile,
  deactivateUser,
  findAllUsers,
  getTopXLiked,
  getUserTotalLike,
  changePassword,
  generateResetPasswordToken,
  resetPassword,
  followAStreamerByIdService,
  unfollowAStreamerByIdService,
} = require("../services/UserService");
const {
  uploadToBunny,
  deleteFromBunny,
} = require("../middlewares/UploadToBunny");
const { default: mongoose } = require("mongoose");

class UserController {
  // get a user
  async getUser(req, res) {
    const { userId } = req.params;

    try {
      const user = await findUser(userId);

      res.status(200).json({ data: user, message: "Success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // get all users
  async getUsers(req, res) {
    const { page, limit, searchQuery } = req.query;
    try {
      const users = await findAllUsers(searchQuery, limit, page);
      res.status(200).json({ data: users, message: "Success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // update a user
  async updateUser(req, res) {
    const { name, bio, isActive } = req.body;
    const img = req.file ? req.file : null;
    const userId = req.userId;

    try {
      const user = await updateUserProfile(userId, {});
      const currentAvatarUrl = user.avatarUrl;

      console.log("Current Avatar URL:", currentAvatarUrl);

      let newAvatarUrl = currentAvatarUrl;

      if (img) {
        if (currentAvatarUrl) {
          await deleteFromBunny(currentAvatarUrl);
        }
        newAvatarUrl = await uploadToBunny(img);
        console.log("New Avatar URL:", newAvatarUrl);
      }

      const updateData = {
        name,
        bio,
        avatarUrl: newAvatarUrl,
        isActive,
      };

      const updatedUser = await updateUserProfile(userId, updateData);
      res.status(200).json({ data: updatedUser, message: "Success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    const { userId } = req.params;

    try {
      await deactivateUser(userId);

      res.status(200).json({ message: "Success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async changeUserPassword(req, res) {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;
    try {
      const user = await changePassword(userId, oldPassword, newPassword);
      if (user) {
        res.status(200).json({ message: "Password changed successfully" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateResetUserPasswordToken(req, res) {
    const { email } = req.body;
    try {
      const user = await generateResetPasswordToken(email);
      if (user) {
        res.status(200).json({ message: "Password reset successfully" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async resetUserPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
      const user = await resetPassword(token, newPassword);
      if (user) {
        res.status(200).json({ message: "Password reset successfully" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTopLikedUser(req, res) {
    const { top } = req.query; // Read 'top' from query
    const limit = parseInt(top) || 10; // Default to 10 if not provided
    try {
      const users = await getTopXLiked(limit);
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      return res
        .status(200)
        .json({ data: users, message: "Success", total: users.length }); // Correct 'users' object
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  async userTotalLikes(req, res) {
    const { userId } = req.query;

    console.log(userId); // Ensure the userId is logged correctly

    // Validate if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    try {
      // Pass userId directly instead of as an object
      const totalLikes = await getUserTotalLike(userId);
      return res.json(totalLikes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async followAStreamerById(req, res) {
    const { userId, streamerId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(streamerId)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid userId or streamerId format" });
    }

    try {
      await followAStreamerByIdService(userId, streamerId);
      return res.status(200).json("Follow successfully");
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async unfollowAStreamerById(req, res) {
    const { userId, streamerId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(streamerId)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid userId or streamerId format" });
    }

    try {
      await unfollowAStreamerByIdService(userId, streamerId);
      return res.status(200).json("Unfollow successfully");
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;
