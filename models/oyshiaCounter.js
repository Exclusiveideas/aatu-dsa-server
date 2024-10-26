import mongoose from "mongoose";
const { Schema } = mongoose;

const oyshiaCounterSchema = new Schema({
    count: { type: Number, required: true, default: 0 }
});

const OyshiaCounter = mongoose.model('OyshiaCounter', oyshiaCounterSchema);

export default OyshiaCounter;