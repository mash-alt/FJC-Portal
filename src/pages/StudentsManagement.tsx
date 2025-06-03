import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HamburgerMenu from '../components/HamburgerMenu'
import { getInstructorStudents, updateStudentInfo } from '../utils/auth'
import type { Student, Instructor, UserType } from '../types/Users'
import '../styles/Dashboard.css'

const StudentsManagement = () => {
  const [userType, setUserType] = useState<UserType | null>(null)
  const [userData, setUserData] = useState<Instructor | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingStudent, setEditingStudent] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    balance: 0,
    remarks: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    loadStudentsData()
  }, [navigate])

  const loadStudentsData = async () => {
    try {
      // Get user data from localStorage
      const storedUserType = localStorage.getItem('userType') as UserType
      const storedUserData = localStorage.getItem('userData')
      
      if (storedUserType === 'instructor' && storedUserData) {
        const parsedUserData = JSON.parse(storedUserData) as Instructor
        setUserType(storedUserType)
        setUserData(parsedUserData)
        
        // Load students
        const studentsData = await getInstructorStudents(parsedUserData.instructorCode)
        setStudents(studentsData)
      } else {
        // If not instructor, redirect to dashboard
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error loading students data:', error)
      navigate('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student.id!)
    setEditForm({
      balance: student.balance || 0,
      remarks: student.remarks || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingStudent(null)
    setEditForm({ balance: 0, remarks: '' })
  }

  const handleSaveChanges = async (studentId: string) => {
    try {
      const success = await updateStudentInfo(studentId, {
        balance: editForm.balance,
        remarks: editForm.remarks
      })

      if (success) {
        // Update local state
        setStudents(prev => prev.map(student => 
          student.id === studentId 
            ? { ...student, balance: editForm.balance, remarks: editForm.remarks }
            : student
        ))
        setEditingStudent(null)
        setEditForm({ balance: 0, remarks: '' })
      } else {
        alert('Failed to update student information. Please try again.')
      }
    } catch (error) {
      console.error('Error saving student changes:', error)
      alert('Error updating student information. Please try again.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }))
  }

  const getPaymentStatus = (balance: number) => {
    if (balance === 0) return { status: 'paid', label: 'Paid', class: 'paid' }
    if (balance > 0) return { status: 'pending', label: 'Pending', class: 'pending' }
    return { status: 'overpaid', label: 'Overpaid', class: 'overpaid' }
  }
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading students...</p>
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
          <h1>Student Management</h1>
        </div>
        <div className="header-right">
          <div className="students-summary">
            <span className="total-students">
              Total Students: <strong>{students.length}</strong>
            </span>
            <span className="paid-students">
              Paid: <strong>{students.filter(s => (s.balance || 0) === 0).length}</strong>
            </span>
            <span className="pending-students">
              Pending: <strong>{students.filter(s => (s.balance || 0) > 0).length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Students Content */}
      <div className="dashboard-content">
        <div className="students-container">
          {students.length > 0 ? (
            <div className="students-grid">
              {students.map((student) => {
                const paymentStatus = getPaymentStatus(student.balance || 0)
                const isEditing = editingStudent === student.id
                
                return (
                  <div key={student.id} className="student-card">
                    <div className="student-header">
                      <div className="student-info">
                        <div className="student-avatar">
                          {student.firstName.charAt(0)}
                        </div>
                        <div className="student-details">
                          <h3>{`${student.firstName} ${student.lastName}`}</h3>
                          <p className="student-id">ID: {student.studentId}</p>
                          <p className="student-contact">{student.email}</p>
                        </div>
                      </div>
                      <div className="student-status">
                        <span className={`payment-badge ${paymentStatus.class}`}>
                          {paymentStatus.label}
                        </span>
                      </div>
                    </div>

                    <div className="student-content">
                      <div className="student-field">
                        <label>Balance:</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="balance"
                            value={editForm.balance}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className="edit-input"
                          />
                        ) : (
                          <span className={`balance ${paymentStatus.class}`}>
                            ₱{(student.balance || 0).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="student-field">
                        <label>Remarks:</label>
                        {isEditing ? (
                          <textarea
                            name="remarks"
                            value={editForm.remarks}
                            onChange={handleInputChange}
                            placeholder="Add remarks about this student..."
                            rows={3}
                            className="edit-textarea"
                          />
                        ) : (
                          <p className="remarks">
                            {student.remarks || 'No remarks yet.'}
                          </p>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div className="student-additional-info">
                        <div className="info-row">
                          <span className="info-label">Age:</span>
                          <span>{student.age}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Gender:</span>
                          <span>{student.gender}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Status:</span>
                          <span className={`status-badge ${student.status}`}>
                            {student.status}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Contact:</span>
                          <span>{student.contactNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="student-actions">
                      {isEditing ? (
                        <div className="edit-actions">
                          <button 
                            onClick={() => handleSaveChanges(student.id!)}
                            className="btn btn-primary"
                          >
                            Save Changes
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="btn btn-outline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleEditStudent(student)}
                          className="btn btn-outline"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-students">
              <div className="empty-icon">👥</div>
              <h3>No Students Yet</h3>
              <p>Students who register with your instructor code will appear here.</p>
              <p>Your instructor code: <strong>{userData?.instructorCode}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentsManagement