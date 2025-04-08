'use client'

import { NewSpotCheckForm } from "../components/new-spot-check-form"
import { useRouter } from "next/navigation"
import { SpotCheckDetails } from "../types"
import { UserProvider } from "@/lib/context/user-context"

export default function NewSpotCheckPage() {
  const router = useRouter()

  // This would typically come from your API or database
  const stores = [
    { id: "1", name: "Store 1" },
    { id: "2", name: "Store 2" },
  ]
  
  const departments = [
    { id: "1", name: "Grocery" },
    { id: "2", name: "Produce" },
    { id: "3", name: "Meat" },
  ]

  // Add counters data
  const counters = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Mike Johnson" },
  ]

  async function handleCreateSpotCheck(details: SpotCheckDetails) {
    try {
      // Here you would typically:
      // 1. Save the spot check details to your database
      // 2. Create the count session
      console.log("Creating spot check:", details)
      
      // Navigate to the active count page
      router.push(`/inventory-management/spot-check/active/${details.countId}`)
    } catch (error) {
      console.error("Failed to create spot check:", error)
    }
  }

  return (
    <UserProvider>
      <div className="h-[calc(100vh-4rem)] bg-background">
        <NewSpotCheckForm
          stores={stores}
          departments={departments}
          counters={counters}
          onSubmit={handleCreateSpotCheck}
        />
      </div>
    </UserProvider>
  )
}
