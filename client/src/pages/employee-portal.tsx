import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Users, Building2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { clockInSchema, type ClockInData, type AttendanceRecord } from "@shared/schema";
import { getCurrentTime, formatTime } from "@/lib/time-utils";

const departments = [
  "Tech Team Alpha",
  "Tech Team Charlie", 
  "Human Resources Team",
  "Marketing Team",
  "Sales Team",
  "Founder's Office",
  "Content Factory",
  "Social Media & Content",
  "Customer Support",
  "Other"
];

const attendanceFeatures = [
  { title: "Real-time Tracking", description: "Instant clock in/out with automatic time calculation", icon: "⏱️" },
  { title: "Department Integration", description: "Organized tracking by department divisions", icon: "🏢" },
  { title: "Late Arrival Detection", description: "Automatic marking for arrivals after 9:15 AM", icon: "⚠️" },
  { title: "Comprehensive Reports", description: "Detailed analytics and export capabilities", icon: "📊" },
  { title: "Secure HR Access", description: "Password-protected administrative dashboard", icon: "🔒" },
  { title: "Professional Interface", description: "Modern, user-friendly design for all users", icon: "✨" }
];

const motivationalQuotes = [
  "Success is the sum of small efforts repeated day in and day out.",
  "The way to get started is to quit talking and begin doing.",
  "Excellence is not a skill, it's an attitude.",
  "Your work is going to fill a large part of your life, make it meaningful.",
  "Progress, not perfection, is the goal.",
  "Every moment is a fresh beginning.",
  "Believe you can and you're halfway there.",
  "The future depends on what you do today.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Don't watch the clock; do what it does. Keep going."
];

const officeImages = [
  { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200", alt: "Modern office environment" },
  { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200", alt: "Collaborative office space" },
  { url: "https://pixabay.com/get/g5d31e428da03f4250fb222f3b81a4e75cf238a70b0142848b39a4d12b0d4bb754d6e687668926ea61890e9cf7f3e19750fa68fec7aecade5ed0df8aafd7871b2_1280.jpg", alt: "Modern conference room" },
  { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200", alt: "Contemporary office workspace" }
];

export default function EmployeePortal() {
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [employeeName, setEmployeeName] = useState("");
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ClockInData>({
    resolver: zodResolver(clockInSchema),
    defaultValues: {
      employeeName: "",
      department: undefined
    }
  });

  // Update time every minute and rotate quotes every 10 seconds
  useEffect(() => {
    const timeTimer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);

    const quoteTimer = setInterval(() => {
      setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, 10000);

    return () => {
      clearInterval(timeTimer);
      clearInterval(quoteTimer);
    };
  }, []);

  // Watch employee name changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "employeeName" && value.employeeName) {
        setEmployeeName(value.employeeName);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Get current status
  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/attendance/status", employeeName],
    enabled: !!employeeName,
  });

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async (data: ClockInData) => {
      const response = await apiRequest("POST", "/api/attendance/clock-in", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Clocked In Successfully",
        description: "Your work time tracking has started.",
      });
      refetchStatus();
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
    },
    onError: (error: any) => {
      toast({
        title: "Clock In Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const response = await apiRequest("POST", "/api/attendance/clock-out", { recordId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Clocked Out Successfully",
        description: `Total working time: ${data.totalHours}`,
      });
      refetchStatus();
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
    },
    onError: (error: any) => {
      toast({
        title: "Clock Out Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleClockIn = (data: ClockInData) => {
    clockInMutation.mutate(data);
  };

  const handleClockOut = () => {
    if ((statusData as any)?.record?.id) {
      clockOutMutation.mutate((statusData as any).record.id);
    }
  };

  const isActive = (statusData as any)?.isActive || false;
  const activeRecord = (statusData as any)?.record as AttendanceRecord | null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Floating 3D Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-600 rounded-full spin-3d opacity-70"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-full bounce-3d opacity-60"></div>
        <div className="absolute bottom-40 left-20 w-10 h-10 bg-gradient-to-r from-green-400 to-blue-600 rounded-full float-3d opacity-50"></div>
        <div className="absolute top-60 right-40 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full pulse-3d opacity-70"></div>
        <div className="absolute bottom-60 right-10 w-12 h-12 bg-gradient-to-r from-red-400 to-pink-600 rounded-full spin-3d opacity-40"></div>
        <div className="absolute top-80 left-40 w-7 h-7 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full bounce-3d opacity-60"></div>
      </div>

      {/* Motivational Quote Banner */}
      <div className="relative z-10 mb-8">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-gradient-to-r from-blue-200 to-purple-200">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text mb-2">✨ Daily Inspiration ✨</div>
            <p className="text-lg text-gray-700 italic font-medium">"{currentQuote}"</p>
            <div className="mt-3 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-red-600 rounded-full pulse-3d"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-full bounce-3d"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-600 rounded-full spin-3d"></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee Clock In/Out Card */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="text-primary h-6 w-6" />
                </div>
                <div className="ml-4">
                  <CardTitle className="text-xl">Time Tracking</CardTitle>
                  <p className="text-sm text-muted-foreground">Clock in and out to track your work hours</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-0 pb-0">
              {/* Employee Form */}
              <form onSubmit={form.handleSubmit(handleClockIn)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="employeeName">Employee Name *</Label>
                    <Input
                      id="employeeName"
                      placeholder="Enter your full name"
                      {...form.register("employeeName")}
                    />
                    {form.formState.errors.employeeName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.employeeName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select onValueChange={(value) => form.setValue("department", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.department && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.department.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Current Status Display */}
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Current Status:</span>
                      <Badge 
                        className={`ml-2 ${
                          isActive 
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                        variant="secondary"
                      >
                        {isActive ? "Logged In" : "Logged Out"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Current Time</div>
                      <div className="text-lg font-semibold">{currentTime}</div>
                    </div>
                  </div>
                  {activeRecord && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Clocked in at: {formatTime(new Date(activeRecord.clockInTime))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button 
                    type="submit"
                    disabled={isActive || clockInMutation.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {clockInMutation.isPending ? "Clocking In..." : "Clock In"}
                  </Button>
                  <Button 
                    type="button"
                    disabled={!isActive || clockOutMutation.isPending}
                    onClick={handleClockOut}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Today's Activity */}
          <Card className="mt-8 p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Today's Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {activeRecord ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Clock In</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(new Date(activeRecord.clockInTime))}
                    </span>
                  </div>
                  {activeRecord.clockOutTime && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium">Clock Out</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(new Date(activeRecord.clockOutTime))}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity today. Clock in to start tracking your time.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Office Environment Images */}
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Office Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="space-y-4">
                {officeImages.map((image, index) => (
                  <img 
                    key={index}
                    src={image.url} 
                    alt={image.alt}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
