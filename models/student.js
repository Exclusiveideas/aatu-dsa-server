import mongoose from "mongoose";
const { Schema } = mongoose;

const studentSchema = new Schema({
    fullName: { type: String, required: true },
    matric: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    faculty: {  type: String, required: true },
    programme: {  type: String, required: true },
    imageLink: { type: String, required: true },
    level: { type: String, required: true },
    gender: { type: String, required: true },
    password: { type: String, required: true },
    bedSpace: { type: Schema.Types.ObjectId, ref: 'BedSpace', default: null},// Linking to BedSpace model
    OyshiaSubmitted: { type: Boolean, required: true },
    OyshiaDetails: { 
        type: Map, 
        of: Schema.Types.Mixed,
        required: true 
    },
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

export default Student;