import mongoose, { Schema } from 'mongoose';

export const REQUEST_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const requestSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ['Lecturer', 'Student', 'Admin'],
      required: true,
    },

    //Optional field for extra information
    additionalDetails: {
      type: String,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isEmailSent: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        REQUEST_STATUS.PENDING,
        REQUEST_STATUS.APPROVED,
        REQUEST_STATUS.REJECTED,
      ],
      default: REQUEST_STATUS.PENDING,
    },
  },
  { timestamps: true },
);

const UserRequest = mongoose.model('UserRequest', requestSchema);

export default UserRequest;
