from pymongo import MongoClient
from datetime import datetime
import bcrypt

# ---------------------------
# 1️⃣ Connect to MongoDB
# ---------------------------
uri = "mongodb+srv://awaisamjad:JuGujylg9ToHSI8x@cluster0.zmzyi.mongodb.net/"
client = MongoClient(uri)
db = client["HostelDB"]

# ---------------------------
# 2️⃣ Collections
# ---------------------------
admins_col = db["Admins"]
students_col = db["Students"]
fooditems_col = db["FoodItems"]
dailymeals_col = db["DailyMeals"]
monthlypayments_col = db["MonthlyPayments"]

# ---------------------------
# 3️⃣ Password hashing function
# ---------------------------
def hash_password(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed

# ---------------------------
# 4️⃣ Add Admin with hashed password
# ---------------------------
admin_demo = {
    "admin_id": "A001",
    "name": "Hostel Admin",
    "email": "admin@hostel.com",
    "password": hash_password("admin123"),  # hashed password
    "role": "admin",
    "created_at": datetime.now()
}
admins_col.insert_one(admin_demo)
print("Demo admin inserted with hashed password!")

# ---------------------------
# 5️⃣ Add Students with password
# ---------------------------
students_demo = [
    {
        "student_id": "S001",
        "name": "Ali Khan",
        "department": "CS",
        "session": "Spring 2025",
        "room_number": "101A",
        "contact": "03001234567",
        "email": "ali.khan@example.com",
        "password": hash_password("student123"),  # hashed password
        "active": True,
        "added_by": "A001",
        "modified_by": None,
        "created_at": datetime.now(),
        "updated_at": None
    },
    {
        "student_id": "S002",
        "name": "Sara Ahmed",
        "department": "EE",
        "session": "Spring 2025",
        "room_number": "102B",
        "contact": "03007654321",
        "email": "sara.ahmed@example.com",
        "password": hash_password("student456"),  # hashed password
        "active": True,
        "added_by": "A001",
        "modified_by": None,
        "created_at": datetime.now(),
        "updated_at": None
    }
]
students_col.insert_many(students_demo)
print("Demo students inserted with hashed passwords!")

# ---------------------------
# 6️⃣ Add Food Items
# ---------------------------
fooditems_demo = [
    {"food_id": "F001","name": "Chicken Biryani","category": "Lunch","price": 250,"added_by": "A001","created_at": datetime.now()},
    {"food_id": "F002","name": "Roti","category": "Dinner","price": 20,"added_by": "A001","created_at": datetime.now()},
    {"food_id": "F003","name": "Daal","category": "Lunch","price": 100,"added_by": "A001","created_at": datetime.now()}
]
fooditems_col.insert_many(fooditems_demo)
print("Demo food items inserted!")

# ---------------------------
# 7️⃣ Record Daily Meals
# ---------------------------
dailymeals_demo = [
    {"student_id": "S001","food_id": "F001","quantity": 2,"date": datetime(2025,10,26),"added_by": "A001","created_at": datetime.now()},
    {"student_id": "S001","food_id": "F002","quantity": 3,"date": datetime(2025,10,26),"added_by": "A001","created_at": datetime.now()},
    {"student_id": "S002","food_id": "F003","quantity": 1,"date": datetime(2025,10,26),"added_by": "A001","created_at": datetime.now()}
]
dailymeals_col.insert_many(dailymeals_demo)
print("Daily meals recorded!")

# ---------------------------
# 8️⃣ Generate Monthly Payment Example
# ---------------------------
# Sum daily meals price for S001
s001_meals = dailymeals_col.find({"student_id": "S001"})
total_food_price = 0
for m in s001_meals:
    food = fooditems_col.find_one({"food_id": m["food_id"]})
    total_food_price += food["price"] * m["quantity"]

monthly_payment_s001 = {
    "student_id": "S001",
    "month": "October 2025",
    "total_food_price": total_food_price,
    "mess_service_charge": 750,
    "variable_expenses": 500,
    "total_amount": total_food_price + 750 + 500,
    "payment_status": "Pending",
    "payment_date": None,
    "payment_mode": None,
    "added_by": "A001",
    "created_at": datetime.now(),
    "updated_at": None
}
monthlypayments_col.insert_one(monthly_payment_s001)
print("Monthly payment generated for S001:", monthly_payment_s001)
