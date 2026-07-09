const axios = require("axios");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Permission = require("../models/Permission");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// login with google libary..
const { OAuth2Client } = require("google-auth-library");
exports.createUser = async (req, res) => {
  try {
    const { email, password, permissions, groupId: bodyGroupId } = req.body;

    // Support optional admin-auth token on public register route.
    let requestGroupId = bodyGroupId || null;
    if (!req.user) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          req.user = decoded;
        } catch (_) {
          // ignore invalid token, continue with public registration
        }
      }
    }

    if (req.user?.role === "admin") {
      requestGroupId = req.user.groupId || null;
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userPayload = {
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "user",
    };

    if (requestGroupId) userPayload.groupId = requestGroupId;

    const newUser = await User.create(userPayload);

    const finalPermissions = {
      profile: {
        viewer: true,
        editor: permissions?.profile?.editor || false,
        deletePermission: permissions?.profile?.deletePermission || false,
      },
      attendance: {
        viewer: permissions?.attendance?.viewer || false,
        editor: permissions?.attendance?.editor || false,
      },
      task: {
        viewer: permissions?.task?.viewer || false,
        editor: permissions?.task?.editor || false,
      },
    };

    const userPermissions = await Permission.create({
      userId: newUser._id,
      groupId: newUser.groupId || requestGroupId || null,
      ...finalPermissions,
    });
    //  msg send to user permssion are apply
    const appliedPermissions = [];

    if (userPermissions.profile.viewer) {
      appliedPermissions.push("Profile Viewer");
    }

    if (userPermissions.profile.editor) {
      appliedPermissions.push("Profile Editor");
    }
    if (userPermissions.profile.deletePermission) {
      appliedPermissions.push("Profile Delete");
    }

    if (userPermissions.attendance.viewer) {
      appliedPermissions.push("Attendance Viewer");
    }

    if (userPermissions.attendance.editor) {
      appliedPermissions.push("Attendance Editor");
    }

    if (userPermissions.task.viewer) {
      appliedPermissions.push("Task Viewer");
    }

    if (userPermissions.task.editor) {
      appliedPermissions.push("Task Editor");
    }

    const permissionMessage = appliedPermissions.join(", ");

    res.status(201).json({
      message: `User ${newUser.email} registered successfully`,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      permissions: userPermissions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// datalist me permission btn click to apply
exports.getUserPermission = async (req, res) => {
  try {
    const { userId } = req.params;

    let permission = await Permission.findOne({
      userId,
      groupId: req.user.groupId,
    });

    if (!permission) {
      permission = await Permission.create({
        userId,
        profile: {
          viewer: true,
          editor: false,
          deletePermission: false,
        },
        attendance: {
          viewer: false,
          editor: false,
        },
        task: {
          viewer: false,
          editor: false,
        },
      });
    }

    res.json(permission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserPermission = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    const updatedPermission = await Permission.findOneAndUpdate(
      { userId, groupId: req.user.groupId },
      {
        profile: {
          viewer: true,
          editor: permissions?.profile?.editor || false,
          deletePermission: permissions?.profile?.deletePermission || false,
        },
        attendance: {
          viewer: permissions?.attendance?.viewer || false,
          editor: permissions?.attendance?.editor || false,
        },
        task: {
          viewer: permissions?.task?.viewer || false,
          editor: permissions?.task?.editor || false,
        },
      },
      { new: true, upsert: true },
    );

    res.json({
      message: "Permissions updated successfully",
      permissions: updatedPermission,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  LINKEDIN CALLBACK CONTROLLER
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const permissions = await Permission.findOne({ userId: user._id });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        groupId: user.groupId,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        groupId: user.groupId,
      },
      permissions,
    });
  } catch (error) {
    console.error("Login API error:", error);
    res.status(500).json({ message: error.message });
  }
};

///////////////////////////////////////////////////////////////////////////////////

// login with google api.......

exports.googleLogin = async (req, res) => {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    console.log("GOOGLE_CLIENT_ID at request time:", googleClientId);

    if (!googleClientId) {
      return res
        .status(500)
        .json({ message: "GOOGLE_CLIENT_ID not set in .env" });
    }

    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "No credential received" });
    }

    // Create client inside function so env var is loaded
    const client = new OAuth2Client(googleClientId);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const email = payload.email;
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email, name, role: "user" });
      await Permission.create({
        userId: user._id,
        profile: { viewer: true, editor: false, deletePermission: false },
        attendance: { viewer: false, editor: false },
        task: { viewer: false, editor: false },
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, groupId: user.groupId },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      token,
      user: { ...user.toObject(), groupId: user.groupId },
    });
  } catch (error) {
    console.error(" Google Login Error:", error.message);
    return res.status(500).json({
      message: "Google Login Failed",
      error: error.message,
    });
  }
};
//  LINKEDIN CALLBACK CONTROLLER
exports.redirectToLinkedIn = (req, res) => {
  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const REDIRECT_URI = `${process.env.BACKEND_URL}/auth/linkedin/callback`;

  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20profile%20email`;

  res.redirect(linkedinAuthUrl);
};

// 2. LinkedIn jab authorization code ke sath callback bhejega
exports.linkedinCallbackController = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code missing from LinkedIn.");
  }

  try {
    // Step A: Token exchange request direct to LinkedIn
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: `${process.env.BACKEND_URL}/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const accessToken = tokenResponse.data.access_token;

    // Step B: Direct userinfo call using the modern OpenID endpoint
    const userResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const linkedinUser = userResponse.data;
    const email = linkedinUser.email?.trim().toLowerCase();
    const name =
      linkedinUser.name ||
      `${linkedinUser.given_name} ${linkedinUser.family_name}`;

    // Step C: Database logic (Check or Save user)
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email, name, role: "user" });
      await Permission.create({
        userId: user._id,
        profile: { viewer: true, editor: false, deletePermission: false },
        attendance: { viewer: false, editor: false },
        task: { viewer: false, editor: false },
      });
    }

    // Step D: App JWT Token Generation
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        groupId: user.groupId,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Step E: Direct Redirect to Frontend Success Route
    res.redirect(
      `${process.env.FRONTEND_URL}/auth-success?token=${token}&role=${user.role}&userId=${user._id}&email=${user.email}`,
    );
  } catch (error) {
    console.error(
      "LinkedIn Main Auth Error:",
      error.response ? error.response.data : error.message,
    );
    res
      .status(500)
      .send("Internal Server Error: LinkedIn login pipeline failed.");
  }
};

