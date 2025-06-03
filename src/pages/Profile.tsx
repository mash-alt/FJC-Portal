import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HamburgerMenu from '../components/HamburgerMenu'
import type { Student, Instructor, UserType } from '../types/Users'
import '../styles/Dashboard.css'

const Profile = () => {
  const [userType, setUserType] = useState<UserType | null>(null)
  const [userData, setUserData] = useState<Student | Instructor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    contactNumber: '',
    email: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    loadUserData()
  }, [navigate])

  const loadUserData = async () => {
    try {
      // Get user data from localStorage
      const storedUserType = localStorage.getItem('userType') as UserType
      const storedUserData = localStorage.getItem('userData')
      
      if (storedUserType && storedUserData) {
        const parsedUserData = JSON.parse(storedUserData)
        setUserType(storedUserType)
        setUserData(parsedUserData)
        
        // Initialize edit form with current data
        setEditForm({
          contactNumber: parsedUserData.contactNumber || '',
          email: parsedUserData.email || ''
        })
      } else {
        // If no user data, redirect to login
        navigate('/login')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveChanges = async () => {
    try {
      // Here you would typically update the database
      // For now, we'll just update localStorage
      if (userData) {
        const updatedUserData = {
          ...userData,
          contactNumber: editForm.contactNumber,
          email: editForm.email
        }
        
        localStorage.setItem('userData', JSON.stringify(updatedUserData))
        setUserData(updatedUserData)
        setIsEditing(false)
        
        // Show success message (you might want to add a toast notification)
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    // Reset form to original values
    if (userData) {
      setEditForm({
        contactNumber: userData.contactNumber || '',
        email: userData.email || ''
      })
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <HamburgerMenu userType={userType} userData={userData} />
          <h1>My Profile</h1>
        </div>
        <div className="header-right">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`edit-button ${isEditing ? 'cancel' : 'edit'}`}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="dashboard-content">
        <div className="profile-container">
          {/* Profile Header Card */}
          <div className="profile-header-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {userType === 'student' 
                  ? (userData as Student)?.firstName?.charAt(0) || 'S'
                  : (userData as Instructor)?.name?.charAt(0) || 'I'
                }
              </div>
              <div className="user-type-badge">
                {userType === 'student' ? 'Student' : 'Instructor'}
              </div>
            </div>
            <div className="profile-header-info">
              <h2>
                {userType === 'student' 
                  ? `${(userData as Student)?.firstName} ${(userData as Student)?.lastName}`
                  : (userData as Instructor)?.name
                }
              </h2>
              <p className="profile-subtitle">
                {userType === 'student' && `Student ID: ${(userData as Student)?.studentId}`}
                {userType === 'instructor' && `Instructor Code: ${(userData as Instructor)?.instructorCode}`}
              </p>
              <p className="member-since">
                Member since {new Date(userData?.createdAt || '').toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Profile Details Cards */}
          <div className="profile-details">
            {/* Personal Information */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Personal Information</h3>
              </div>
              <div className="card-content">
                {userType === 'student' ? (
                  <div className="info-grid">
                    <div className="info-item">
                      <label>First Name</label>
                      <p>{(userData as Student)?.firstName}</p>
                    </div>
                    <div className="info-item">
                      <label>Last Name</label>
                      <p>{(userData as Student)?.lastName}</p>
                    </div>
                    {(userData as Student)?.middleName && (
                      <div className="info-item">
                        <label>Middle Name</label>
                        <p>{(userData as Student)?.middleName}</p>
                      </div>
                    )}
                    <div className="info-item">
                      <label>Age</label>
                      <p>{(userData as Student)?.age}</p>
                    </div>
                    <div className="info-item">
                      <label>Gender</label>
                      <p>{(userData as Student)?.gender}</p>
                    </div>
                    <div className="info-item">
                      <label>Status</label>
                      <p className={`status-badge ${(userData as Student)?.status}`}>
                        {(userData as Student)?.status}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <p>{(userData as Instructor)?.name}</p>
                    </div>
                    <div className="info-item">
                      <label>Instructor Code</label>
                      <p className="instructor-code">{(userData as Instructor)?.instructorCode}</p>
                    </div>
                    <div className="info-item">
                      <label>Total Students</label>
                      <p>{(userData as Instructor)?.students?.length || 0}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Contact Information</h3>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <p>{userData?.email}</p>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Contact Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="contactNumber"
                        value={editForm.contactNumber}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <p>{userData?.contactNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information for Students */}
            {userType === 'student' && (
              <div className="profile-card">
                <div className="card-header">
                  <h3>Academic Information</h3>
                </div>
                <div className="card-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Assessment Score</label>
                      <p className="assessment-score">{(userData as Student)?.assessment || 0}</p>
                    </div>
                    <div className="info-item">
                      <label>Instructor Reference</label>
                      <p>{(userData as Student)?.instructorReference}</p>
                    </div>
                    {(userData as Student)?.address && (
                      <div className="info-item full-width">
                        <label>Address</label>
                        <p>{(userData as Student)?.address}</p>
                      </div>
                    )}
                    {(userData as Student)?.churchAffiliate && (
                      <div className="info-item full-width">
                        <label>Church Affiliate</label>
                        <p>{(userData as Student)?.churchAffiliate}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Changes Button */}
          {isEditing && (
            <div className="profile-actions">
              <button onClick={handleSaveChanges} className="save-button">
                Save Changes
              </button>
              <button onClick={handleCancelEdit} className="cancel-button">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile