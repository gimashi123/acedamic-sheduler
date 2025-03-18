import mongoose, {Schema} from "mongoose";

const subjectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    }
}
);

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;