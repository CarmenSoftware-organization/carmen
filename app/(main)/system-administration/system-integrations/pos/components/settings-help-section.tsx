'use client'

import Link from "next/link"
import { HelpCircle, ExternalLink, Keyboard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface KeyboardShortcut {
  key: string
  description: string
}

interface SettingsHelpSectionProps {
  pageName: string
  shortcuts?: KeyboardShortcut[]
}

export function SettingsHelpSection({ pageName, shortcuts = [] }: SettingsHelpSectionProps) {
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Need Help?
        </CardTitle>
        <CardDescription>
          Get assistance with {pageName} settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="shortcuts">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Keyboard Shortcuts
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                {shortcuts.length > 0 ? (
                  <ul className="space-y-2">
                    {shortcuts.map((shortcut: KeyboardShortcut, index: number) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>{shortcut.description}</span>
                        <kbd className="px-2 py-1 bg-background rounded border">{shortcut.key}</kbd>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No keyboard shortcuts available for this page.</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="documentation">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Documentation
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <p>Visit our documentation for detailed guides:</p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>
                    <Link href="#" className="text-primary hover:underline">
                      How to configure POS integration
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-primary hover:underline">
                      Understanding system settings
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-primary hover:underline">
                      Troubleshooting common issues
                    </Link>
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
} 