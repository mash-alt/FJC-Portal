import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import type { Student, Instructor, UserType } from '../types/Users'

interface HamburgerMenuProps {
  userType: UserType | null
  userData: Student | Instructor | null
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ userType, userData }) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('userType')
      localStorage.removeItem('userData')
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }  }

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/profile', label: 'Profile', icon: '👤' },
    ...(userType === 'instructor' ? [
      { to: '/students', label: 'Students', icon: '👥' }
    ] : [])
  ]

  return (
    <div className="hamburger-container">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`hamburger-menu ${isOpen ? 'open' : ''}`}
        aria-expanded={isOpen}
        aria-label="Toggle navigation menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
        <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
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
            <button 
              onClick={() => setIsOpen(false)}
              className="close-button"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mobile-nav-links">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="mobile-nav-link"
                onClick={() => setIsOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                <svg className="nav-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="mobile-nav-footer">
            <button onClick={handleLogout} className="logout-button">
              <span className="nav-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HamburgerMenu