// ... github to access login
//

exports.redirectToGitHub = (req, res) => {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const REDIRECT_URI = `${process.env.BACKEND_URL}/auth/github/callback`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user:email`;

  res.redirect(githubAuthUrl);
};

// Step 2: GitHub jab code bhejega, toh access_token aur user data nikalna
exports.githubCallbackController = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code missing from GitHub.");
  }

  try {
    //  Step A: Code ko GitHub Access Token ke sath exchange karein
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: `${process.env.BACKEND_URL}/auth/github/callback`,
      },
      { headers: { Accept: "application/json" } },
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).send("Failed to obtain access token from GitHub.");
    }

    //  Step B: Access Token se GitHub User Profile data mangwayein
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });

    const githubUser = userResponse.data;
    let email = githubUser.email;
    const name = githubUser.name || githubUser.login; // Agar naam na ho toh username utha lo

    // GitHub par kabhi-kabhi email 'null' aata hai agar user ne private rakha ho.
    // Uske liye ek alag email endpoint par request marni padti hai:
    if (!email) {
      const emailResponse = await axios.get(
        "https://api.github.com/user/emails",
        {
          headers: { Authorization: `token ${accessToken}` },
        },
      );
      // Primary email nikalenge jo verified ho
      const primaryEmailObj = emailResponse.data.find(
        (e) => e.primary && e.verified,
      );
      email = primaryEmailObj
        ? primaryEmailObj.email
        : emailResponse.data[0].email;
    }

    email = email.trim().toLowerCase();

    // 🅲 Step C: Database mein User Check ya Create karein
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email, name, role: "user" });

      // Default permissions generate karna compulsory hai aapke dashboard ke liye
      await Permission.create({
        userId: user._id,
        profile: { viewer: true, editor: false, deletePermission: false },
        attendance: { viewer: false, editor: false },
        task: { viewer: false, editor: false },
      });
    }

    //  Step D: Apni App ka Custom JWT Token banaein
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        groupId: user.groupId,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    //  Step E: User ko Frontend ke '/auth-success' route par redirect karein (LinkedIn ki tarah)
    res.redirect(
      `${process.env.FRONTEND_URL}/auth-success?token=${token}&role=${user.role}&userId=${user._id}&email=${user.email}`,
    );
  } catch (error) {
    console.error("GitHub Auth Error:", error.message);
    res.status(500).send("Internal Server Error: GitHub login failed.");
  }
};

//  NEECHE YEH NAYA LINKEDIN CONTROLLER ADD KAREIN:
// send otp fronted

// Use a Map for better memory management than a plain object
const otpStore = new Map();

exports.sendOtp = (req, res) => {
  const { phone } = req.body;
  if (!phone)
    return res
      .status(400)
      .json({ success: false, message: "Phone is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with an expiration time (e.g., 5 minutes)
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(phone, { otp, expiresAt });

  console.log("OTP for", phone, ":", otp);

  res.json({
    success: true,
    message: "OTP sent",
    devOtp: otp, //  only for testing
  });
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  const storedData = otpStore.get(phone);

  // 1. Check if OTP exists and is not expired
  if (
    !storedData ||
    storedData.otp !== otp ||
    Date.now() > storedData.expiresAt
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP" });
  }

  try {
    const otpEmail = `${phone}@otp.com`;

    // 2. Find or Create User
    let user = await User.findOne({ email: otpEmail });

    if (!user) {
      user = await User.create({
        phone,
        email: otpEmail,
        role: "user",
      });

      // 3. Create Permissions
      await Permission.create({
        userId: user._id,
        profile: { viewer: true, editor: false, deletePermission: false },
        attendance: { viewer: false, editor: false },
        task: { viewer: false, editor: false },
      });
    }

    // 4. Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role, groupId: user.groupId },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    // 5. Cleanup
    otpStore.delete(phone);

    return res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const permissions = await Permission.findOne({
      userId: req.user.id,
      groupId: req.user.groupId,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user,
      permissions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.authMiddleware = authMiddleware;
