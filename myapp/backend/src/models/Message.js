const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      },
    ],
    imageUrl: { type: String, default: null },
  },

  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
