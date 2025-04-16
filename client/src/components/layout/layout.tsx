import Navbar from "./navbar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="flex-grow w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-5 md:py-8 container max-w-7xl">
        <div className="w-full mx-auto">
          {children}
        </div>
      </main>
      <footer className="mt-auto bg-white border-t border-gray-200 py-4 sm:py-6">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-2 sm:mb-0">
              Priority Poll System © {new Date().getFullYear()}
            </p>
            <p className="text-xs text-gray-400">
              Secure and easy priority-based polling
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
