// Authentication utilities for verifying user roles
import { collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import type { Student, Instructor, UserType, StudentRegistrationData, InstructorRegistrationData } from '../types/Users.ts'

/**
 * Generates a 4-digit instructor ID
 * @returns 4-digit instructor code (e.g., "1234")
 */
export const generateInstructorCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

/**
 * Generates a 6-digit student ID based on document ID
 * @param docId - Firestore document ID
 * @returns 6-digit student ID (e.g., "STU001")
 */
export const generateStudentId = (docId: string): string => {
  // Take first 6 characters of document ID and convert to uppercase
  const shortId = docId.substring(0, 6).toUpperCase()
  return `STU${shortId.substring(0, 3)}`
}

/**
 * Checks if instructor code is already taken
 * @param instructorCode - 4-digit instructor code to check
 * @returns Promise resolving to true if code exists, false otherwise
 */
export const isInstructorCodeTaken = async (instructorCode: string): Promise<boolean> => {
  try {
    const q = query(collection(db, 'instructors'), where('instructorCode', '==', instructorCode))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error('Error checking instructor code:', error)
    return true // Assume taken if error occurs for safety
  }
}

/**
 * Generates a unique 4-digit instructor code
 * @returns Promise resolving to unique 4-digit instructor code
 */
export const generateUniqueInstructorCode = async (): Promise<string> => {
  let code = generateInstructorCode()
  let attempts = 0
  const maxAttempts = 10
  
  while (await isInstructorCodeTaken(code) && attempts < maxAttempts) {
    code = generateInstructorCode()
    attempts++
  }
  
  if (attempts === maxAttempts) {
    throw new Error('Unable to generate unique instructor code')
  }
  
  return code
}

/**
 * Verifies if a user exists in the specified collection and returns their data
 * @param email - User's email address
 * @param userType - Type of user ('student' or 'instructor')
 * @returns Promise resolving to user data or null if not found
 */
export const verifyUserRole = async (email: string, userType: UserType): Promise<Student | Instructor | null> => {
  try {
    const collectionName = userType === 'student' ? 'students' : 'instructors'
    
    // Query the collection for a document with matching email
    const q = query(collection(db, collectionName), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null // User not found in the specified collection
    }
    
    // Return the first matching document (there should only be one)
    const doc = querySnapshot.docs[0]
    const data = doc.data()
    
    // Create user object with id and safely cast to appropriate type
    const userWithId = { id: doc.id, ...data }
    
    // Return as the appropriate type based on userType
    return userWithId as unknown as Student | Instructor
    
  } catch (error) {
    console.error('Error verifying user role:', error)
    throw new Error('Failed to verify user credentials')
  }
}

/**
 * Verifies if an instructor code exists and is valid
 * @param instructorCode - 4-digit instructor code
 * @returns Promise resolving to true if valid, false otherwise
 */
export const verifyInstructorCode = async (instructorCode: string): Promise<boolean> => {
  return await isInstructorCodeTaken(instructorCode)
}

/**
 * Gets instructor details by instructor code
 * @param instructorCode - 4-digit instructor code
 * @returns Promise resolving to instructor data or null if not found
 */
export const getInstructorByCode = async (instructorCode: string): Promise<Instructor | null> => {
  try {
    const q = query(collection(db, 'instructors'), where('instructorCode', '==', instructorCode))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const doc = querySnapshot.docs[0]
    const data = doc.data()
    const instructorWithId = { id: doc.id, ...data }
    
    return instructorWithId as unknown as Instructor
  } catch (error) {
    console.error('Error getting instructor by code:', error)
    return null
  }
}

/**
 * Validates instructor code and returns detailed information
 * @param instructorCode - 4-digit instructor code
 * @returns Promise resolving to validation result with instructor details
 */
export const validateInstructorCode = async (instructorCode: string): Promise<{
  isValid: boolean;
  instructor?: Instructor;
  error?: string;
}> => {
  try {
    // Basic format validation
    if (!instructorCode || instructorCode.length !== 4) {
      return {
        isValid: false,
        error: 'Instructor code must be exactly 4 digits'
      }
    }
    
    if (!/^\d{4}$/.test(instructorCode)) {
      return {
        isValid: false,
        error: 'Instructor code must contain only numbers'
      }
    }
    
    // Check if instructor exists in database
    const instructor = await getInstructorByCode(instructorCode)
    
    if (!instructor) {
      return {
        isValid: false,
        error: 'Invalid instructor code. Please check with your instructor.'
      }
    }
    
    return {
      isValid: true,
      instructor
    }
  } catch (error) {
    console.error('Error validating instructor code:', error)
    return {
      isValid: false,
      error: 'Failed to validate instructor code. Please try again.'
    }
  }
}

/**
 * Gets user data by email from the appropriate collection
 * @param email - User's email address
 * @returns Promise resolving to user data with type, or null if not found
 */
export const getUserByEmail = async (email: string): Promise<{ user: Student | Instructor; userType: UserType } | null> => {
  try {
    // First check students collection
    const studentQuery = query(collection(db, 'students'), where('email', '==', email))
    const studentSnapshot = await getDocs(studentQuery)
    
    if (!studentSnapshot.empty) {
      const studentDoc = studentSnapshot.docs[0]
      const studentData = studentDoc.data()
      const userWithId = { id: studentDoc.id, ...studentData }
      
      return {
        user: userWithId as unknown as Student,
        userType: 'student'
      }
    }
    
    // Then check instructors collection
    const instructorQuery = query(collection(db, 'instructors'), where('email', '==', email))
    const instructorSnapshot = await getDocs(instructorQuery)
    
    if (!instructorSnapshot.empty) {
      const instructorDoc = instructorSnapshot.docs[0]
      const instructorData = instructorDoc.data()
      const userWithId = { id: instructorDoc.id, ...instructorData }
      
      return {
        user: userWithId as unknown as Instructor,
        userType: 'instructor'
      }
    }
    
    return null // User not found in either collection
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw new Error('Failed to retrieve user data')
  }
}

/**
 * Validates login credentials and user type
 * @param email - User's email address
 * @param selectedUserType - User type selected during login
 * @returns Promise resolving to validation result
 */
export const validateUserLogin = async (email: string, selectedUserType: UserType): Promise<{
  isValid: boolean;
  actualUserType?: UserType;
  user?: Student | Instructor;
  error?: string;
}> => {
  try {
    const userData = await getUserByEmail(email)
    
    if (!userData) {
      return {
        isValid: false,
        error: 'No account found with this email address'
      }
    }
    
    if (userData.userType !== selectedUserType) {
      return {
        isValid: false,
        actualUserType: userData.userType,
        error: `This email is registered as a ${userData.userType}, but you selected ${selectedUserType}`
      }
    }
    
    return {
      isValid: true,
      actualUserType: userData.userType,
      user: userData.user
    }
  } catch (error) {
    console.error('Error validating user login:', error)
    return {
      isValid: false,
      error: 'Failed to validate credentials. Please try again.'
    }
  }
}

/**
 * Saves student registration data to Firestore
 * @param registrationData - Student registration form data
 * @param uid - Firebase Auth user ID
 * @returns Promise resolving to the created student document ID
 */
export const saveStudentRegistration = async (
  registrationData: StudentRegistrationData, 
  uid: string
): Promise<string> => {
  try {
    // Find the instructor by code to get their document reference
    const instructorQuery = query(
      collection(db, 'instructors'), 
      where('instructorCode', '==', registrationData.instructorCode)
    )
    const instructorSnapshot = await getDocs(instructorQuery)
    
    if (instructorSnapshot.empty) {
      throw new Error('Invalid instructor code')
    }
    
    const instructorDoc = instructorSnapshot.docs[0]    // Prepare student data with new schema
    const studentData: Omit<Student, 'id'> = {
      uid, // Firebase Auth UID
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      middleName: registrationData.middleName || '',
      age: registrationData.age,
      email: registrationData.email,
      contactNumber: registrationData.contactNumber,
      gender: registrationData.gender,
      address: registrationData.address || '',
      churchAffiliate: registrationData.churchAffiliate || '',
      instructorReference: registrationData.instructorCode, // Database field is instructorReference
      assessment: 0, // Default assessment score
      studentId: '', // Will be generated after creation
      status: 'active', // Default status for new students
      balance: 0, // Default balance (fully paid)
      remarks: '', // Default empty remarks
      createdAt: new Date().toISOString()
    }
    
    // Add student document to Firestore
    const studentDocRef = await addDoc(collection(db, 'students'), studentData)
    
    // Generate student ID based on document ID
    const studentId = generateStudentId(studentDocRef.id)
      // Update the student document with the generated student ID
    await updateDoc(studentDocRef, { studentId })
    
    // Add student UID to instructor's students array
    await updateDoc(doc(db, 'instructors', instructorDoc.id), {
      students: arrayUnion(uid)
    })
    
    return studentDocRef.id
  } catch (error) {
    console.error('Error saving student registration:', error)
    throw new Error('Failed to save registration data')
  }
}

/**
 * Saves instructor registration data to Firestore
 * @param registrationData - Instructor registration form data
 * @param uid - Firebase Auth user ID
 * @returns Promise resolving to the created instructor document ID
 */
export const saveInstructorRegistration = async (
  registrationData: InstructorRegistrationData, 
  uid: string
): Promise<string> => {
  try {
    // Check if instructor code is already taken
    const codeExists = await isInstructorCodeTaken(registrationData.instructorCode)
    if (codeExists) {
      throw new Error('Instructor code is already in use')
    }
    
    // Prepare instructor data with new schema
    const instructorData: Omit<Instructor, 'id'> = {
      uid, // Firebase Auth UID
      name: registrationData.name,
      email: registrationData.email,
      contactNumber: registrationData.contactNumber,
      instructorCode: registrationData.instructorCode,
      students: [], // Empty students array initially
      createdAt: new Date().toISOString()
    }
    
    // Add instructor document to Firestore
    const instructorDocRef = await addDoc(collection(db, 'instructors'), instructorData)
    
    return instructorDocRef.id
  } catch (error) {
    console.error('Error saving instructor registration:', error)
    throw new Error('Failed to save registration data')
  }
}

/**
 * Gets all students for a specific instructor by instructor code
 * @param instructorCode - 4-digit instructor code
 * @returns Promise resolving to array of students
 */
export const getInstructorStudents = async (instructorCode: string): Promise<Student[]> => {
  try {
    const q = query(
      collection(db, 'students'), 
      where('instructorReference', '==', instructorCode) // Database field is instructorReference
    )
    const querySnapshot = await getDocs(q)
    
    const students: Student[] = []
    querySnapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() } as Student)
    })
    
    return students.sort((a, b) => a.lastName.localeCompare(b.lastName))
    
  } catch (error) {
    console.error('Error getting instructor students:', error)
    return []
  }
}

