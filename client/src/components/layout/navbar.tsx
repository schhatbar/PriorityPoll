import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LogOut, User, ChevronDown, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export default function Navbar() {
  const { user, logoutMutation, isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 cursor-pointer">Priority Poll System</h1>
          </Link>

          {isMobile ? (
            <Button variant="ghost" className="p-2" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          ) : (
            user ? (
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Admin Navigation - Desktop */}
                {isAdmin && (
                  <div className="hidden md:flex md:space-x-2">
                    <Link href="/admin">
                      <Button variant="ghost" size="sm">Dashboard</Button>
                    </Link>
                    <Link href="/admin/create">
                      <Button variant="ghost" size="sm">Create Poll</Button>
                    </Link>
                    <Link href="/admin/users">
                      <Button variant="ghost" size="sm">Users</Button>
                    </Link>
                  </div>
                )}

                {/* User Navigation - Desktop */}
                {!isAdmin && (
                  <Link href="/">
                    <Button variant="ghost" size="sm">Available Polls</Button>
                  </Link>
                )}

                {/* User Menu - Desktop */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1 md:gap-2" size="sm">
                      <User className="h-4 w-4" />
                      <span className="hidden md:inline">{user.username}</span>
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {user.role}
                      </Badge>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost">View Polls</Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline">Admin Login</Button>
                </Link>
              </div>
            )
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {user ? (
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>{user.username}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {user.role}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>

                {isAdmin && (
                  <div className="flex flex-col space-y-2 mt-4">
                    <Link href="/admin">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/admin/create">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                        Create Poll
                      </Button>
                    </Link>
                    <Link href="/admin/users">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                        Users
                      </Button>
                    </Link>
                  </div>
                )}

                {!isAdmin && (
                  <Link href="/">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start mt-4" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Available Polls
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link href="/">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    View Polls
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
