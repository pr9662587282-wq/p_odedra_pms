const express = require("express");
const router = express.Router();

const {
  MakeFormInsertUser,
  //Datalist,
  DeleteUser,

  UpdateUser,
  getUserNames,
  //getUserByEmail,
  //updateUserByEmail,
} = require("../controllers/userFormController");
const { authMiddleware } = require("../controllers/userController"); // Import authMiddleware

router.post("/fromuser", MakeFormInsertUser);

//router.get("/Datalist", Datalist);
router.get("/user-names", getUserNames);
//router.get("/getNameDatalist", getNameDatalist);
router.delete("/DeleteUser/:id", DeleteUser);
router.put("/UpdateUser/:id", UpdateUser);

//router.get("/user/:email", getUserByEmail);

//router.put("/user/:email", updateUserByEmail);
//router.post("/login", login);
//router.get("/profile", authMiddleware, getProfile);

module.exports = router;
