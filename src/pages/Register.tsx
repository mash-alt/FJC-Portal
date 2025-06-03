import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import { saveStudentRegistration, validateInstructorCode } from '../utils/auth'
import type { StudentRegistrationData } from '../types/Users'
import '../styles/Auth.css'

const Register = () => {  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    age: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    gender: '',
    instructorCode: '',
    address: '',
    churchAffiliate: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [instructorInfo, setInstructorInfo] = useState<string>('')
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const navigate = useNavigate()
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Real-time instructor code validation
    if (name === 'instructorCode') {
      setInstructorInfo('')
      if (value.length === 4 && /^\d{4}$/.test(value)) {
        validateInstructorCodeRealTime(value)
      }
    }
  }

  const validateInstructorCodeRealTime = async (code: string) => {
    setIsValidatingCode(true)
    try {
      const validation = await validateInstructorCode(code)
      if (validation.isValid && validation.instructor) {
        setInstructorInfo(`Instructor: ${validation.instructor.name}`)
      } else {
        setInstructorInfo('')
      }
    } catch (error) {
      setInstructorInfo('')
    } finally {
      setIsValidatingCode(false)
    }
  }
  const validateForm = async () => {
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      setError('Please enter a valid age')
      return false
    }    if (!formData.email) {
      setError('Email is required')
      return false
    }
    if (!formData.contactNumber.trim()) {
      setError('Contact number is required')
      return false
    }
    if (!/^[\d\s\-\+\(\)]+$/.test(formData.contactNumber)) {
      setError('Please enter a valid contact number')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }    if (!formData.gender) {
      setError('Please select your gender')
      return false
    }
    
    // Enhanced instructor code validation
    const instructorValidation = await validateInstructorCode(formData.instructorCode)
    if (!instructorValidation.isValid) {
      setError(instructorValidation.error || 'Invalid instructor code')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const isValid = await validateForm()
    if (!isValid) {
      return
    }

    setIsLoading(true)

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
        // Prepare student registration data
      const registrationData: StudentRegistrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        age: parseInt(formData.age),
        email: formData.email,
        contactNumber: formData.contactNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        gender: formData.gender,
        instructorCode: formData.instructorCode,
        address: formData.address,
        churchAffiliate: formData.churchAffiliate
      }
      
      // Save student data to Firestore
      const studentDocId = await saveStudentRegistration(registrationData, user.uid)
      
      // Store user data in localStorage for session management
      const userData = {
        uid: user.uid,
        email: user.email,
        userType: 'student' as const,
        firstName: formData.firstName,
        lastName: formData.lastName,
        documentId: studentDocId
      }
      localStorage.setItem('userData', JSON.stringify(userData))
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper register-wrapper">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>            <h2 className="auth-title">Student Registration</h2>
            <p className="auth-subtitle">Create your student account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name Fields Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Middle Name and Age Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="middleName" className="form-label">
                  Middle Name
                </label>
                <input
                  id="middleName"
                  name="middleName"
                  type="text"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter middle name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="age" className="form-label">
                  Age *
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter age"
                />
              </div>
            </div>            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <div className="form-input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input with-icon"
                  placeholder="Enter your email"
                />
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            {/* Contact Number Input */}
            <div className="form-group">
              <label htmlFor="contactNumber" className="form-label">
                Contact Number *
              </label>
              <div className="form-input-wrapper">
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="form-input with-icon"
                  placeholder="Enter your contact number"
                />
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>

            {/* Password Fields Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input with-icon"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-icon-button input-icon"
                  >
                    {showPassword ? (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input with-icon"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="input-icon-button input-icon"
                  >
                    {showConfirmPassword ? (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Gender and Instructor Code Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>              <div className="form-group">
                <label htmlFor="instructorCode" className="form-label">
                  Instructor Code *
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="instructorCode"
                    name="instructorCode"
                    type="text"
                    required
                    maxLength={4}
                    value={formData.instructorCode}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="4-digit code"
                  />
                  {isValidatingCode && (
                    <div className="input-validation-spinner">
                      <svg className="loading-spinner-small" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                {instructorInfo && (
                  <p className="form-success-text">
                    ✓ {instructorInfo}
                  </p>
                )}
                <p className="form-helper-text">
                  Enter the 4-digit code provided by your instructor
                </p>
              </div>
            </div>

            {/* Optional Fields Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your address (optional)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="churchAffiliate" className="form-label">
                  Church Affiliate
                </label>
                <input
                  id="churchAffiliate"
                  name="churchAffiliate"
                  type="text"
                  value={formData.churchAffiliate}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter church name (optional)"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <div className="submit-button-content">
                  <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>          {/* Navigation Links */}
          <div className="auth-footer">
            <p>
              Want to register as an instructor?{' '}
              <Link
                to="/instructor-register"
                className="auth-link"
              >
                Instructor Registration
              </Link>
            </p>
            <p>
              Already have an account?{' '}
              <Link
                to="/login"
                className="auth-link"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="page-footer">
          <p>Portal Sabido © 2025. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Register