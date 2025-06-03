import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import { getInstructorStudents, getAnnouncementsForInstructor, getAnnouncementsForStudent, createAnnouncement } from '../utils/auth'
import type { Student, Instructor, UserType, Announcement } from '../types/Users'
import '../styles/Dashboard.css'

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [userData, setUserData] = useState<Student | Instructor | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    category: 'general' as 'general' | 'assignment' | 'exam' | 'event' | 'payment'
  })
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => {
    loadDashboardData()
  }, [navigate])

  const loadDashboardData = async () => {
    try {
      // Get user data from localStorage
      const storedUserType = localStorage.getItem('userType') as UserType
      const storedUserData = localStorage.getItem('userData')
      
      if (storedUserType && storedUserData) {
        const parsedUserData = JSON.parse(storedUserData)
        setUserType(storedUserType)
        setUserData(parsedUserData)        // Load additional data for instructors
        if (storedUserType === 'instructor') {
          const instructorData = parsedUserData as Instructor
          console.log('Loading data for instructor:', instructorData.instructorCode)
          
          // Load students
          const studentsData = await getInstructorStudents(instructorData.instructorCode)
          setStudents(studentsData)

          // Load announcements
          const announcementsData = await getAnnouncementsForInstructor(instructorData.instructorCode)
          setAnnouncements(announcementsData)} else if (storedUserType === 'student') {
          // Load announcements for student using their UID
          const studentData = parsedUserData as Student
          console.log('Loading announcements for student:', studentData.uid)
          const announcementsData = await getAnnouncementsForStudent(studentData.uid)
          setAnnouncements(announcementsData)
        }
      } else {
        // If no user data, redirect to login
        navigate('/login')
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData || userType !== 'instructor') return

    try {
      const instructorData = userData as Instructor
      await createAnnouncement({
        title: announcementForm.title,
        content: announcementForm.content,
        priority: announcementForm.priority,
        category: announcementForm.category,
        instructorCode: instructorData.instructorCode
      })

      // Reset form and refresh announcements
      setAnnouncementForm({ title: '', content: '', priority: 'normal', category: 'general' })
      setShowAnnouncementForm(false)
      
      // Reload announcements
      const announcementsData = await getAnnouncementsForInstructor(instructorData.instructorCode)
      setAnnouncements(announcementsData)
    } catch (error) {
      console.error('Error creating announcement:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('userType')
      localStorage.removeItem('userData')
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          {/* Hamburger Menu */}
          <div className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </div>
          <h1>Portal Sabido</h1>
        </div>
      </header>      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-nav-header">
            <div className="user-info">
              <div className="user-avatar">
                {userType === 'student' 
                  ? (userData as Student)?.firstName?.charAt(0) || 'S'
                  : (userData as Instructor)?.name?.charAt(0) || 'I'
                }
              </div>
              <div className="user-details">
                <h3>
                  {userType === 'student' 
                    ? `${(userData as Student)?.firstName} ${(userData as Student)?.lastName}`
                    : (userData as Instructor)?.name
                  }
                </h3>
                <p className="user-type">{userType === 'student' ? 'Student' : 'Instructor'}</p>
                {userType === 'student' && (
                  <p className="user-id">ID: {(userData as Student)?.studentId}</p>
                )}
                {userType === 'instructor' && (
                  <p className="user-code">Code: {(userData as Instructor)?.instructorCode}</p>
                )}
              </div>
            </div>
            <button className="mobile-nav-close" onClick={toggleMenu}>×</button>
          </div>
          
          <div className="mobile-nav-links">
            <Link to="/dashboard" className="mobile-nav-link" onClick={toggleMenu}>
              <span className="nav-icon">🏠</span>
              <span>Dashboard</span>
            </Link>            <Link to="/profile" className="mobile-nav-link" onClick={toggleMenu}>
              <span className="nav-icon">👤</span>
              <span>Profile</span>
            </Link>
            
            {/* Instructor-specific menu items */}
            {userType === 'instructor' && (
              <>
                <Link to="/students" className="mobile-nav-link" onClick={toggleMenu}>
                  <span className="nav-icon">👥</span>
                  <span>Students</span>
                </Link>
                <Link to="/manage-grades" className="mobile-nav-link" onClick={toggleMenu}>
                  <span className="nav-icon">📈</span>
                  <span>Grade Management</span>
                </Link>
                <Link to="/payments" className="mobile-nav-link" onClick={toggleMenu}>
                  <span className="nav-icon">💳</span>
                  <span>Payments</span>
                </Link>
              </>
            )}
            
            <button onClick={handleLogout} className="mobile-nav-link logout-link">
              <span className="nav-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>{/* Main Content */}
      <main className="dashboard-main">
        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        ) : userType && userData ? (
          <div className="fade-in">
            {/* Welcome Section */}
            <div style={{ marginBottom: '2rem' }}>              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                Welcome Back, {userType === 'student' ? 
                  `${(userData as Student)?.firstName || 'Student'} ${(userData as Student)?.lastName || ''}` : 
                  (userData as Instructor)?.name || 'Instructor'}!
              </h2>
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                {userType === 'student' ? 
                  "Stay updated with your studies and announcements." :
                  "Manage your students and share important updates."
                }
              </p>            </div>

            {/* Student Information Cards - Only for Students */}
            {userType === 'student' && userData && (
              <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>                <div className="stat-card">
                  <div className="stat-number blue">
                    ₱{((userData as Student).balance || 0).toFixed(2)}
                  </div>
                  <div className="stat-label">
                    {((userData as Student).balance || 0) === 0 ? 'Fully Paid' : 'Balance Due'}
                  </div>
                </div>
                <div className="stat-card">
                  <div className={`stat-number ${((userData as Student).balance || 0) === 0 ? 'green' : 'orange'}`}>
                    {((userData as Student).balance || 0) === 0 ? 'Paid' : 'Pending'}
                  </div>
                  <div className="stat-label">Payment Status</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number purple">
                    {(userData as Student).remarks || 'No remarks'}
                  </div>
                  <div className="stat-label">Instructor Remarks</div>
                </div>                <div className="stat-card">
                  <div className={`stat-number ${((userData as Student).status || 'active') === 'active' ? 'green' : 'orange'}`}>
                    {((userData as Student).status || 'active').charAt(0).toUpperCase() + ((userData as Student).status || 'active').slice(1)}
                  </div>
                  <div className="stat-label">Academic Status</div>
                </div>
              </div>
            )}

            {/* Statistics Cards - Only for Instructors */}            {userType === 'instructor' && (
              <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                  <div className="stat-number blue">{students.length}</div>
                  <div className="stat-label">Total Students</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number green">{students.filter(s => (s.balance || 0) === 0).length}</div>
                  <div className="stat-label">Paid Students</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number orange">{students.filter(s => (s.balance || 0) > 0).length}</div>
                  <div className="stat-label">Pending Payments</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number purple">{announcements.length}</div>
                  <div className="stat-label">Announcements</div>
                </div>
              </div>
            )}

            {/* Announcements Section */}
            <div className="announcements-section" style={{ marginBottom: '2rem' }}>
              <div className="section-header">
                <h3>📢 Announcements</h3>
                {userType === 'instructor' && (
                  <button 
                    onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                    className="btn btn-primary"
                  >
                    {showAnnouncementForm ? 'Cancel' : '+ New Announcement'}
                  </button>
                )}
              </div>

              {/* Announcement Form - Only for Instructors */}
              {userType === 'instructor' && showAnnouncementForm && (
                <div className="announcement-form">
                  <form onSubmit={handleCreateAnnouncement}>
                    <div className="form-group">
                      <label htmlFor="title">Announcement Title</label>
                      <input
                        id="title"
                        type="text"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter announcement title..."
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="content">Message</label>
                      <textarea
                        id="content"
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter your announcement message..."
                        rows={4}
                        required
                      />
                    </div>                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                          id="priority"
                          value={announcementForm.priority}
                          onChange={(e) => setAnnouncementForm(prev => ({ ...prev, priority: e.target.value as any }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="important">Important</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                          id="category"
                          value={announcementForm.category}
                          onChange={(e) => setAnnouncementForm(prev => ({ ...prev, category: e.target.value as any }))}
                        >
                          <option value="general">General</option>
                          <option value="assignment">Assignment</option>
                          <option value="exam">Exam</option>
                          <option value="event">Event</option>
                          <option value="payment">Payment</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">Post Announcement</button>
                      <button type="button" onClick={() => setShowAnnouncementForm(false)} className="btn btn-outline">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Announcements List */}
              <div className="announcements-list">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className={`announcement-card ${announcement.priority}`}>
                      <div className="announcement-header">
                        <h4>{announcement.title}</h4>                        <div className="announcement-meta">
                          <span className={`priority-badge ${announcement.priority}`}>
                            {announcement.priority}
                          </span>
                          {announcement.category && (
                            <span className={`category-badge ${announcement.category}`}>
                              {announcement.category}
                            </span>
                          )}
                          <span className="announcement-date">
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="announcement-content">
                        <p>{announcement.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-announcements">
                    <p>No announcements yet.</p>
                    {userType === 'instructor' && (
                      <p>Create your first announcement to keep students informed!</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="dashboard-grid">
              {/* Profile Card - Common for both roles */}
              <div className="card">
                <div className="card-header">
                  <div className="card-icon blue">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="card-title">My Profile</h3>
                    <p className="card-subtitle">View and update your information</p>
                  </div>
                </div>
                <div className="card-action">
                  <Link to="/profile" className="card-button">
                    View Profile
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {userType === 'instructor' && (
                <>
                  {/* Instructor Student Management Card */}
                  <div className="card">
                    <div className="card-header">
                      <div className="card-icon green">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="card-title">Manage Students</h3>
                        <p className="card-subtitle">View student information, balance, and remarks</p>
                      </div>
                    </div>
                    <div className="card-action">
                      <Link to="/students" className="card-button">
                        View Students ({students.length})
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard