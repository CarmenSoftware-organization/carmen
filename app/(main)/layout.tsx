import MainLayoutClient from './main-layout-client'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return <MainLayoutClient>{children}</MainLayoutClient>
}