import mongoose from 'mongoose';
const { Schema } = mongoose;

const MonthlyPaymentSchema = new Schema({
  student_id: { type: String, required: true },
  month: { type: String, required: true },
  total_food_price: { type: Number, default: 0 },
  mess_service_charge: { type: Number, default: 0 },
  variable_expenses: { type: Number, default: 0 },
  total_amount: { type: Number, default: 0 },
  payment_status: { type: String, default: 'pending' },
  payment_date: { type: Date },
  payment_mode: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('MonthlyPayment', MonthlyPaymentSchema);
