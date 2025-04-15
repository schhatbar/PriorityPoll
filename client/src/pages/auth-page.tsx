import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  LogIn, 
  UserPlus, 
  LockIcon, 
  UserIcon, 
  ChevronRight,
  CheckCircle2,
  BarChart3,
  Users 
} from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(5, "Password must be at least 5 characters"),
  role: z.enum(["user", "admin"]).default("user"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      setLocation(user.role === "admin" ? "/admin" : "/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "user",
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12">
        <Card className="w-full max-w-md shadow-lg border-gray-200/80">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Priority Poll System
            </CardTitle>
            <CardDescription className="text-gray-500">
              {activeTab === "login" ? "Admin Login" : "Create a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                placeholder="Enter your username" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <LockIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full relative overflow-hidden group" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center justify-center gap-1">
                            Sign In 
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                          <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></span>
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                placeholder="Choose a username" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <LockIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                type="password" 
                                placeholder="Choose a password" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full relative overflow-hidden group" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center justify-center">
                            Create Account
                          </span>
                          <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></span>
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Demo Accounts</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-1.5 rounded">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <span className="ml-2 text-sm font-medium">Admin</span>
                  </div>
                  <div>
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">admin / admin123</code>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-1.5 rounded">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="ml-2 text-sm font-medium">User</span>
                  </div>
                  <div>
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">user / user123</code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Hero */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-900 via-primary to-primary-800 p-8 lg:p-12 flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <div className="mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-6">
            Priority Poll System
          </h1>
          <p className="text-white/90 text-lg mb-10 leading-relaxed">
            A powerful tool for creating and participating in priority-based polls. 
            Rank your choices and make your voice heard.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white/10 p-2 rounded-full mr-4 border border-white/20">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium text-lg">Priority-Based Voting</h3>
                <p className="text-white/70 mt-1">Rank options in order of importance with an intuitive drag-and-drop interface</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 p-2 rounded-full mr-4 border border-white/20">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium text-lg">Secure Role-Based Access</h3>
                <p className="text-white/70 mt-1">Admin and user roles with different permissions to manage polls</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 p-2 rounded-full mr-4 border border-white/20">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium text-lg">Visual Results Analysis</h3>
                <p className="text-white/70 mt-1">Detailed charts and graphs for admins to analyze voting patterns</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Priority Poll System | Secure and easy priority-based polling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
