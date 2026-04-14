import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Dashboard/Navbar'
import Sidebar from '../components/Dashboard/Sidebar'

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // GLOBAL STUDY TIMER - Tracks time spent anywhere in the Dashboard
  useEffect(() => {
    const interval = setInterval(() => {
        const current = parseInt(localStorage.getItem('lingofy_study_seconds') || '0', 10);
        localStorage.setItem('lingofy_study_seconds', (current + 1).toString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar setIsSidebarOpen={setIsSidebarOpen} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Dashboard
