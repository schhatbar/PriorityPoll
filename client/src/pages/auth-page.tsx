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
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Login Form Section - Always centered */}
      <div className="flex flex-col items-center justify-center p-4 md:p-8">
        <Card className="mx-auto w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
              Priority Poll System
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {activeTab === "login" ? "Admin Login" : "Create a new account"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2 sm:mb-8">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm">
                  <LogIn className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm">
                  <UserPlus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
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
                              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
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
                              <LockIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
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
                      className="group relative w-full overflow-hidden text-sm" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                          Logging in...
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center justify-center gap-1">
                            Sign In 
                            <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
                          </span>
                          <span className="absolute inset-0 bg-white/10 transition-all duration-300 group-hover:bg-white/20"></span>
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
                              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
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
                              <LockIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
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
                      className="group relative w-full overflow-hidden text-sm" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                          Creating account...
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center justify-center">
                            Create Account
                          </span>
                          <span className="absolute inset-0 bg-white/10 transition-all duration-300 group-hover:bg-white/20"></span>
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-3 text-center sm:mt-8 sm:p-4">
              <h4 className="mb-2 text-xs font-medium text-gray-700 sm:text-sm">Demo Accounts</h4>
              <div className="space-y-2">
                <div className="flex flex-col items-start justify-between rounded border border-gray-100 bg-white px-3 py-2 xs:flex-row xs:items-center">
                  <div className="mb-1 flex items-center xs:mb-0">
                    <div className="rounded bg-primary/10 p-1 sm:p-1.5">
                      <Users className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
                    </div>
                    <span className="ml-2 text-xs font-medium sm:text-sm">Admin</span>
                  </div>
                  <div>
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">admin / admin123</code>
                  </div>
                </div>
                <div className="flex flex-col items-start justify-between rounded border border-gray-100 bg-white px-3 py-2 xs:flex-row xs:items-center">
                  <div className="mb-1 flex items-center xs:mb-0">
                    <div className="rounded bg-gray-100 p-1 sm:p-1.5">
                      <UserIcon className="h-3 w-3 text-gray-500 sm:h-4 sm:w-4" />
                    </div>
                    <span className="ml-2 text-xs font-medium sm:text-sm">User</span>
                  </div>
                  <div>
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">user / user123</code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hero Section - Only on desktop */}
      <div className="hidden bg-gradient-to-br from-primary-900 via-primary to-primary-800 p-8 md:flex md:flex-col md:justify-center lg:p-12">
        <div className="mx-auto max-w-lg">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-6 text-4xl font-bold text-white">
            Priority Poll System
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-white/90">
            A powerful tool for creating and participating in priority-based polls. 
            Rank your choices and make your voice heard.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="mr-4 rounded-full border border-white/20 bg-white/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Priority-Based Voting</h3>
                <p className="mt-1 text-white/70">Rank options in order of importance with an intuitive drag-and-drop interface</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-4 rounded-full border border-white/20 bg-white/10 p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Secure Role-Based Access</h3>
                <p className="mt-1 text-white/70">Admin and user roles with different permissions to manage polls</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-4 rounded-full border border-white/20 bg-white/10 p-2">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Visual Results Analysis</h3>
                <p className="mt-1 text-white/70">Detailed charts and graphs for admins to analyze voting patterns</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 border-t border-white/10 pt-8">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} Priority Poll System | Secure and easy priority-based polling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}