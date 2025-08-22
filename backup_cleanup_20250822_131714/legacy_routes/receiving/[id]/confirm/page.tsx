"use client"

import { useRouter } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { ArrowRightIcon } from "@radix-ui/react-icons"

export default function ReceivingConfirmationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const poId = params.id

  const handleContinue = () => {
    router.push("/receiving")
  }

  return (
    <>
      <MobileNav />
      <div className="container max-w-md mx-auto pt-20 pb-20 px-4 flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="w-full">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-xl">Receiving Completed</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-2">
            <p className="text-muted-foreground">
              You have successfully completed the receiving process for purchase order {poId}.
            </p>
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <div className="mb-1">
                <span className="font-medium">GRN Reference:</span> GRN-{poId}-001
              </div>
              <div className="mb-1">
                <span className="font-medium">Date:</span> May 11, 2025
              </div>
              <div>
                <span className="font-medium">Status:</span> Completed
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-2">
            <Button onClick={handleContinue} className="w-full">
              Continue to Receiving
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
