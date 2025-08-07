import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shield, Users, Clock, AlertTriangle, BarChart3, Search, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatTime, formatDate } from "@/lib/time-utils";
import type { AttendanceRecord } from "@shared/schema";

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

const hrImages = [
  { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60", alt: "HR dashboard analytics" },
  { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60", alt: "HR professional" },
  { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60", alt: "Analytics dashboard" }
];

export default function HRDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [filters, setFilters] = useState({
    employeeName: "",
    department: "",
    date: "",
    minHours: ""
  });
  const { toast } = useToast();

  const authForm = useForm({
    defaultValues: {
      password: ""
    }
  });

  // HR authentication mutation
  const authMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      const response = await apiRequest("POST", "/api/hr/authenticate", data);
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the HR Dashboard",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Access Denied",
        description: "Invalid password. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Get attendance statistics
  const { data: statistics } = useQuery({
    queryKey: ["/api/attendance/statistics"],
    enabled: isAuthenticated,
  });

  // Get attendance records with filters
  const { data: records, isLoading } = useQuery({
    queryKey: ["/api/attendance/records", filters],
    enabled: isAuthenticated,
  });

  const handleAuth = (data: { password: string }) => {
    authMutation.mutate(data);
  };

  const applyFilters = () => {
    // Filters are automatically applied through the query key dependency
    toast({
      title: "Filters Applied",
      description: "Attendance records have been updated.",
    });
  };

  const exportData = () => {
    if (!records) return;

    const csvContent = [
      ["Employee", "Department", "Date", "Clock In", "Clock Out", "Total Hours", "Status"],
      ...records.map((record: AttendanceRecord) => [
        record.employeeName,
        record.department,
        record.date,
        formatTime(new Date(record.clockInTime)),
        record.clockOutTime ? formatTime(new Date(record.clockOutTime)) : "-",
        record.totalHours || "-",
        record.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_records_${formatDate(new Date())}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Attendance records have been exported to CSV.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Complete</Badge>;
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Active</Badge>;
      case "late":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Late</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <CardContent>
              <div className="text-center mb-6">
                <div className="p-3 bg-primary/10 rounded-lg inline-block mb-4">
                  <Shield className="text-primary h-8 w-8" />
                </div>
                <CardTitle className="text-xl">HR Dashboard Access</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter password to access attendance records
                </p>
              </div>
              
              <form onSubmit={authForm.handleSubmit(handleAuth)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter HR password"
                      {...authForm.register("password", { required: true })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={authMutation.isPending}
                >
                  {authMutation.isPending ? "Authenticating..." : "Access Dashboard"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <CardTitle className="text-2xl">Attendance Dashboard</CardTitle>
            <p className="text-muted-foreground">Monitor and manage employee attendance records</p>
          </div>
          <div className="flex space-x-3">
            {hrImages.map((image, index) => (
              <img 
                key={index}
                src={image.url} 
                alt={image.alt}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="text-emerald-600 h-6 w-6 mr-3" />
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {statistics?.totalEmployees || 0}
                </div>
                <div className="text-sm text-emerald-700">Total Employees</div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="text-blue-600 h-6 w-6 mr-3" />
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {statistics?.currentlyActive || 0}
                </div>
                <div className="text-sm text-blue-700">Currently Active</div>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="text-amber-600 h-6 w-6 mr-3" />
              <div>
                <div className="text-2xl font-bold text-amber-900">
                  {statistics?.lateToday || 0}
                </div>
                <div className="text-sm text-amber-700">Late Today</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center">
              <BarChart3 className="text-slate-600 h-6 w-6 mr-3" />
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {statistics?.avgHoursToday || 0}h
                </div>
                <div className="text-sm text-slate-700">Avg Hours Today</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters Section */}
      <Card className="p-6 mb-8">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">Filter Records</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="filterName">Employee Name</Label>
              <Input
                id="filterName"
                placeholder="Search by name"
                value={filters.employeeName}
                onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterDepartment">Department</Label>
              <Select 
                value={filters.department} 
                onValueChange={(value) => setFilters({ ...filters, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterDate">Date</Label>
              <Input
                id="filterDate"
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterHours">Min Hours</Label>
              <Select 
                value={filters.minHours} 
                onValueChange={(value) => setFilters({ ...filters, minHours: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Hours</SelectItem>
                  <SelectItem value="4">4+ hours</SelectItem>
                  <SelectItem value="6">6+ hours</SelectItem>
                  <SelectItem value="8">8+ hours</SelectItem>
                  <SelectItem value="10">10+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Button onClick={applyFilters} className="bg-primary">
              <Search className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <Button onClick={exportData} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading attendance records...</div>
          ) : !records || records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record: AttendanceRecord) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.employeeName}</TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{formatTime(new Date(record.clockInTime))}</TableCell>
                      <TableCell>
                        {record.clockOutTime ? formatTime(new Date(record.clockOutTime)) : "-"}
                      </TableCell>
                      <TableCell className="font-medium">{record.totalHours || "-"}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
