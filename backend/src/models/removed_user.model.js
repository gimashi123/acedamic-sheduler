import mongoose, { Schema } from 'mongoose';
import { ROLES } from './user.model.js';

const removedUserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: [ROLES.LECTURER, ROLES.STUDENT, ROLES.ADMIN],
      required: true,
    },
    removedAt: {
      type: Date,
      default: Date.now,
    },
    removedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    reason: {
      type: String,
      default: 'Not specified',
    }
  },
  { timestamps: true },
);

const RemovedUser = mongoose.model('RemovedUser', removedUserSchema);

export default RemovedUser; 