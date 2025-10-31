import express from "express";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import foodItemRoutes from "./routes/foodItemRoutes.js";
import dailyMealRoutes from "./routes/dailyMealRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// capture rawBody for debugging JSON parse errors
app.use(express.json({
	verify: (req, res, buf, encoding) => {
		try {
			req.rawBody = buf.toString(encoding || 'utf8');
		} catch (e) {
			req.rawBody = '';
		}
	}
}));

app.use("/admin", adminRoutes);
app.use("/students", studentRoutes);
app.use("/fooditems", foodItemRoutes);
app.use("/dailymeals", dailyMealRoutes);
app.use("/payments", paymentRoutes);
app.use('/notifications', notificationRoutes);

// health
app.get('/', (req, res) => res.json({ success: true, message: 'Hostel API is running' }));

app.use(errorHandler);

export default app;
