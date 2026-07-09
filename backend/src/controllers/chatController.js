/*const User = require("../models/User");
const Message = require("../models/Message");
const Profile = require("../models/Profile");
const UserFrom = require('../models/UserFormData');
const cloudinary = require("../config/cloudinary"); // Import Cloudinary config
const streamifier = require("streamifier"); // For streaming buffers to Cloudinary
const mongoose = require("mongoose");

const getUsersByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    // Safe extraction of current user ID (checking both ._id and .id)
    const userRole = req.user?.role || "user";

    // Security: Only admins can view 'all' users
    const effectiveGroupId =
      groupId === "all" && userRole !== "admin" ? "null" : groupId;

    const rawId = req.user?._id || req.user?.id || req.headers["user-id"]; // Get ID from auth or header
    // Ensure currentUserId is an ObjectId if valid, otherwise null.
    const currentUserId =
      rawId &&
      rawId !== "null" &&
      rawId !== "undefined" &&
      mongoose.Types.ObjectId.isValid(rawId)
        ? new mongoose.Types.ObjectId(rawId)
        : null;

    let orConditions = [];

    let chatPartnerIds = [];
    if (currentUserId) {
      // Find IDs of users who have chatted with the current user
      const [distinctSenders, distinctReceivers] = await Promise.all([
        Message.distinct("senderId", { receiverId: currentUserId }).catch(
          () => [],
        ),
        Message.distinct("receiverId", { senderId: currentUserId }).catch(
          () => [],
        ),
      ]);

      chatPartnerIds = [
        ...new Set([...distinctSenders, ...distinctReceivers]),
      ].filter((id) => id && mongoose.Types.ObjectId.isValid(id)); // Filter out invalid IDs, keep as ObjectIds
    }

    if (effectiveGroupId === "all") {
      // Return everyone
    } else if (
      effectiveGroupId === "null" ||
      effectiveGroupId === "undefined" ||
      !effectiveGroupId
    ) {
      orConditions.push({ groupId: null });
      orConditions.push({ groupId: { $exists: false } });
      orConditions.push({ groupId: "" });
    } else {
      orConditions.push({ groupId: effectiveGroupId });
    }

    // Always include admins in the list so users can reach support/management
    orConditions.push({ role: "admin" });

    // Discovery: Include previous chat partners so existing conversations remain visible
    if (chatPartnerIds.length > 0) {
      orConditions.push({
        _id: {
          $in: chatPartnerIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      }); // User model uses ObjectId for _id
    }

    // Final Query construction
    const finalQuery =
      effectiveGroupId === "all" || orConditions.length === 0
        ? {}
        : { $or: orConditions };

    const authUsers = await User.find(finalQuery).select("-password").lean();

    const userIds = authUsers.map((u) => u._id);
    const emails = authUsers.map((u) => u.email);

    // Fetch names from Profile and UserFrom (handling cases where one might not exist)
    const profiles = Profile
      ? await Profile.find({ userId: { $in: userIds } }).lean()
      : [];
    const userFroms = await UserFrom.find({ email: { $in: emails } }).lean();

    // Optimization: Fetch all last messages for these users in one aggregation
    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: currentUserId, receiverId: { $in: userIds } },
            { receiverId: currentUserId, senderId: { $in: userIds } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", currentUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          msg: { $first: "$$ROOT" },
        },
      },
    ]);

    const mergedUsers = authUsers.map((u) => {
      const profile = profiles.find(
        (p) => p.userId && p.userId.toString() === u._id.toString(),
      );
      const fromData = userFroms.find((f) => f.email === u.email);

      // Find last message from our pre-fetched aggregation results
      const lastMsgData = lastMessages.find(
        (m) => m._id.toString() === u._id.toString(),
      );
      const lastMsg = lastMsgData ? lastMsgData.msg : null;

      return {
        ...u,
        fullname:
          profile?.fullName ||
          profile?.fullname ||
          fromData?.fullname ||
          u.email ||
          "Team Member",
        profileImage: profile?.profileImage || null,
        lastMessage: lastMsg
          ? {
              text: lastMsg.message,
              senderId: lastMsg.senderId,
              createdAt: lastMsg.createdAt,
            }
          : null,
      };
    });

    // Sort users by their last message time (WhatsApp style)
    mergedUsers.sort((a, b) => {
      const dateA = a.lastMessage
        ? new Date(a.lastMessage.createdAt)
        : new Date(0);
      const dateB = b.lastMessage
        ? new Date(b.lastMessage.createdAt)
        : new Date(0);
      return dateB - dateA;
    });

    res.json(mergedUsers);
  } catch (error) {
    console.error("Error in getUsersByGroup:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    // Use ID from auth if possible, fallback to body
    const actualSenderId = req.user?._id || req.user?.id || senderId;

    if (
      !mongoose.Types.ObjectId.isValid(actualSenderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid sender or receiver ID format" });
    }

    if (!message?.trim() && !req.file) {
      return res.status(400).json({ message: "Message or image required" });
    }

    let imageUrl = null;

    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "chat-images", // Specify a folder for chat images
              public_id: `chat_${actualSenderId}_${Date.now()}`, // Unique public ID
              resource_type: "auto", // Automatically detect file type
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
        imageUrl = result.secure_url; // Get the secure URL from Cloudinary
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res
          .status(500)
          .json({ message: "Error uploading image to cloud storage" });
      }
    }

    const msg = await Message.create({
      senderId: new mongoose.Types.ObjectId(actualSenderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      message: message || "",
      imageUrl,
    });

    // REAL-TIME: Emit to both receiver and sender (to sync multiple tabs)
    if (req.io && msg) {
      // Emit only to specific user rooms
      req.io.to(receiverId.toString()).emit("receive_message", msg);
      // Emit back to sender's room to sync history across other open tabs
      req.io.to(actualSenderId.toString()).emit("receive_message", msg);
    }

    res.json(msg);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const rawCurrentId = req.user?._id || req.user?.id;
    const rawReceiverId = req.params.receiverId;

    if (
      !rawCurrentId ||
      !mongoose.Types.ObjectId.isValid(rawCurrentId) ||
      !mongoose.Types.ObjectId.isValid(rawReceiverId)
    ) {
      return res.status(400).json({ message: "Invalid user or receiver ID" });
    }

    const currentUserId = new mongoose.Types.ObjectId(rawCurrentId);
    const receiverId = new mongoose.Types.ObjectId(rawReceiverId);

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: receiverId },
        { senderId: receiverId, receiverId: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  getUsersByGroup,
  sendMessage,
  getMessages,
};
*/

