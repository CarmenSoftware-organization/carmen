'use client'

import { PageWrapper } from "@/components/page-wrapper";

export default function SpotCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWrapper>{children}</PageWrapper>;
}
