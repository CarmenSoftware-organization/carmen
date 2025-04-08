'use client'

import { useState } from "react"
import Link from "next/link"
import { Settings, Settings2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function FloatingSettingsButton() {
  const [isOpen, setIsOpen] = useState(false)
  const basePath = "/system-administration/system-integrations/pos/settings"
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="flex flex-col space-y-2 mb-2 animate-in slide-in-from-bottom-5 duration-200">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`${basePath}/system`} passHref>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white shadow-md"
                    aria-label="System Settings"
                  >
                    <Settings2 className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>System Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`${basePath}/config`} passHref>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white shadow-md"
                    aria-label="POS Configuration"
                  >
                    <Settings className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>POS Configuration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      <Button
        variant={isOpen ? "default" : "outline"}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full shadow-lg border-2",
          isOpen ? "bg-primary" : "bg-white"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close settings menu" : "Open settings menu"}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Settings className="h-5 w-5" aria-hidden="true" />
        )}
      </Button>
    </div>
  )
} 