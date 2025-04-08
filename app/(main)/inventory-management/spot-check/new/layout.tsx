"use client"

import React from "react";
import { PageWrapper } from "@/components/page-wrapper";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function NewSpotCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect any old step-based routes to the new wizard
    if (pathname && pathname !== "/inventory-management/spot-check/new") {
      router.replace("/inventory-management/spot-check/new");
    }
  }, [pathname, router]);

  return <PageWrapper>{children}</PageWrapper>;
}
