import React, { useEffect, useState } from 'react'
import ChartCard from '../components/ChartCard'
import AddMeal from '../components/AddMeal'
import api from '../services/api'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default function Dashboard(){
  const [kpis, setKpis] = useState({})
  const [revenueData, setRevenueData] = useState(null)
  const [mealsData, setMealsData] = useState(null)
  const [popularData, setPopularData] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      try{
        const [summaryRes, paymentsSummaryRes] = await Promise.all([
          api.dailyMealsSummary(new Date().toISOString().slice(0,7)),
          api.paymentsSummary()
        ])
        setKpis({ totalStudents: 0, activeMealsToday: 0, pendingPayments: 0, monthlyRevenue: paymentsSummaryRes.data?.total || 0 })
        // placeholders for charts
        setRevenueData({labels:['Jan','Feb'], datasets:[{label:'Revenue',data:[10,20],backgroundColor:'rgba(13,110,253,0.6)'}]})
        setMealsData({labels:['Mon','Tue'], datasets:[{label:'Meals',data:[4,6],backgroundColor:'rgba(40,167,69,0.6)'}]})
        setPopularData({labels:['Burger','Rice'], datasets:[{label:'Popular',data:[5,3],backgroundColor:['#0d6efd','#198754']} ]})
      }catch(e){ console.error(e) }
    }
    load()
  },[])

  return (
    <div>
      <div className="row mb-3">
        <div className="col-md-3"><div className="card p-3"><h6>Total students</h6><h3>{kpis.totalStudents}</h3></div></div>
        <div className="col-md-3"><div className="card p-3"><h6>Active meals today</h6><h3>{kpis.activeMealsToday}</h3></div></div>
        <div className="col-md-3"><div className="card p-3"><h6>Pending payments</h6><h3>{kpis.pendingPayments}</h3></div></div>
        <div className="col-md-3"><div className="card p-3"><h6>Monthly revenue</h6><h3>{kpis.monthlyRevenue}</h3></div></div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <ChartCard title="Monthly Revenue">
            {revenueData ? <Line data={revenueData} /> : <p>Loading...</p>}
          </ChartCard>
          <ChartCard title="Meals per day">
            {mealsData ? <Bar data={mealsData} /> : <p>Loading...</p>}
          </ChartCard>
        </div>
        <div className="col-lg-4">
          <ChartCard title="Popular Foods">
            {popularData ? <Pie data={popularData} /> : <p>Loading...</p>}
          </ChartCard>
          <AddMeal />
        </div>
      </div>
    </div>
  )
}
