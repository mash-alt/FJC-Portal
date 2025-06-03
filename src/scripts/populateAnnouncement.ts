import { config } from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query } from 'firebase/firestore'

// Load environment variables
config()

// Firebase configuration - using environment variables like the main app
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface SampleAnnouncement {
  title: string
  content: string
  priority: 'normal' | 'important' | 'urgent'
  category: 'general' | 'assignment' | 'exam' | 'event' | 'payment'
  instructorCode: string
  instructorName: string
  targetAudience: 'all' | 'specific' | 'class'
  targetStudents: string[]
  viewedBy: string[]
  acknowledgedBy: string[]
  createdAt: string
  updatedAt: string
  expiresAt?: string
  status: 'draft' | 'published' | 'archived'
  isPinned: boolean
  attachments: any[]
  totalViews: number
  totalAcknowledgments: number
}

const sampleAnnouncements: Omit<SampleAnnouncement, 'instructorCode' | 'instructorName'>[] = [
  {
    title: "📚 Welcome to Portal Sabido!",
    content: "Welcome to our learning platform! Here you'll find all your course materials, assignments, and important updates. Make sure to check this dashboard regularly for announcements.",
    priority: 'important',
    category: 'general',
    targetAudience: 'all',
    targetStudents: [],
    viewedBy: [],
    acknowledgedBy: [],
    createdAt: new Date('2025-06-01').toISOString(),
    updatedAt: new Date('2025-06-01').toISOString(),
    status: 'published',
    isPinned: true,
    attachments: [],
    totalViews: 0,
    totalAcknowledgments: 0
  },
  {
    title: "📝 Weekly Assignment #1 - Due Friday",
    content: "Your first weekly assignment is now available. Please complete the exercises in Chapter 1 and submit your answers by Friday, 5:00 PM. Late submissions will result in point deductions. If you have any questions, feel free to reach out during office hours.",
    priority: 'urgent',
    category: 'assignment',
    targetAudience: 'all',
    targetStudents: [],
    viewedBy: [],
    acknowledgedBy: [],
    createdAt: new Date('2025-06-02').toISOString(),
    updatedAt: new Date('2025-06-02').toISOString(),
    expiresAt: new Date('2025-06-06').toISOString(),
    status: 'published',
    isPinned: true,
    attachments: [],
    totalViews: 0,
    totalAcknowledgments: 0
  },
  {
    title: "💰 Tuition Payment Reminder",
    content: "This is a friendly reminder that tuition payments for this month are due by June 15th. Please ensure your payments are up to date to avoid any disruption to your learning. Contact the office if you need assistance with payment arrangements.",
    priority: 'important',
    category: 'payment',
    targetAudience: 'all',
    targetStudents: [],
    viewedBy: [],
    acknowledgedBy: [],
    createdAt: new Date('2025-06-03').toISOString(),
    updatedAt: new Date('2025-06-03').toISOString(),
    expiresAt: new Date('2025-06-15').toISOString(),
    status: 'published',
    isPinned: false,
    attachments: [],
    totalViews: 0,
    totalAcknowledgments: 0
  },
  {
    title: "📅 Class Schedule Update",
    content: "Please note that next Wednesday's class (June 7th) will be moved to Thursday (June 8th) at the same time due to a scheduling conflict. All other classes remain as scheduled. Thank you for your understanding.",
    priority: 'normal',
    category: 'event',
    targetAudience: 'all',
    targetStudents: [],
    viewedBy: [],
    acknowledgedBy: [],
    createdAt: new Date('2025-06-02').toISOString(),
    updatedAt: new Date('2025-06-02').toISOString(),
    status: 'published',
    isPinned: false,
    attachments: [],
    totalViews: 0,
    totalAcknowledgments: 0
  },
  {
    title: "🎯 Study Tips for Better Learning",
    content: "Here are some effective study strategies: 1) Create a dedicated study space, 2) Break down large topics into smaller chunks, 3) Practice active recall by testing yourself, 4) Form study groups with classmates, 5) Don't hesitate to ask questions. Remember, consistency is key!",
    priority: 'normal',
    category: 'general',
    targetAudience: 'all',
    targetStudents: [],
    viewedBy: [],
    acknowledgedBy: [],
    createdAt: new Date('2025-05-30').toISOString(),
    updatedAt: new Date('2025-05-30').toISOString(),
    status: 'published',
    isPinned: false,
    attachments: [],
    totalViews: 0,
    totalAcknowledgments: 0
  },
  {
    title: "📊 Midterm Exam Schedule",
    content: "Midterm examinations will be held from June 20-22, 2025. The exam schedule will be posted next week. Please start preparing early and review all materials covered so far. Office hours will be extended during the week before exams for additional support.",
    priority: 'important',
    category: 'exam',
    targetAudience: 'all',
    targetStudents: [],
    viewedBy: [],
    acknowledgedBy: [],
    createdAt: new Date('2025-06-01').toISOString(),
    updatedAt: new Date('2025-06-01').toISOString(),
    status: 'published',
    isPinned: false,
    attachments: [],
    totalViews: 0,
    totalAcknowledgments: 0
  },
  {
    title: "🎉 Student Achievement Recognition",
    content: "Congratulations to all students who excelled in last week's quiz! Your hard work and dedication are truly appreciated. Keep up the excellent work and continue striving for academic excellence.",
    priority: 'normal',
    category: 'general',
    targetAudience: 'all',
    targetStudents: [],
    viewedBy: [],
    acknowledgedBy: [],
    createdAt: new Date('2025-05-28').toISOString(),
    updatedAt: new Date('2025-05-28').toISOString(),
    status: 'published',
    isPinned: false,
    attachments: [],
    totalViews: 0,
    totalAcknowledgments: 0
  },
  {
    title: "📱 Portal Features Update",
    content: "We've added new features to the portal including improved grade tracking and better mobile responsiveness. Explore the new interface and let us know your feedback. We're constantly working to improve your learning experience.",
    priority: 'normal',
    category: 'general',
    targetAudience: 'all',
    targetStudents: [],
    viewedBy: [],
    acknowledgedBy: [],
    createdAt: new Date('2025-05-29').toISOString(),
    updatedAt: new Date('2025-05-29').toISOString(),
    status: 'published',
    isPinned: false,
    attachments: [],
    totalViews: 0,
    totalAcknowledgments: 0
  }
]

