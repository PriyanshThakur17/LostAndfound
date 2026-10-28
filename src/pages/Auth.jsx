import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { setAuthToken, setStoredUser, getStoredUser } from '../api/client';

/**
 * Auth Page — Unified User Authentication (Login & Register).
 * Saves new accounts directly into the MongoDB `users` collection.
 */
const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode is cleanly derived from the URL path (/register vs /login)
  const mode = location.pathname === '/register' ? 'register' : 'login';
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

  // Switch between Login and Register tabs via navigation
  const handleSwitchMode = (targetMode) => {
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    if (targetMode === 'register') {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

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

    if (mode === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required to create an account.';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters.';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address (e.g. name@campus.edu).';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (mode === 'register') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (formData.password !== formData.confirmPassword) {
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

        setSuccessMessage('Account registered and saved into MongoDB successfully!');
        setCurrentUser(registeredUser);
        window.dispatchEvent(new Event('auth-change'));

        setTimeout(() => {
          navigate('/items');
        }, 900);
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
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify details and try again.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // One-click demo sign-in for fast evaluation
  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');
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
      setServerError(err.message || 'Could not connect to demo student account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // offline fallback
    }
    setAuthToken(null);
    setStoredUser(null);
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth-change'));
    setSuccessMessage('Signed out successfully.');
  };

  return (
    <main className="page auth-page">
      <div className="auth-card">
        {/* Banner if user is currently signed in */}
        {currentUser && (
          <div className="auth-signed-in-banner" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.9rem', color: '#1E40AF' }}>
              <span>👤 Signed in as: </span>
              <strong>{currentUser.name}</strong> ({currentUser.email})
            </div>
            <button
              type="button"
              className="btn btn--outline"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem', borderColor: '#93C5FD' }}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Header Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            id="tab-login"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => handleSwitchMode('login')}
          >
            🔐 Sign In
          </button>
          <button
            type="button"
            role="tab"
            id="tab-register"
            aria-selected={mode === 'register'}
            className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`}
            onClick={() => handleSwitchMode('register')}
          >
            ✨ Create Account
          </button>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">
            {mode === 'register' ? 'Join Campus Registry' : 'Welcome Back'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'register'
              ? 'Register your campus account to save records directly into MongoDB.'
              : 'Sign in to report belongings, verify claims, and manage listings.'}
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
              placeholder="e.g. student@chitkara.edu.in"
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
            id="auth-submit"
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
                onClick={() => handleSwitchMode('register')}
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
                onClick={() => handleSwitchMode('login')}
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Auth;
