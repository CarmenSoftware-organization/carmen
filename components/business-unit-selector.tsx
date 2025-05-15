"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Mock data for business units
const businessUnits = [
  { id: "1", name: "Grand Hotel - Main Kitchen", location: "New York" },
  { id: "2", name: "Grand Hotel - Restaurant", location: "New York" },
  { id: "3", name: "Seaside Resort - Main Kitchen", location: "Miami" },
  { id: "4", name: "Seaside Resort - Pool Bar", location: "Miami" },
  { id: "5", name: "Mountain Lodge - Restaurant", location: "Denver" },
]

export function BusinessUnitSelector() {
  const router = useRouter()
  const [selectedUnit, setSelectedUnit] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate loading and redirect
    setTimeout(() => {
      router.push("/dashboard")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Select Business Unit</CardTitle>
        <CardDescription>Choose the business unit you want to work with</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <RadioGroup value={selectedUnit} onValueChange={setSelectedUnit} className="space-y-3">
            {businessUnits.map((unit) => (
              <div
                key={unit.id}
                className={`flex items-center space-x-2 rounded-md border p-3 ${
                  selectedUnit === unit.id ? "border-primary bg-primary/5" : ""
                }`}
              >
                <RadioGroupItem value={unit.id} id={`unit-${unit.id}`} />
                <Label htmlFor={`unit-${unit.id}`} className="flex flex-col cursor-pointer w-full">
                  <span className="font-medium">{unit.name}</span>
                  <span className="text-sm text-muted-foreground">{unit.location}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Button type="submit" className="w-full mt-6" disabled={!selectedUnit || isLoading}>
            {isLoading ? "Loading..." : "Continue"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={() => router.back()} className="mt-2">
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  )
}
