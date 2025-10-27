import mongoose from 'mongoose';
const { Schema } = mongoose;

const StudentSchema = new Schema({
  student_id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  department: { type: String },
  session: { type: String },
  room_number: { type: String },
  contact: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  active: { type: Boolean, default: true },
  added_by: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Student', StudentSchema);
