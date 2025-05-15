"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, CornerDownLeft } from "lucide-react"
import { ArrowRightIcon } from "@radix-ui/react-icons"

export default function PRConfirmationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prId = params.id
  const action = searchParams.get("action")

  const getIcon = () => {
    switch (action) {
      case "approve":
        return <CheckCircle2 className="h-12 w-12 text-primary" />
      case "reject":
        return <XCircle className="h-12 w-12 text-destructive" />
      case "return":
        return <CornerDownLeft className="h-12 w-12 text-amber-500" />
      default:
        return <CheckCircle2 className="h-12 w-12 text-primary" />
    }
  }

  const getTitle = () => {
    switch (action) {
      case "approve":
        return "Purchase Request Approved"
      case "reject":
        return "Purchase Request Rejected"
      case "return":
        return "Purchase Request Returned"
      default:
        return "Action Completed"
    }
  }

  const getMessage = () => {
    switch (action) {
      case "approve":
        return `You have successfully approved purchase request ${prId}.`
      case "reject":
        return `You have rejected purchase request ${prId}.`
      case "return":
        return `You have returned purchase request ${prId} for revision.`
      default:
        return `Action completed for purchase request ${prId}.`
    }
  }

  const handleContinue = () => {
    router.push("/pr-approval")
  }

  return (
    <>
      <MobileNav />
      <div className="container max-w-md mx-auto pt-20 pb-20 px-4 flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="w-full">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">{getIcon()}</div>
            <CardTitle className="text-xl">{getTitle()}</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-2">
            <p className="text-muted-foreground">{getMessage()}</p>
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <div className="mb-1">
                <span className="font-medium">PR Reference:</span> {prId}
              </div>
              <div className="mb-1">
                <span className="font-medium">Date:</span> May 11, 2025
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                {action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Returned"}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-2">
            <Button onClick={handleContinue} className="w-full">
              Continue to PR Approval
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
