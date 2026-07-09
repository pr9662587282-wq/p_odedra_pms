const User = require("../models/User"); // login user (email, password)
const UserFrom = require('../models/UserFormData'); // profile data
const Permission = require("../models/Permission");
//  user from submit api and admin penal dalalist and all crud oparation api

const MakeFormInsertUser = async (req, res) => {
  try {
    const {
      email,
      fullname,
      joiningDate,
      bDate,
      gender,
      address,
      city,
      number,
    } = req.body;

    const newUser = new UserFrom({
      email,
      fullname,
      joiningDate,
      bDate,
      gender,
      address,
      city,
      number,
    });

    await newUser.save();

    res.json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
// show data in admin penal api
/*const Datalist = async (req, res) => {
  try {
    const ShowDataList = await UserFrom.find(); // Fetch all UserFrom data if permission is granted
    res.json(ShowDataList);
  } catch (err) {
    res.status(500).send(err.message);
  }
};*/
const getUserNames = async (req, res) => {
  try {
    // 1. Fetch all Auth Users
    const authUsers = await User.find({}, "email role");

    // 2. Fetch all Profile Data (for Name and Phone)
    const profiles = await UserFrom.find({}, "email fullname number");

    // 3. Fetch all Permission Data
    const permissions = await Permission.find();

    // 4. Merge everything using Auth User as the source of truth
    const results = authUsers.map((u) => {
      const profile = profiles.find((p) => p.email === u.email);
      const perm = permissions.find(
        (p) => p.userId && p.userId.toString() === u._id.toString(),
      );

      return {
        _id: u._id, // User ID is the identifier for all permission updates
        email: u.email,
        fullName: profile ? profile.fullname : "No Name", // Changed 'name' to 'fullName' to match frontend
        phone: profile ? profile.number : "No Phone",
        // Profile Tab Permissions
        viewer: perm ? perm.viewer : false,
        editor: perm ? perm.editor : false,
        deletePermission: perm ? perm.deletePermission : false,
        isLocked: perm ? perm.isLocked : false,
        // Attendance Tab Permissions
        attendanceView: perm ? perm.attendanceView : false,
        attendanceEdit: perm ? perm.attendanceEdit : false,
        attendanceLocked: perm ? perm.attendanceLocked : false,
        // Task Tab Permissions
        TaskView: perm ? perm.TaskView : false,
        TaskEdit: perm ? perm.TaskEdit : false,
        taskLocked: perm ? perm.taskLocked : false,
      };
    });

    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Add this function to handle GET /profile/:id
const getProfileById = async (req, res) => {
  try {
    // Find the Auth User first to get the email
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the profile details using the email
    const profile = await UserFrom.findOne({ email: user.email });
    res.json({ profile });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// peamsstion name show
/*const getNameDatalist = async (req, res) => {
  try {
    const users = await User.find({}, "fullname");
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
*/
// delete data hard delete

const DeleteUser = async (req, res) => {
  try {
    let userId = req.params.id || "";
    if (userId.startsWith(":")) {
      userId = userId.slice(1);
    }

    await UserFrom.findByIdAndDelete(userId);
    res.json({ msg: "delete data" });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
// update data

const UpdateUser = async (req, res) => {
  try {
    let userId = req.params.id || "";
    if (userId.startsWith(":")) {
      userId = userId.slice(1);
    }

    const updated = await UserFrom.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    res.json({
      message: "Updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// show data list admin penal

module.exports = {
  MakeFormInsertUser,

  DeleteUser,
  UpdateUser, // Export UpdateUser
  getUserNames,
  getProfileById, // Export this new function
};
