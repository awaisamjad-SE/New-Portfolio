import mongoose from 'mongoose';
const { Schema } = mongoose;

const FoodItemSchema = new Schema({
  food_id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  category: { type: String },
  price: { type: Number, default: 0 },
  added_by: { type: String },
}, { timestamps: { createdAt: 'created_at' } });

export default mongoose.model('FoodItem', FoodItemSchema);
