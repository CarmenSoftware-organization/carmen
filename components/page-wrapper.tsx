interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {children}
    </div>
  )
}
