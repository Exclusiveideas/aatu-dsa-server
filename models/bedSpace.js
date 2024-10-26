import mongoose from 'mongoose';
const { Schema } = mongoose;

const bedSpaceSchema = new Schema({
  bedPos: {
    type: String,
    required: true,
    enum: ['top bunk', 'down bunk']
  },
  bunkType: {
    type: String,
    required: true,
    enum: ['bunk A', 'bunk B']
  },
  roomNumber: {
    type: String,
    required: true,
    enum: ['room 1', 'room 2', 'room 3']
  },
  blockNumber: {
    type: Number,
    required: true
  },
  hostelName: {
    type: String,
    required: true
  },
  assignedStudent: {
    type: Schema.Types.ObjectId,
    ref: 'Student', // Referencing the Student model
    required: true
  }
}, { timestamps: true });

const BedSpace = mongoose.model('BedSpace', bedSpaceSchema);

export default BedSpace;
