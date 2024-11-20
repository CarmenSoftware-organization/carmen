"use client"

import { PageHeader } from "@/components/page-header"
import { PageWrapper } from "@/components/page-wrapper"
import { SpotCheckSteps } from "./components/spot-check-steps"
import { SpotCheckNav } from "./components/spot-check-nav"

export default function SpotCheckPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Spot Check"
        description="Perform quick inventory spot checks to verify stock levels"
      />
      <div className="container py-6">
        <SpotCheckNav />
        <div className="mt-6">
          <SpotCheckSteps />
        </div>
      </div>
    </PageWrapper>
  )
}
