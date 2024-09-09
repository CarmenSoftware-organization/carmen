'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  return (
    <div>
      <Header onSidebarToggle={handleSidebarToggle} />
      <div className="flex justify-between">
        <Sidebar isOpen={isSidebarOpen} />
      <main className="pt-16 w-full">
        {children}
      </main>
      </div>
    </div>
  );
}