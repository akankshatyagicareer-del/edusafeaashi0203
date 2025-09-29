import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AlertBanner from "./AlertBanner";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-10% left-5% w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-20% right-10% w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float delay-200"></div>
        <div className="absolute bottom-10% left-20% w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float delay-300"></div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-out">
        {/* Navbar */}
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Alert Banner */}
        <div className="px-6 pt-2 animate-fade-in">
          <AlertBanner />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto animate-fade-in delay-100">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-lg border-t border-slate-200/50 py-6 px-6 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">ES</span>
              </div>
              <p className="text-sm text-slate-600">
                © {new Date().getFullYear()} EduSafe. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="text-sm text-slate-600 hover:text-primary-600 transition-all duration-300 font-medium hover:scale-105">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-slate-600 hover:text-primary-600 transition-all duration-300 font-medium hover:scale-105">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-slate-600 hover:text-primary-600 transition-all duration-300 font-medium hover:scale-105">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;