const User = require("../models/User");
const Message = require("../models/Message");
const Profile = require("../models/Profile");
const UserFrom = require('../models/UserFormData');
const cloudinary = require("../config/cloudinary"); // Import Cloudinary config
const streamifier = require("streamifier"); // For streaming buffers to Cloudinary
const mongoose = require("mongoose");
const { messaging } = require("../config/firebaseAdmin"); // <-- ADDED

const getUsersByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userRole = req.user?.role || "user";

    const effectiveGroupId =
      groupId === "all" && userRole !== "admin" ? "null" : groupId;

    const rawId = req.user?._id || req.user?.id || req.headers["user-id"];
    const currentUserId =
      rawId &&
      rawId !== "null" &&
      rawId !== "undefined" &&
      mongoose.Types.ObjectId.isValid(rawId)
        ? new mongoose.Types.ObjectId(rawId)
        : null;

    let orConditions = [];

    let chatPartnerIds = [];
    if (currentUserId) {
      const [distinctSenders, distinctReceivers] = await Promise.all([
        Message.distinct("senderId", { receiverId: currentUserId }).catch(
          () => [],
        ),
        Message.distinct("receiverId", { senderId: currentUserId }).catch(
          () => [],
        ),
      ]);

      chatPartnerIds = [
        ...new Set([...distinctSenders, ...distinctReceivers]),
      ].filter((id) => id && mongoose.Types.ObjectId.isValid(id));
    }

    if (effectiveGroupId === "all") {
      // Return everyone
    } else if (
      effectiveGroupId === "null" ||
      effectiveGroupId === "undefined" ||
      !effectiveGroupId
    ) {
      orConditions.push({ groupId: null });
      orConditions.push({ groupId: { $exists: false } });
      orConditions.push({ groupId: "" });
    } else {
      orConditions.push({ groupId: effectiveGroupId });
    }

    orConditions.push({ role: "admin" });

    if (chatPartnerIds.length > 0) {
      orConditions.push({
        _id: {
          $in: chatPartnerIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      });
    }

    const finalQuery =
      effectiveGroupId === "all" || orConditions.length === 0
        ? {}
        : { $or: orConditions };

    const authUsers = await User.find(finalQuery).select("-password").lean();

    const userIds = authUsers.map((u) => u._id);
    const emails = authUsers.map((u) => u.email);

    const profiles = Profile
      ? await Profile.find({ userId: { $in: userIds } }).lean()
      : [];
    const userFroms = await UserFrom.find({ email: { $in: emails } }).lean();

    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: currentUserId, receiverId: { $in: userIds } },
            { receiverId: currentUserId, senderId: { $in: userIds } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", currentUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          msg: { $first: "$$ROOT" },
        },
      },
    ]);

    const mergedUsers = authUsers.map((u) => {
      const profile = profiles.find(
        (p) => p.userId && p.userId.toString() === u._id.toString(),
      );
      const fromData = userFroms.find((f) => f.email === u.email);

      const lastMsgData = lastMessages.find(
        (m) => m._id.toString() === u._id.toString(),
      );
      const lastMsg = lastMsgData ? lastMsgData.msg : null;

      return {
        ...u,
        fullname:
          profile?.fullName ||
          profile?.fullname ||
          fromData?.fullname ||
          u.email ||
          "Team Member",
        profileImage: profile?.profileImage || null,
        lastMessage: lastMsg
          ? {
              text: lastMsg.message,
              senderId: lastMsg.senderId,
              createdAt: lastMsg.createdAt,
            }
          : null,
      };
    });

    mergedUsers.sort((a, b) => {
      const dateA = a.lastMessage
        ? new Date(a.lastMessage.createdAt)
        : new Date(0);
      const dateB = b.lastMessage
        ? new Date(b.lastMessage.createdAt)
        : new Date(0);
      return dateB - dateA;
    });

    res.json(mergedUsers);
  } catch (error) {
    console.error("Error in getUsersByGroup:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    const actualSenderId = req.user?._id || req.user?.id || senderId;

    if (
      !mongoose.Types.ObjectId.isValid(actualSenderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid sender or receiver ID format" });
    }

    if (!message?.trim() && !req.file) {
      return res.status(400).json({ message: "Message or image required" });
    }

    let imageUrl = null;

    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "chat-images",
              public_id: `chat_${actualSenderId}_${Date.now()}`,
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res
          .status(500)
          .json({ message: "Error uploading image to cloud storage" });
      }
    }

    const msg = await Message.create({
      senderId: new mongoose.Types.ObjectId(actualSenderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      message: message || "",
      imageUrl,
    });

    // REAL-TIME: Emit to both receiver and sender (to sync multiple tabs)
    // REAL-TIME: Emit to both receiver and sender (to sync multiple tabs)
    if (req.io && msg) {
      req.io.to(receiverId.toString()).emit("receive_message", msg);
      req.io.to(actualSenderId.toString()).emit("receive_message", msg);
    }

    // ---------------- FCM PUSH NOTIFICATION BLOCK ----------------
    try {
      const receiverUser = await User.findById(receiverId).select("fcmTokens");
      console.log("🔥 Receiver tokens:", receiverUser?.fcmTokens);

      if (receiverUser?.fcmTokens?.length) {
        const senderUser =
          await User.findById(actualSenderId).select("fullname email");
        const payload = {
          notification: {
            title: senderUser?.fullname || senderUser?.email || "New message",
            body: message?.trim() ? message : "📷 Sent an image",
          },
          data: {
            senderId: actualSenderId.toString(),
            click_action: "OPEN_CHAT",
            url: `/chat?userId=${actualSenderId}`,
          },
          tokens: receiverUser.fcmTokens,
        };

        const response = await messaging.sendEachForMulticast(payload);
        console.log("🔥 FCM response:", JSON.stringify(response)); // ✅ ab try ke andar hai

        const invalidTokens = [];
        response.responses.forEach((r, idx) => {
          if (!r.success) invalidTokens.push(receiverUser.fcmTokens[idx]);
        });
        if (invalidTokens.length) {
          await User.findByIdAndUpdate(receiverId, {
            $pull: { fcmTokens: { $in: invalidTokens } },
          });
        }
      }
    } catch (notifErr) {
      console.error("FCM push error:", notifErr);
    }
    // ---------------------------------------------------------------------

    res.json(msg);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const rawCurrentId = req.user?._id || req.user?.id;
    const rawReceiverId = req.params.receiverId;

    if (
      !rawCurrentId ||
      !mongoose.Types.ObjectId.isValid(rawCurrentId) ||
      !mongoose.Types.ObjectId.isValid(rawReceiverId)
    ) {
      return res.status(400).json({ message: "Invalid user or receiver ID" });
    }

    const currentUserId = new mongoose.Types.ObjectId(rawCurrentId);
    const receiverId = new mongoose.Types.ObjectId(rawReceiverId);

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: receiverId },
        { senderId: receiverId, receiverId: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUsersByGroup,
  sendMessage,
  getMessages,
};
