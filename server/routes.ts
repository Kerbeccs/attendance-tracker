import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { clockInSchema, clockOutSchema } from "@shared/schema";
import { z } from "zod";

function calculateHours(clockIn: Date, clockOut: Date): string {
  const diffMs = clockOut.getTime() - clockIn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100 + "h";
}

function determineStatus(clockInTime: Date): string {
  const hour = clockInTime.getHours();
  const minute = clockInTime.getMinutes();
  
  // Consider late if after 9:15 AM
  if (hour > 9 || (hour === 9 && minute > 15)) {
    return "late";
  }
  return "active";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Clock in endpoint
  app.post("/api/attendance/clock-in", async (req, res) => {
    try {
      const data = clockInSchema.parse(req.body);
      const today = new Date().toISOString().split('T')[0];
      
      // Check if employee already has an active record today
      const existingRecord = await storage.getActiveAttendanceRecord(data.employeeName, today);
      if (existingRecord) {
        return res.status(400).json({ 
          message: "Employee already clocked in today",
          recordId: existingRecord.id
        });
      }

      const clockInTime = new Date();
      const status = determineStatus(clockInTime);

      const record = await storage.createAttendanceRecord({
        employeeName: data.employeeName,
        department: data.department,
        clockInTime,
        date: today,
        status
      });

      res.json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Clock out endpoint
  app.post("/api/attendance/clock-out", async (req, res) => {
    try {
      const data = clockOutSchema.parse(req.body);
      
      const record = await storage.getAttendanceRecord(data.recordId);
      if (!record) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      if (record.clockOutTime) {
        return res.status(400).json({ message: "Employee already clocked out" });
      }

      const clockOutTime = new Date();
      const totalHours = calculateHours(new Date(record.clockInTime), clockOutTime);

      const updatedRecord = await storage.updateAttendanceRecord(record.id, {
        clockOutTime,
        totalHours,
        status: "completed"
      });

      res.json(updatedRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current status for employee
  app.get("/api/attendance/status/:employeeName", async (req, res) => {
    try {
      const { employeeName } = req.params;
      const today = new Date().toISOString().split('T')[0];
      
      const activeRecord = await storage.getActiveAttendanceRecord(employeeName, today);
      
      res.json({
        isActive: !!activeRecord,
        record: activeRecord || null
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all attendance records with filters
  app.get("/api/attendance/records", async (req, res) => {
    try {
      const { employeeName, department, date, minHours } = req.query;
      
      const filters: any = {};
      if (employeeName) filters.employeeName = employeeName as string;
      if (department) filters.department = department as string;
      if (date) filters.date = date as string;
      if (minHours) filters.minHours = parseFloat(minHours as string);

      const records = await storage.getAttendanceRecordsByFilters(filters);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get attendance statistics
  app.get("/api/attendance/statistics", async (req, res) => {
    try {
      const stats = await storage.getAttendanceStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // HR Authentication endpoint
  app.post("/api/hr/authenticate", async (req, res) => {
    try {
      const { password } = req.body;
      
      // Simple password check - in production, use proper authentication
      const HR_PASSWORD = process.env.HR_PASSWORD || "hr123";
      
      if (password === HR_PASSWORD) {
        res.json({ success: true, message: "Authentication successful" });
      } else {
        res.status(401).json({ success: false, message: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
