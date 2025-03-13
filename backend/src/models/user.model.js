import mongoose, { Schema } from 'mongoose';

export const ROLES = {
  LECTURER: 'Lecturer',
  STUDENT: 'Student',
  ADMIN: 'Admin',
};

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [ROLES.LECTURER, ROLES.STUDENT, ROLES.ADMIN],
      required: true,
    },
    refreshToken: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
