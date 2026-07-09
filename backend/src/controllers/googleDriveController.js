const { google } = require("googleapis");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const upload = multer({
  dest: "uploads/",
});

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI,
);

// ── Load saved tokens on server startup ──
const tokenPath = path.resolve(__dirname, "../drive-tokens.json");
if (fs.existsSync(tokenPath)) {
  try {
    const savedTokens = JSON.parse(fs.readFileSync(tokenPath));
    oAuth2Client.setCredentials(savedTokens);
    console.log("✅ Google Drive tokens loaded from file");
  } catch (err) {
    console.log("⚠️ Failed to load saved Drive tokens:", err.message);
  }
}

// Login
const googleAuth = (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });

  res.redirect(url);
};

// Callback
const googleCallback = async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    fs.writeFileSync(tokenPath, JSON.stringify(tokens));
    console.log("✅ Google Drive tokens saved to file");

    res.send("Google Drive Connected Successfully. You can close this tab.");
  } catch (err) {
    console.log(err);
    res.status(500).send("Authentication Failed");
  }
};

// Upload
const uploadDrive = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No File Uploaded",
      });
    }

    const drive = google.drive({
      version: "v3",
      auth: oAuth2Client,
    });

    const response = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      },
      fields: "id,name",
    });

    fs.unlinkSync(req.file.path);

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    res.json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      driveLink: `https://drive.google.com/file/d/${response.data.id}/view`,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Upload Failed",
    });
  }
};
console.log("DRIVE REDIRECT URI:", process.env.GOOGLE_DRIVE_REDIRECT_URI);

module.exports = {
  upload,
  googleAuth,
  googleCallback,
  uploadDrive,
};
