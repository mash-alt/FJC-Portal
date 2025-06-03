// User Types for Firebase Collections

// Base User interface with common properties
export interface BaseUser {
  id?: string; // Firestore document ID
  uid: string; // Firebase Auth UID
  contactNumber: string;
  email: string;
  createdAt: string; // ISO string timestamp
}

// Student interface
export interface Student extends BaseUser {
  age: number;
  assessment: number;
  firstName: string;
  lastName: string;
  middleName?: string; // Optional since it might not always be provided
  studentId: string; // 6-digit generated student ID
  address: string;
  churchAffiliate: string;
  gender: string;
  instructorReference: string; // 4-digit instructor code (database field name)
  status: 'active' | 'inactive' | 'graduated'; // Student status
  balance: number; // Amount owed by student (0 means fully paid)
  remarks?: string; // Optional instructor remarks about the student
}

// Instructor interface with simplified students array
export interface Instructor extends BaseUser {
  instructorCode: string; // 4-digit instructor code
  name: string;
  students: string[]; // Array of student UIDs
}

// Additional utility types
export type UserType = 'student' | 'instructor';

// For authentication and user identification
export interface AuthUser {
  uid: string;
  email: string;
  userType: UserType;
}

// For registration form data
export interface StudentRegistrationData {
  firstName: string;
  lastName: string;
  middleName?: string;
  age: number;
  email: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
  gender: string;
  instructorCode: string;
  address?: string;
  churchAffiliate?: string;
}

export interface InstructorRegistrationData {
  name: string;
  email: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
  instructorCode: string;
}

// Announcement related interfaces
export interface AnnouncementAttachment {
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'document' | 'video' | 'other';
  size: number;
}

export interface Announcement {
  id?: string; // Firestore document ID
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  category: 'general' | 'assignment' | 'exam' | 'event' | 'payment';
  instructorCode: string;
  instructorName: string;
  targetAudience: 'all' | 'specific' | 'class';
  targetStudents: string[]; // Array of student UIDs for specific targeting
  viewedBy: string[]; // Array of student UIDs who have viewed
  acknowledgedBy: string[]; // Array of student UIDs who have acknowledged
  createdAt: string; // ISO string timestamp
  updatedAt: string; // ISO string timestamp
  expiresAt?: string; // Optional expiration date
  status: 'draft' | 'published' | 'archived';
  isPinned: boolean;
  attachments: AnnouncementAttachment[];
  totalViews: number;
  totalAcknowledgments: number;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  category: 'general' | 'assignment' | 'exam' | 'event' | 'payment';
  instructorCode: string;
  targetAudience?: 'all' | 'specific' | 'class';
  targetStudents?: string[];
  expiresAt?: string;
  isPinned?: boolean;
  attachments?: AnnouncementAttachment[];
}

export interface StudentAnnouncementView {
  announcementId: string;
  studentUid: string;
  viewedAt: string;
  acknowledgedAt?: string;
  reactions?: string[]; // Array of reaction types
}