
import mongoose, {Schema} from "mongoose";


const subjectSchema = new Schema({
  name: { type: String, required: true,
  code: { type: String, required: true, unique: true },
  credits: { type: Number, required: true },
    title: {
        type: String,
        required: true
    },});

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