/**
 * Gets current user data by UID
 * @param uid - Firebase Auth UID
 * @returns Promise resolving to user data with type
 */
export const getCurrentUserData = async (uid: string): Promise<{ user: Student | Instructor; userType: UserType } | null> => {
  try {
    // First check students collection
    const studentQuery = query(collection(db, 'students'), where('uid', '==', uid))
    const studentSnapshot = await getDocs(studentQuery)
    
    if (!studentSnapshot.empty) {
      const studentDoc = studentSnapshot.docs[0]
      const studentData = studentDoc.data()
      const userWithId = { id: studentDoc.id, ...studentData }
      
      return {
        user: userWithId as unknown as Student,
        userType: 'student'
      }
    }
    
    // Then check instructors collection
    const instructorQuery = query(collection(db, 'instructors'), where('uid', '==', uid))
    const instructorSnapshot = await getDocs(instructorQuery)
    
    if (!instructorSnapshot.empty) {
      const instructorDoc = instructorSnapshot.docs[0]
      const instructorData = instructorDoc.data()
      const userWithId = { id: instructorDoc.id, ...instructorData }
      
      return {
        user: userWithId as unknown as Instructor,
        userType: 'instructor'
      }
    }
    
    return null // User not found in either collection
  } catch (error) {
    console.error('Error getting current user data:', error)
    throw new Error('Failed to retrieve user data')
  }
}

