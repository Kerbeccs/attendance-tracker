import { type User, type InsertUser, type AttendanceRecord, type InsertAttendance } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Attendance methods
  createAttendanceRecord(record: InsertAttendance): Promise<AttendanceRecord>;
  getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined>;
  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined>;
  getAllAttendanceRecords(): Promise<AttendanceRecord[]>;
  getActiveAttendanceRecord(employeeName: string, date: string): Promise<AttendanceRecord | undefined>;
  getAttendanceRecordsByFilters(filters: {
    employeeName?: string;
    department?: string;
    date?: string;
    minHours?: number;
  }): Promise<AttendanceRecord[]>;
  getAttendanceStatistics(): Promise<{
    totalEmployees: number;
    currentlyActive: number;
    lateToday: number;
    avgHoursToday: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private attendanceRecords: Map<string, AttendanceRecord>;

  constructor() {
    this.users = new Map();
    this.attendanceRecords = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAttendanceRecord(record: InsertAttendance): Promise<AttendanceRecord> {
    const id = randomUUID();
    const attendanceRecord: AttendanceRecord = { 
      ...record, 
      id,
      clockOutTime: null,
      totalHours: null,
      status: "active"
    };
    this.attendanceRecords.set(id, attendanceRecord);
    return attendanceRecord;
  }

  async getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined> {
    return this.attendanceRecords.get(id);
  }

  async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const record = this.attendanceRecords.get(id);
    if (!record) return undefined;

    const updatedRecord = { ...record, ...updates };
    this.attendanceRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values()).sort((a, b) => 
      new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime()
    );
  }

  async getActiveAttendanceRecord(employeeName: string, date: string): Promise<AttendanceRecord | undefined> {
    return Array.from(this.attendanceRecords.values()).find(
      (record) => record.employeeName === employeeName && 
                  record.date === date && 
                  record.status === "active"
    );
  }

  async getAttendanceRecordsByFilters(filters: {
    employeeName?: string;
    department?: string;
    date?: string;
    minHours?: number;
  }): Promise<AttendanceRecord[]> {
    let records = Array.from(this.attendanceRecords.values());

    if (filters.employeeName) {
      records = records.filter(record => 
        record.employeeName.toLowerCase().includes(filters.employeeName!.toLowerCase())
      );
    }

    if (filters.department) {
      records = records.filter(record => record.department === filters.department);
    }

    if (filters.date) {
      records = records.filter(record => record.date === filters.date);
    }

    if (filters.minHours) {
      records = records.filter(record => {
        if (!record.totalHours) return false;
        const hours = parseFloat(record.totalHours);
        return hours >= filters.minHours!;
      });
    }

    return records.sort((a, b) => 
      new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime()
    );
  }

  async getAttendanceStatistics(): Promise<{
    totalEmployees: number;
    currentlyActive: number;
    lateToday: number;
    avgHoursToday: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = Array.from(this.attendanceRecords.values()).filter(
      record => record.date === today
    );

    const uniqueEmployees = new Set(todayRecords.map(record => record.employeeName));
    const activeRecords = todayRecords.filter(record => record.status === "active");
    const lateRecords = todayRecords.filter(record => record.status === "late");
    
    const completedRecords = todayRecords.filter(record => record.totalHours);
    const totalHours = completedRecords.reduce((sum, record) => {
      return sum + (parseFloat(record.totalHours || "0"));
    }, 0);
    const avgHours = completedRecords.length > 0 ? totalHours / completedRecords.length : 0;

    return {
      totalEmployees: uniqueEmployees.size,
      currentlyActive: activeRecords.length,
      lateToday: lateRecords.length,
      avgHoursToday: Math.round(avgHours * 10) / 10
    };
  }
}

export const storage = new MemStorage();
