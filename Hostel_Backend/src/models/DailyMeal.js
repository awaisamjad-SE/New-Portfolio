import mongoose from 'mongoose';
const { Schema } = mongoose;

const DailyMealSchema = new Schema({
  student_id: { type: String, required: true },
  food_id: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  date: { type: Date, default: Date.now },
  added_by: { type: String },
}, { timestamps: { createdAt: 'created_at' } });

export default mongoose.model('DailyMeal', DailyMealSchema);
