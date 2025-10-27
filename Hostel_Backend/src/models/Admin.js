import mongoose from 'mongoose';
const { Schema } = mongoose;

const AdminSchema = new Schema({
  admin_id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Admin', AdminSchema);
