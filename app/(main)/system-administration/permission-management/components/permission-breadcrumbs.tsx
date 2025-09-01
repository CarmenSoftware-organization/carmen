"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Settings, Shield, Users, CreditCard, FileText } from "lucide-react"

interface BreadcrumbSegment {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

export function PermissionBreadcrumbs() {
  const pathname = usePathname()
  
  const getSegments = (): BreadcrumbSegment[] => {
    const segments: BreadcrumbSegment[] = [
      { title: "System Administration", href: "/system-administration", icon: Settings },
      { title: "Permission Management", href: "/system-administration/permission-management", icon: Shield },
    ]

    if (pathname.includes('/roles')) {
      segments.push({ title: "Role Management", href: "/system-administration/permission-management/roles", icon: Users })
      
      if (pathname.includes('/new')) {
        segments.push({ title: "Create New Role" })
      } else if (pathname.includes('/edit')) {
        segments.push({ title: "Edit Role" })
      } else if (pathname.match(/\/roles\/[^\/]+$/)) {
        segments.push({ title: "Role Details" })
      }
    } else if (pathname.includes('/policies')) {
      segments.push({ title: "Policy Management", href: "/system-administration/permission-management/policies", icon: FileText })
      
      if (pathname.includes('/builder')) {
        segments.push({ title: "Policy Builder" })
      } else if (pathname.includes('/demo')) {
        segments.push({ title: "Policy Demo" })
      } else if (pathname.includes('/edit')) {
        segments.push({ title: "Edit Policy" })
      } else if (pathname.match(/\/policies\/[^\/]+$/)) {
        segments.push({ title: "Policy Details" })
      }
    } else if (pathname.includes('/subscription')) {
      segments.push({ title: "Subscription Settings", href: "/system-administration/permission-management/subscription", icon: CreditCard })
    }

    return segments
  }

  const segments = getSegments()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          const IconComponent = segment.icon

          return (
            <div key={segment.title} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    {segment.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={segment.href || '#'} className="flex items-center gap-2">
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      {segment.title}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}