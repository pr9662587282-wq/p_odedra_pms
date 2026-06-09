const Profile = require("../models/Profile");
const User = require("../models/User");
const UserFrom = require("../models/User_fromdata");
const mongoose = require("mongoose");

// SAVE / UPDATE PROFILE

const saveProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let imageBase64 = null;

    //  Multer file handling
    if (req.file) {
      imageBase64 = req.file.buffer.toString("base64");
    }

    const existingProfile = await Profile.findOne({ userId });

    let profile;

    if (!existingProfile) {
      profile = await Profile.create({
        ...req.body,
        userId,
        profileImage: imageBase64,
      });
    } else {
      profile = await Profile.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...req.body,
            ...(imageBase64 && { profileImage: imageBase64 }),
          },
        },
        { new: true },
      );
    }

    res.status(200).json({
      success: true,
      message: existingProfile ? "Profile updated" : "Profile created",
      profile,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/*const getUserName = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ userId });

    let nameToReturn = null;

    if (profile && (profile.fullName || profile.fullname)) {
      nameToReturn = profile.fullName || profile.fullname;
    } else {
      // If not found in Profile or name is missing, check UserFrom
      const user = await User.findById(userId);
      if (user && user.email) {
        const fromData = await UserFrom.findOne({ email: user.email });
        if (fromData && fromData.fullname) {
          nameToReturn = fromData.fullname;
        }
      }
    }

    if (!nameToReturn) {
      return res
        .status(404)
        .json({ success: false, message: "Name not found for this user." });
    }

    res.status(200).json({
      success: true,
      name: nameToReturn,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};*/

const getUserName = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1
    let profile = await Profile.findOne({ userId });

    if (profile && profile.fullName) {
      return res.json({ name: profile.fullName });
    }

    const user = await User.findById(userId);
    if (user) {
      const fromData = await UserFrom.findOne({ email: user.email });
      if (fromData && fromData.fullname) {
        return res.json({ name: fromData.fullname });
      }
    }

    // 3.
    res.json({ name: "User" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// GET MY PROFILE
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Try to find in the Profile collection
    let profile = await Profile.findOne({ userId });

    // 2. If not found or name is missing, check the UserFrom collection
    if (!profile || (!profile.fullname && !profile.fullName)) {
      const user = await User.findById(userId);
      if (user && user.email) {
        const fromData = await UserFrom.findOne({ email: user.email });
        if (fromData) {
          const plainProfile =
            profile && typeof profile.toObject === "function"
              ? profile.toObject()
              : {};
          const profile = {
            ...plainProfile,
            fullName: fromData.fullname || plainProfile.fullName,
            fullname: fromData.fullname || plainProfile.fullname,
          };
          return res.status(200).json({ success: true, profile: profileData });
        }
      }
    }

    // Ensure fields exist for existing Profile docs
    const result = profile ? profile.toObject() : {};
    if (result.fullName && !result.fullname) result.fullname = result.fullName;
    if (result.fullname && !result.fullName) result.fullName = result.fullname;

    res.status(200).json({
      success: true,
      profile: result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getMySimpleProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const users = await Profile.find();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfilePermissions = async (req, res) => {
  try {
    const { id } = req.params; // This `id` is the user's _id from the frontend
    const { viewer, editor, deletePermission } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: id }, // Assuming `id` from params is the `userId` in the Profile model
      {
        $set: {
          viewer,
          editor,
          deletePermission,
          isLocked: true, // Lock the permissions after saving
        },
      },
      { new: true },
    );

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile permissions updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error updating profile permissions:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing User ID" });
    }

    // Admin can always access any profile
    if (requesterRole === "admin") {
      // allowed
    } else if (requesterId.toString() === id.toString()) {
      // user viewing their own profile — allowed
    } else {
      // Check if this user has profile viewer/editor permission
      const Permission = require("../models/Permission");
      const perm = await Permission.findOne({ userId: requesterId });
      const hasAccess = perm?.profile?.viewer || perm?.profile?.editor;
      if (!hasAccess) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied." });
      }
    }

    let userProfile = await Profile.findOne({ userId: id });
    let nameFromUserFrom = null;
    let emailFromUserFrom = null;

    if (!userProfile || (!userProfile.fullName && !userProfile.personalEmail)) {
      const user = await User.findById(id);
      if (user && user.email) {
        const fromData = await UserFrom.findOne({ email: user.email });
        if (fromData) {
          nameFromUserFrom = fromData.fullname;
          emailFromUserFrom = fromData.email;
        }
      }
    }

    if (!userProfile && !nameFromUserFrom) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const responseProfile = {
      _id: userProfile?._id,
      userId: id,
      ...userProfile?.toObject(),
      fullName: userProfile?.fullName || nameFromUserFrom || "User",
      personalEmail:
        userProfile?.personalEmail || emailFromUserFrom || "No Email",
      fullname: userProfile?.fullname || nameFromUserFrom || "User",
    };

    res.status(200).json({ success: true, profile: responseProfile });
  } catch (error) {
    console.error("Error in getProfileById:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
//  admin or permitted user can update any profile
const saveProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    // Admin can always update
    if (requesterRole === "admin") {
      // allowed
    } else if (requesterId.toString() === id.toString()) {
      // user updating their own profile — allowed
    } else {
      // Check if this user has profile editor permission
      const Permission = require("../models/Permission");
      const perm = await Permission.findOne({ userId: requesterId });
      const hasAccess = perm?.profile?.editor;
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have editor permission.",
        });
      }
    }

    let imageBase64 = null;
    if (req.file) {
      imageBase64 = req.file.buffer.toString("base64");
    }

    let profile = await Profile.findOne({ userId: id });

    if (!profile) {
      profile = await Profile.create({
        ...req.body,
        userId: id,
        profileImage: imageBase64,
      });
    } else {
      profile = await Profile.findOneAndUpdate(
        { userId: id },
        {
          $set: {
            ...req.body,
            ...(imageBase64 && { profileImage: imageBase64 }),
          },
        },
        { new: true },
      );
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.log("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  saveProfile,
  getMyProfile,
  getAllProfiles,
  updateProfilePermissions,
  getUserName,
  getProfileById,
  getMySimpleProfile,
  saveProfileById,
};
