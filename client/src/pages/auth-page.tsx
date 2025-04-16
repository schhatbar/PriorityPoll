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
      <div className="w-full md:w-1/2 flex flex-col">
        {/* Mobile view hero section */}
        <div className="md:hidden bg-gradient-to-b from-primary to-primary-800 p-4 sm:p-6">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-4 bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Priority Poll System
            </h1>
            <p className="text-white/90 text-sm mb-4 leading-relaxed">
              A powerful tool for creating and participating in priority-based polls.
            </p>
            
            <div className="flex justify-between items-center space-x-2 text-xs text-white/70">
              <div className="text-center p-2">
                <div className="bg-white/10 p-1.5 rounded-full mx-auto mb-1.5 w-8 h-8 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <p>Priority Voting</p>
              </div>
              <div className="text-center p-2">
                <div className="bg-white/10 p-1.5 rounded-full mx-auto mb-1.5 w-8 h-8 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <p>Role-Based Access</p>
              </div>
              <div className="text-center p-2">
                <div className="bg-white/10 p-1.5 rounded-full mx-auto mb-1.5 w-8 h-8 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <p>Result Analysis</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Login/Register Form */}
        <div className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
          <Card className="w-full max-w-md shadow-lg border-gray-200/80">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Priority Poll System
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {activeTab === "login" ? "Admin Login" : "Create a new account"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm">
                    <LogIn className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm">
                    <UserPlus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 sm:space-y-5">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-700">Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                <Input 
                                  placeholder="Enter your username" 
                                  className="pl-10 text-sm" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-700">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockIcon className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="pl-10 text-sm" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full relative overflow-hidden group text-sm" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            Logging in...
                          </span>
                        ) : (
                          <>
                            <span className="flex items-center justify-center gap-1">
                              Sign In 
                              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
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
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 sm:space-y-5">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-700">Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                <Input 
                                  placeholder="Choose a username" 
                                  className="pl-10 text-sm" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-700">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockIcon className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                <Input 
                                  type="password" 
                                  placeholder="Choose a password" 
                                  className="pl-10 text-sm" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full relative overflow-hidden group text-sm" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
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

              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Demo Accounts</h4>
                <div className="space-y-2">
                  <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between bg-white px-3 py-2 rounded border border-gray-100">
                    <div className="flex items-center mb-1 xs:mb-0">
                      <div className="bg-primary/10 p-1 sm:p-1.5 rounded">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <span className="ml-2 text-xs sm:text-sm font-medium">Admin</span>
                    </div>
                    <div>
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">admin / admin123</code>
                    </div>
                  </div>
                  <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between bg-white px-3 py-2 rounded border border-gray-100">
                    <div className="flex items-center mb-1 xs:mb-0">
                      <div className="bg-gray-100 p-1 sm:p-1.5 rounded">
                        <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      </div>
                      <span className="ml-2 text-xs sm:text-sm font-medium">User</span>
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
      </div>

      {/* Right side - Hero for Desktop */}
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