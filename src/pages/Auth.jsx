import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api, { setAuthToken, setStoredUser, getStoredUser } from '../api/client';

/**
 * Auth Page — Unified User Authentication (Login & Register).
 * Saves new accounts directly into the MongoDB `users` collection.
 * 
 * @param {Object} props
 * @param {'login'|'register'} [props.defaultMode='login'] - Default active tab
 */
const Auth = ({ defaultMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathMode = location.pathname === '/register' ? 'register' : location.pathname === '/login' ? 'login' : null;
  const [activeTab, setActiveTab] = useState(defaultMode);
  const mode = pathMode || activeTab;
  const setMode = setActiveTab;
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
    if (successMessage) setSuccessMessage('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format (e.g. name@campus.edu).';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (mode === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required.';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters.';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          role: formData.role || 'student',
        };

        const res = await api.auth.register(payload);
        const registeredUser = res?.user || res?.data?.user;

        setSuccessMessage('Account created successfully! Connecting to campus registry...');
        setCurrentUser(registeredUser);
        window.dispatchEvent(new Event('auth-change'));

        setTimeout(() => {
          navigate('/items');
        }, 800);
      } else {
        // Mode === 'login'
        const res = await api.auth.login(
          formData.email.toLowerCase().trim(),
          formData.password
        );
        const loggedInUser = res?.user || res?.data?.user;

        setSuccessMessage('Logged in successfully! Redirecting...');
        setCurrentUser(loggedInUser);
        window.dispatchEvent(new Event('auth-change'));

        setTimeout(() => {
          navigate('/items');
        }, 600);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setServerError(
        err.message || 'Authentication failed. Please verify your credentials and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // One-click demo sign-in for evaluation
  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    setServerError('');
    try {
      const res = await api.auth.getDemoToken();
      const demoUser = res?.user || res?.data?.user;
      setSuccessMessage('Signed in with Demo Student account!');
      setCurrentUser(demoUser);
      window.dispatchEvent(new Event('auth-change'));

      setTimeout(() => {
        navigate('/items');
      }, 500);
    } catch (err) {
      setServerError(err.message || 'Could not connect to demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout if already logged in
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // offline logout
    }
    setAuthToken(null);
    setStoredUser(null);
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth-change'));
    setSuccessMessage('You have been logged out.');
  };

  return (
    <main className="page auth-page">
      <div className="auth-card">
        {currentUser ? (
          <div className="auth-signed-in">
            <span className="auth-icon">✅</span>
            <h2 className="auth-title">Currently Signed In</h2>
            <div className="auth-user-badge">
              <p className="auth-user-name"><strong>{currentUser.name}</strong></p>
              <p className="auth-user-email">{currentUser.email}</p>
              <span className={`role-pill role-pill--${currentUser.role || 'student'}`}>
                Role: {currentUser.role || 'student'}
              </span>
            </div>

            <div className="auth-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link to="/items" className="btn btn--primary">
                Browse Campus Items
              </Link>
              <button type="button" className="btn btn--outline" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Tabs */}
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
                onClick={() => {
                  setMode('login');
                  setErrors({});
                  setServerError('');
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`}
                onClick={() => {
                  setMode('register');
                  setErrors({});
                  setServerError('');
                }}
              >
                Create Account
              </button>
            </div>

            <div className="auth-header">
              <h1 className="auth-title">
                {mode === 'login' ? 'Welcome Back' : 'Join Campus Registry'}
              </h1>
              <p className="auth-subtitle">
                {mode === 'login'
                  ? 'Sign in to report belongings, verify claims, and manage listings.'
                  : 'Register your campus account to save records directly to MongoDB.'}
              </p>
            </div>

            {/* Success Alert */}
            {successMessage && (
              <div className="alert alert-success" role="alert" style={{ marginBottom: '1.25rem' }}>
                <span className="alert-icon">✓</span>
                <span className="alert-text">{successMessage}</span>
              </div>
            )}

            {/* Error Alert */}
            {serverError && (
              <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {/* Name (Register only) */}
              {mode === 'register' && (
                <div className={`form-field ${errors.name ? 'form-field--error' : ''}`}>
                  <label htmlFor="auth-name" className="form-label">
                    Full Name <span className="form-required">*</span>
                  </label>
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    autoComplete="name"
                  />
                  {errors.name && <p className="form-error">⚠️ {errors.name}</p>}
                </div>
              )}

              {/* Email */}
              <div className={`form-field ${errors.email ? 'form-field--error' : ''}`}>
                <label htmlFor="auth-email" className="form-label">
                  Campus Email Address <span className="form-required">*</span>
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="student@chitkara.edu.in"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
                {errors.email && <p className="form-error">⚠️ {errors.email}</p>}
              </div>

              {/* Role (Register only) */}
              {mode === 'register' && (
                <div className="form-field">
                  <label htmlFor="auth-role" className="form-label">
                    Campus Role
                  </label>
                  <select
                    id="auth-role"
                    name="role"
                    className="form-input form-select"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="student">Student</option>
                    <option value="staff">Campus Staff / Security</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              )}

              {/* Password */}
              <div className={`form-field ${errors.password ? 'form-field--error' : ''}`}>
                <label htmlFor="auth-password" className="form-label">
                  Password <span className="form-required">*</span>
                </label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                {errors.password && <p className="form-error">⚠️ {errors.password}</p>}
              </div>

              {/* Confirm Password (Register only) */}
              {mode === 'register' && (
                <div className={`form-field ${errors.confirmPassword ? 'form-field--error' : ''}`}>
                  <label htmlFor="auth-confirm-password" className="form-label">
                    Confirm Password <span className="form-required">*</span>
                  </label>
                  <input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type="password"
                    className="form-input"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p className="form-error">⚠️ {errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn--primary btn--full auth-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Processing...'
                  : mode === 'register'
                  ? '✨ Create Account & Save in MongoDB'
                  : '🔐 Sign In to Account'}
              </button>

              {/* Demo Login Button */}
              {mode === 'login' && (
                <div className="auth-demo-divider">
                  <span>OR</span>
                  <button
                    type="button"
                    className="btn btn--outline btn--full auth-demo-btn"
                    onClick={handleDemoLogin}
                    disabled={isSubmitting}
                  >
                    ⚡ One-Click Demo Student Sign In
                  </button>
                </div>
              )}
            </form>

            {/* Mode Switch Footer */}
            <div className="auth-footer">
              {mode === 'login' ? (
                <p>
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => {
                      setMode('register');
                      setErrors({});
                      setServerError('');
                    }}
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already registered?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => {
                      setMode('login');
                      setErrors({});
                      setServerError('');
                    }}
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Auth;
