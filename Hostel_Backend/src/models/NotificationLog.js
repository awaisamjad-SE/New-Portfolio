import mongoose from 'mongoose';

const { Schema } = mongoose;

const NotificationLogSchema = new Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  text: { type: String },
  html: { type: Boolean, default: false },
  status: { type: String, enum: ['pending','sent','error'], default: 'pending' },
  response: { type: Schema.Types.Mixed },
  error: { type: String },
  meta: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updatedAt' } });

export default mongoose.model('NotificationLog', NotificationLogSchema);
