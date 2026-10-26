import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoModeBanner } from '../components/common/DemoModeBanner';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { ToastContainer } from '../components/common/ToastContainer';
import { AIAssistantModal } from '../components/chat/AIAssistantModal';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <DemoModeBanner />
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex min-h-[calc(100vh-7rem)]" />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
      <AIAssistantModal />
    </div>
  );
};
