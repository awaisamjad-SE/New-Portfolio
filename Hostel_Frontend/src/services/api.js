/*
  API service mapping all 38 endpoints described in the project brief.
  Uses VITE_API_BASE (default http://localhost:3000) as baseURL.
  Exports functions for each endpoint and token setters.
*/
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

const instance = axios.create({ baseURL: API_BASE, timeout: 15000 })

// token holders
let adminToken = null
let studentToken = null

export function setToken(token){
  adminToken = token
  instance.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined
}

export function setStudentToken(token){
  studentToken = token
  // to call student-scoped endpoints you can use setStudentToken plus a header override
  // callers can pass explicit headers when needed
}

instance.interceptors.response.use(
  res => res,
  err => {
    // global error handling can be added here
    return Promise.reject(err)
  }
)

// --- Admin endpoints ---
export const adminLogin = (data) => instance.post('/admin/login', data)
export const adminCreate = (data) => instance.post('/admin/create', data)
export const adminGet = (params) => instance.get('/admin/get', { params })
export const adminUpdate = (adminId, data) => instance.put(`/admin/update/${adminId}`, data)
export const adminDelete = (adminId) => instance.delete(`/admin/delete/${adminId}`)

// --- Students ---
export const studentCreate = (data) => instance.post('/students/create', data)
export const studentLogin = (data) => instance.post('/students/login', data)
export const studentsGet = (params) => instance.get('/students/get', { params })
export const studentGetById = (student_id) => instance.get(`/students/get/${student_id}`)
export const studentUpdate = (studentMongoId, data) => instance.put(`/students/update/${studentMongoId}`, data)
export const studentPatchStatus = (studentMongoId, data) => instance.patch(`/students/status/${studentMongoId}`, data)
export const studentDelete = (studentMongoId) => instance.delete(`/students/delete/${studentMongoId}`)

// --- FoodItems ---
export const foodCreate = (data) => instance.post('/fooditems/create', data)
export const foodGet = (params) => instance.get('/fooditems/get', { params })
export const foodUpdate = (foodId, data) => instance.put(`/fooditems/update/${foodId}`, data)
export const foodDelete = (foodId) => instance.delete(`/fooditems/delete/${foodId}`)

// --- DailyMeals ---
export const addDailyMeal = (data) => instance.post('/dailymeals/add', data)
export const dailyMealsGet = (params) => instance.get('/dailymeals/get', { params })
export const dailyMealsGetByStudent = (student_id) => instance.get(`/dailymeals/get/${student_id}`)
export const dailyMealUpdate = (dailyMealId, data) => instance.put(`/dailymeals/update/${dailyMealId}`, data)
export const dailyMealDelete = (dailyMealId) => instance.delete(`/dailymeals/delete/${dailyMealId}`)
export const dailyMealsSummary = (yearMonth) => instance.get(`/dailymeals/summary/${yearMonth}`)
export const dailyMealsPopular = (yearMonth) => instance.get(`/dailymeals/popular/${yearMonth}`)
export const dailyMealsSendMonthly = (data) => instance.post('/dailymeals/send/monthly', data)
export const dailyMealsSendWeekly = (data) => instance.post('/dailymeals/send/weekly', data)

// --- Payments ---
export const paymentsGenerate = (data) => instance.post('/payments/generate', data)
export const paymentsGenerateAll = (data) => instance.post('/payments/generate/all', data)
export const paymentsGet = (params) => instance.get('/payments/get', { params })
export const paymentsGetByStudent = (student_id) => instance.get(`/payments/get/${student_id}`)
export const paymentsReport = (student_id, yearMonth) => instance.get(`/payments/report/${student_id}/${yearMonth}`)
export const paymentsTrend = (student_id) => instance.get(`/payments/trend/${student_id}`)
export const paymentsSummary = () => instance.get('/payments/summary')
export const paymentsPay = (paymentId, data) => instance.patch(`/payments/pay/${paymentId}`, data)
export const paymentsTop = (yearMonth) => instance.get(`/payments/top/${yearMonth}`)
export const paymentsUpdate = (paymentId, data) => instance.put(`/payments/update/${paymentId}`, data)

// --- Notifications ---
export const notificationsLogs = (params) => instance.get('/notifications/logs', { params })
export const notificationLogById = (logId) => instance.get(`/notifications/logs/${logId}`)

// Default export convenience object (also named exports available above)
const api = {
  // admin
  adminLogin, adminCreate, adminGet, adminUpdate, adminDelete,
  // students
  studentCreate, studentLogin, studentsGet, studentGetById, studentUpdate, studentPatchStatus, studentDelete,
  // food
  foodCreate, foodGet, foodUpdate, foodDelete,
  // daily meals
  addDailyMeal, dailyMealsGet, dailyMealsGetByStudent, dailyMealUpdate, dailyMealDelete,
  dailyMealsSummary, dailyMealsPopular, dailyMealsSendMonthly, dailyMealsSendWeekly,
  // payments
  paymentsGenerate, paymentsGenerateAll, paymentsGet, paymentsGetByStudent, paymentsReport, paymentsTrend,
  paymentsSummary, paymentsPay, paymentsTop, paymentsUpdate,
  // notifications
  notificationsLogs, notificationLogById,
  // token setters
  setToken, setStudentToken,
}

export default api