/**
 * Gets announcements for a specific instructor
 * @param instructorCode - 4-digit instructor code
 * @returns Promise resolving to array of announcements
 */
export const getAnnouncementsForInstructor = async (instructorCode: string): Promise<any[]> => {
  try {
    // Validate instructorCode
    if (!instructorCode || typeof instructorCode !== 'string') {
      console.warn('Invalid instructor code provided:', instructorCode)
      return []
    }

    const q = query(
      collection(db, 'announcements'),
      where('instructorCode', '==', instructorCode)
    )
    const querySnapshot = await getDocs(q)
    
    const announcements: any[] = []
    querySnapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() })
    })
    
    // Sort by creation date, newest first
    return announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
  } catch (error) {
    console.error('Error getting announcements:', error)
    return []
  }
}

/**
 * Gets announcements for a specific student based on their instructor
 * @param studentUid - Student's Firebase Auth UID
 * @returns Promise resolving to array of announcements
 */
export const getAnnouncementsForStudent = async (studentUid: string): Promise<any[]> => {
  try {
    // Validate studentUid
    if (!studentUid || typeof studentUid !== 'string') {
      console.warn('Invalid student UID provided:', studentUid)
      return []
    }

    // First, get the student's data to find their instructor
    const studentQuery = query(
      collection(db, 'students'),
      where('uid', '==', studentUid)
    )
    const studentSnapshot = await getDocs(studentQuery)
    
    if (studentSnapshot.empty) {
      console.warn('Student not found with UID:', studentUid)
      return []
    }
      const studentData = studentSnapshot.docs[0].data()
    const instructorCode = studentData.instructorReference // Database field is instructorReference
    
    if (!instructorCode) {
      console.warn('Student has no instructor code assigned:', studentUid)
      return []
    }
    
    // Get announcements for the student's instructor
    return await getAnnouncementsForInstructor(instructorCode)
    
  } catch (error) {
    console.error('Error getting announcements for student:', error)
    return []
  }
}

