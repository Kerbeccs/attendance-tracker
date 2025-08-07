import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeName: text("employee_name").notNull(),
  department: text("department").notNull(),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  totalHours: text("total_hours"),
  status: text("status").notNull().default("active"), // active, completed, late
  date: text("date").notNull(), // YYYY-MM-DD format
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAttendanceSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
}).extend({
  employeeName: z.string().min(1, "Employee name is required"),
  department: z.enum([
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
  ]),
});

export const clockInSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  department: z.enum([
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
  ]),
});

export const clockOutSchema = z.object({
  recordId: z.string().min(1, "Record ID is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type ClockInData = z.infer<typeof clockInSchema>;
export type ClockOutData = z.infer<typeof clockOutSchema>;
