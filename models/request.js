import mongoose from "mongoose";

const requestSchema = mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senior: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  housing: { type: mongoose.Schema.Types.ObjectId, ref: 'housing', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'refused'], 
    default: 'pending' 
  }
}, { 
  timestamps: true 
});

const Request = mongoose.model('request', requestSchema);
export default Request