/**
 * Creates a new announcement
 * @param announcementData - Announcement data
 * @returns Promise resolving to the created announcement document ID
 */
export const createAnnouncement = async (announcementData: {
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  instructorCode: string;
  category?: 'general' | 'assignment' | 'exam' | 'event' | 'payment';
  targetAudience?: 'all' | 'specific' | 'class';
  targetStudents?: string[];
  expiresAt?: string;
  isPinned?: boolean;
  attachments?: any[];
}): Promise<string> => {
  try {
    // Get instructor name for the announcement
    const instructorData = await getInstructorByCode(announcementData.instructorCode)
    const instructorName = instructorData?.name || 'Unknown Instructor'

    const announcement = {
      ...announcementData,
      category: announcementData.category || 'general',
      instructorName,
      targetAudience: announcementData.targetAudience || 'all',
      targetStudents: announcementData.targetStudents || [],
      viewedBy: [],
      acknowledgedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published',
      isPinned: announcementData.isPinned || false,
      attachments: announcementData.attachments || [],
      totalViews: 0,
      totalAcknowledgments: 0
    }
    
    const docRef = await addDoc(collection(db, 'announcements'), announcement)
    return docRef.id
  } catch (error) {
    console.error('Error creating announcement:', error)
    throw new Error('Failed to create announcement')
  }
}

/**
 * Marks an announcement as viewed by a student
 * @param announcementId - Announcement document ID
 * @param studentUid - Student's Firebase Auth UID
 * @returns Promise resolving to success status
 */
export const markAnnouncementAsViewed = async (announcementId: string, studentUid: string): Promise<boolean> => {
  try {
    const announcementRef = doc(db, 'announcements', announcementId)
    await updateDoc(announcementRef, {
      viewedBy: arrayUnion(studentUid),
      totalViews: 1 // This would need to be calculated properly in a real app
    })
    return true
  } catch (error) {
    console.error('Error marking announcement as viewed:', error)
    return false
  }
}

/**
 * Marks an announcement as acknowledged by a student
 * @param announcementId - Announcement document ID
 * @param studentUid - Student's Firebase Auth UID
 * @returns Promise resolving to success status
 */
export const markAnnouncementAsAcknowledged = async (announcementId: string, studentUid: string): Promise<boolean> => {
  try {
    const announcementRef = doc(db, 'announcements', announcementId)
    await updateDoc(announcementRef, {
      acknowledgedBy: arrayUnion(studentUid),
      totalAcknowledgments: 1 // This would need to be calculated properly in a real app
    })
    return true
  } catch (error) {
    console.error('Error marking announcement as acknowledged:', error)
    return false
  }
}

/**
 * Update student balance
 * @param studentId - The student's document ID
 * @param newBalance - The new balance amount
 * @returns Promise resolving to success status
 */
export const updateStudentBalance = async (studentId: string, newBalance: number): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'students', studentId), {
      balance: newBalance
    })
    return true
  } catch (error) {
    console.error('Error updating student balance:', error)
    return false
  }
}

/**
 * Update student remarks
 * @param studentId - The student's document ID
 * @param remarks - The new remarks text
 * @returns Promise resolving to success status
 */
export const updateStudentRemarks = async (studentId: string, remarks: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'students', studentId), {
      remarks: remarks
    })
    return true
  } catch (error) {
    console.error('Error updating student remarks:', error)
    return false
  }
}

/**
 * Update both student balance and remarks
 * @param studentId - The student's document ID
 * @param updates - Object containing balance and/or remarks to update
 * @returns Promise resolving to success status
 */
export const updateStudentInfo = async (
  studentId: string, 
  updates: { balance?: number; remarks?: string }
): Promise<boolean> => {
  try {
    const updateData: any = {}
    if (updates.balance !== undefined) updateData.balance = updates.balance
    if (updates.remarks !== undefined) updateData.remarks = updates.remarks
    
    await updateDoc(doc(db, 'students', studentId), updateData)
    return true
  } catch (error) {
    console.error('Error updating student info:', error)
    return false
  }
}
