import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LogOut, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const { user, logoutMutation, isAdmin } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Priority Poll System</h1>

        {user && (
          <div className="flex items-center space-x-4">
            {/* Admin Navigation */}
            {isAdmin && (
              <div className="flex space-x-2">
                <Link href="/admin">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/admin/create">
                  <Button variant="ghost">Create Poll</Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant="ghost">Users</Button>
                </Link>
              </div>
            )}

            {/* User Navigation */}
            {!isAdmin && (
              <Link href="/">
                <Button variant="ghost">Available Polls</Button>
              </Link>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.username}
                  <Badge variant="secondary" className="ml-1">
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
        )}
      </div>
    </header>
  );
}