async function getInstructors(): Promise<Array<{id: string, instructorCode: string, name: string}>> {
  try {
    const instructorsRef = collection(db, 'instructors')
    const snapshot = await getDocs(instructorsRef)
    
    const instructors: Array<{id: string, instructorCode: string, name: string}> = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      instructors.push({
        id: doc.id,
        instructorCode: data.instructorCode,
        name: data.name
      })
    })
    
    return instructors
  } catch (error) {
    console.error('Error fetching instructors:', error)
    return []
  }
}

async function populateAnnouncements() {
  try {
    console.log('🚀 Starting announcement population...')
    
    // Get all instructors
    const instructors = await getInstructors()
    
    if (instructors.length === 0) {
      console.log('❌ No instructors found. Please create some instructors first.')
      return
    }
    
    console.log(`📋 Found ${instructors.length} instructor(s):`)
    instructors.forEach(instructor => {
      console.log(`   - ${instructor.name} (Code: ${instructor.instructorCode})`)
    })
    
    // Check if announcements already exist
    const existingAnnouncementsQuery = query(collection(db, 'announcements'))
    const existingSnapshot = await getDocs(existingAnnouncementsQuery)
    
    if (!existingSnapshot.empty) {
      console.log(`⚠️  Found ${existingSnapshot.size} existing announcements. Skipping population.`)
      console.log('   Delete existing announcements if you want to repopulate.')
      return
    }
    
    let totalCreated = 0
    
    // Create announcements for each instructor
    for (const instructor of instructors) {
      console.log(`\n📢 Creating announcements for ${instructor.name}...`)
      
      for (const announcement of sampleAnnouncements) {
        const announcementData: SampleAnnouncement = {
          ...announcement,
          instructorCode: instructor.instructorCode,
          instructorName: instructor.name
        }
        
        try {
          const docRef = await addDoc(collection(db, 'announcements'), announcementData)
          console.log(`   ✅ Created: "${announcement.title}" (ID: ${docRef.id})`)
          totalCreated++
        } catch (error) {
          console.error(`   ❌ Failed to create: "${announcement.title}"`, error)
        }
      }
    }
    
    console.log(`\n🎉 Successfully populated ${totalCreated} announcements!`)
    console.log('📱 You can now view them in your dashboard.')
    
  } catch (error) {
    console.error('❌ Error populating announcements:', error)
  }
}

async function clearAnnouncements() {
  try {
    console.log('🧹 Clearing all announcements...')
    
    const announcementsRef = collection(db, 'announcements')
    const snapshot = await getDocs(announcementsRef)
    
    if (snapshot.empty) {
      console.log('📭 No announcements to clear.')
      return
    }
    
    console.log(`🗑️  Found ${snapshot.size} announcements to delete...`)
    
    // Note: This would require admin SDK for batch deletes in production
    // For now, we'll just log what would be deleted
    snapshot.forEach((doc) => {
      const data = doc.data()
      console.log(`   - Would delete: "${data.title}" (${doc.id})`)
    })
    
    console.log('⚠️  Actual deletion requires admin privileges.')
    console.log('   Use Firebase Console to manually delete if needed.')
    
  } catch (error) {
    console.error('❌ Error clearing announcements:', error)
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'clear':
      await clearAnnouncements()
      break
    case 'populate':
    default:
      await populateAnnouncements()
      break
  }
  
  process.exit(0)
}

// Run the script
main().catch(console.error)