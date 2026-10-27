import { useState } from 'react';
import { CATEGORIES, LOCATIONS } from '../data/sampleItems';
import { validateFoundForm, validateImageFile } from '../utils/validation';
import { addItem } from '../utils/storage';
import { formatBytes } from '../utils/helpers';
import api, { getAuthToken, setAuthToken, setStoredUser } from '../api/client';
import './ReportFound.css';

/**
 * ReportFound Component — Member 2 Responsibility
 * Route: /report-found
 * Allows campus members to report a found belonging via shared POST /api/items.
 */
function ReportFound() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    date: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageMeta, setImageMeta] = useState({ fileName: '', fileSize: '' });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAuthToken()));
  const [currentUser, setCurrentUser] = useState(() => api.auth.getCurrentUser() || (getAuthToken() ? { name: 'Student' } : null));

  // One-click demo login helper
  const handleDemoSignIn = async () => {
    try {
      const res = await api.auth.getDemoToken();
      setIsAuthenticated(true);
      setCurrentUser(res.user);
      setServerError('');
    } catch {
      // Fallback local mock token if server is offline
      const mockToken = 'demo-student-token';
      const mockUser = { id: '64f1a2b3c4d5e6f7a8b9c0d1', name: 'Demo Student', email: 'student@chitkara.edu.in', role: 'student' };
      setAuthToken(mockToken);
      setStoredUser(mockUser);
      setIsAuthenticated(true);
      setCurrentUser(mockUser);
    }
  };

  // Handle text/select changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
    if (successMessage) setSuccessMessage('');
  };

  // Handle file selection (creates object URL preview, no Base64!)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { isValid, error: imageErr } = validateImageFile(file);
    if (!isValid) {
      setErrors((prev) => ({ ...prev, image: imageErr }));
      e.target.value = '';
      return;
    }

    setErrors((prev) => ({ ...prev, image: '' }));
    setSelectedFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setImageMeta({
      fileName: file.name,
      fileSize: formatBytes(file.size),
    });
  };

  // Clear selected image
  const handleClearImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedFile(null);
    setImagePreviewUrl('');
    setImageMeta({ fileName: '', fileSize: '' });
    setErrors((prev) => ({ ...prev, image: '' }));

    const fileInput = document.getElementById('found-item-image');
    if (fileInput) fileInput.value = '';
  };

  // Reset form
  const handleResetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      location: '',
      date: '',
    });
    handleClearImage();
    setErrors({});
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    // Require authentication check
    if (!getAuthToken()) {
      setServerError('Authentication is required to report a found item. Please sign in or use the 1-Click Demo Login above.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    // Client-side validation
    const { isValid, errors: validationErrors } = validateFoundForm(formData);
    if (!isValid) {
      setErrors(validationErrors);
      const firstError = Object.keys(validationErrors)[0];
      const elem = document.getElementById(`found-${firstError}`);
      if (elem) elem.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      // Build FormData payload (as required: type=found, FormData upload, no Base64)
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('type', 'found');
      payload.append('category', formData.category);
      payload.append('description', formData.description.trim());
      payload.append('location', formData.location);
      payload.append('date', formData.date);

      if (selectedFile) {
        payload.append('image', selectedFile);
      }

      // Submit to shared POST /api/items endpoint
      const response = await api.items.create(payload);

      // Save to local storage for backward compatibility with items listing
      if (response?.item) {
        const itemForStorage = {
          id: response.item._id || response.item.id || Date.now(),
          type: 'found',
          title: response.item.title,
          category: response.item.category,
          description: response.item.description,
          location: response.item.location,
          date: response.item.date,
          image: response.item.image || '',
          status: 'Open',
          createdBy: response.item.createdBy || currentUser?.name || 'Student',
          createdAt: response.item.createdAt || new Date().toISOString(),
        };
        addItem(itemForStorage);
      }

      // Display success ONLY after a successful server response
      setSuccessMessage('Found item reported successfully! Your submission is now recorded.');
      handleResetForm();
      window.scrollTo({ top: 80, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to report found item:', err);
      setServerError(err.message || 'Failed to submit report to server. Please try again.');
      window.scrollTo({ top: 80, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const descLength = formData.description.trim().length;

  return (
    <main className="report-found-page page">
      <div className="report-found-container container">
        {/* Header */}
        <header className="report-found-header">
          <div className="report-found-icon-wrapper">
            <span className="report-found-badge-icon">🟢</span>
          </div>
          <h1 className="report-found-title">Report Found Item</h1>
          <p className="report-found-subtitle">
            Found an item on campus? Help return it to its rightful owner by recording the details here.
          </p>
        </header>

        {/* Authentication Notice Banner */}
        {!isAuthenticated && (
          <div className="auth-notice" role="region" aria-label="Authentication Required">
            <p className="auth-notice-text">
              🔒 <strong>Sign-in required:</strong> You must be signed in to submit reports.
            </p>
            <button
              type="button"
              className="btn-auth-demo"
              onClick={handleDemoSignIn}
              aria-label="1-Click Demo Login"
            >
              ⚡ 1-Click Demo Sign In
            </button>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="alert alert-success" role="alert">
            <span className="alert-icon">✅</span>
            <div className="alert-content">
              <strong className="alert-title">Report Submitted</strong>
              <p className="alert-text">{successMessage}</p>
            </div>
            <button
              type="button"
              className="alert-close"
              onClick={() => setSuccessMessage('')}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert Banner */}
        {serverError && (
          <div className="alert alert-danger" role="alert">
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">
              <strong className="alert-title">Submission Error</strong>
              <p className="alert-text">{serverError}</p>
            </div>
            <button
              type="button"
              className="alert-close"
              onClick={() => setServerError('')}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="report-found-card">
          <form onSubmit={handleSubmit} className="report-found-form" noValidate>
            {/* Item Name */}
            <div className="form-group">
              <label htmlFor="found-title" className="form-label">
                Item Name
                <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="found-title"
                name="title"
                className={`form-control ${errors.title ? 'has-error' : ''}`}
                placeholder="e.g. Wireless Mouse, Student ID Card, Water Bottle"
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
                maxLength={80}
                aria-required="true"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <div id="title-error" className="field-feedback" role="alert">
                  <span className="error-icon">⚠️</span>
                  <span>{errors.title}</span>
                </div>
              )}
            </div>

            {/* Category & Location */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="found-category" className="form-label">
                  Category
                  <span className="required-star">*</span>
                </label>
                <select
                  id="found-category"
                  name="category"
                  className={`form-select ${errors.category ? 'has-error' : ''}`}
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={errors.category ? 'category-error' : undefined}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <div id="category-error" className="field-feedback" role="alert">
                    <span className="error-icon">⚠️</span>
                    <span>{errors.category}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="found-location" className="form-label">
                  Campus Location Found
                  <span className="required-star">*</span>
                </label>
                <select
                  id="found-location"
                  name="location"
                  className={`form-select ${errors.location ? 'has-error' : ''}`}
                  value={formData.location}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={errors.location ? 'location-error' : undefined}
                >
                  <option value="">Select location where found</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <div id="location-error" className="field-feedback" role="alert">
                    <span className="error-icon">⚠️</span>
                    <span>{errors.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Date Found */}
            <div className="form-group">
              <label htmlFor="found-date" className="form-label">
                Date Found
                <span className="required-star">*</span>
              </label>
              <input
                type="date"
                id="found-date"
                name="date"
                className={`form-control ${errors.date ? 'has-error' : ''}`}
                value={formData.date}
                onChange={handleChange}
                disabled={isSubmitting}
                max={new Date().toISOString().split('T')[0]}
                aria-required="true"
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? 'date-error' : undefined}
              />
              {errors.date && (
                <div id="date-error" className="field-feedback" role="alert">
                  <span className="error-icon">⚠️</span>
                  <span>{errors.date}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="found-description" className="form-label">
                Description
                <span className="required-star">*</span>
              </label>
              <textarea
                id="found-description"
                name="description"
                className={`form-textarea ${errors.description ? 'has-error' : ''}`}
                rows={4}
                placeholder="Describe visible features, color, brand, condition, or exact place where the item was discovered on campus..."
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
                maxLength={600}
                aria-required="true"
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'desc-error' : 'desc-help'}
              />
              <div className="char-counter">{descLength} / 600 characters (min. 10)</div>
              {errors.description && (
                <div id="desc-error" className="field-feedback" role="alert">
                  <span className="error-icon">⚠️</span>
                  <span>{errors.description}</span>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label htmlFor="found-item-image" className="form-label">
                Item Photo
                <span className="optional-text">(Optional, max 5MB)</span>
              </label>
              <input
                type="file"
                id="found-item-image"
                name="image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                disabled={isSubmitting}
                className="image-file-input"
              />

              {!imagePreviewUrl ? (
                <label htmlFor="found-item-image" className="image-dropzone">
                  <div className="dropzone-content">
                    <span className="dropzone-icon">📷</span>
                    <p className="dropzone-prompt">
                      Click to <span className="dropzone-link">browse</span> or select a photo
                    </p>
                    <p className="dropzone-limits">Supports JPG, PNG, WEBP, GIF up to 5MB</p>
                  </div>
                </label>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreviewUrl} alt="Preview of found item" className="preview-thumbnail" />
                  <div className="preview-details">
                    <p className="preview-name">{imageMeta.fileName || 'Selected image'}</p>
                    <p className="preview-size">{imageMeta.fileSize}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={handleClearImage}
                    disabled={isSubmitting}
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}

              {errors.image && (
                <div className="field-feedback" role="alert">
                  <span className="error-icon">⚠️</span>
                  <span>{errors.image}</span>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResetForm}
                disabled={isSubmitting}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Submitting...' : '🟢 Submit Found Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ReportFound;
