import  EnvironmentDashboard  from './environment-dashboard'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Environmental Dashboard</h1>
      </div>
      <EnvironmentDashboard />
    </div>
  )
}