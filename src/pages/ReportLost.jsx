import { useState } from 'react';
import { CATEGORIES, LOCATIONS } from '../data/sampleItems';
import { validateLostForm, validateImageFile } from '../utils/validation';
import { addItem } from '../utils/storage';
import { formatBytes } from '../utils/helpers';
import { createItemApi } from '../utils/api';

/**
 * ReportLost Component — Member 1 Responsibility
 * Route: /report-lost
 * Allows students to report a lost campus item via the backend API.
 */
function ReportLost() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    date: '',
  });

  // Real image file instance for Multer multipart upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageMeta, setImageMeta] = useState({
    fileName: '',
    fileSize: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle standard input/select/textarea changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for field when modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (successMessage) {
      setSuccessMessage('');
    }
    if (serverError) {
      setServerError('');
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file format and size (< 5MB, JPEG/PNG/WebP)
    const { isValid, error: imageErr } = validateImageFile(file);
    if (!isValid) {
      setErrors((prev) => ({ ...prev, image: imageErr }));
      e.target.value = '';
      return;
    }

    setErrors((prev) => ({ ...prev, image: '' }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageMeta({
      fileName: file.name,
      fileSize: formatBytes(file.size),
    });
  };

  // Clear selected image
  const handleClearImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview('');
    }
    setImageMeta({ fileName: '', fileSize: '' });
    setErrors((prev) => ({ ...prev, image: '' }));

    const fileInput = document.getElementById('item-image');
    if (fileInput) fileInput.value = '';
  };

  // Reset form to initial empty state
  const handleResetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      location: '',
      date: '',
    });
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview('');
    }
    setImageMeta({ fileName: '', fileSize: '' });
    setErrors({});
    setServerError('');

    const fileInput = document.getElementById('item-image');
    if (fileInput) fileInput.value = '';
  };

  // Handle blur to trigger field-level validation feedback
  const handleBlur = (e) => {
    const { name } = e.target;
    const { errors: currentErrors } = validateLostForm(formData);
    if (currentErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: currentErrors[name] }));
    }
  };

  // Form submission handler connected to backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const { isValid, errors: validationErrors } = validateLostForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      // Focus first error field for accessibility
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(`item-${firstErrorKey}`);
      if (element) element.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      // Build multipart/form-data for backend API
      const payload = new FormData();
      payload.append('type', 'lost');
      payload.append('title', formData.title.trim());
      payload.append('category', formData.category);
      payload.append('location', formData.location);
      payload.append('date', formData.date);
      payload.append('description', formData.description.trim());

      if (imageFile) {
        payload.append('image', imageFile);
      }

      // Send request to POST /api/items
      const response = await createItemApi(payload);

      // Backwards compatibility sync with Local Storage for un-migrated pages (Items, ItemDetails)
      if (response && response.data) {
        const serverItem = response.data;
        addItem({
          id: serverItem.id || serverItem._id,
          _id: serverItem._id,
          type: 'lost',
          title: serverItem.title,
          category: serverItem.category,
          description: serverItem.description,
          location: serverItem.location,
          date: serverItem.date,
          image: serverItem.image || '',
          status: serverItem.status || 'Open',
          createdBy: serverItem.createdBy?.name || 'Student',
          createdAt: serverItem.createdAt || new Date().toISOString(),
        });
      }

      // Show success screen and reset form
      setSuccessMessage('Lost item reported successfully!');
      handleResetForm();

      // Scroll smoothly to top of container
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err) {
      console.error('[ReportLost Error]:', err);
      setServerError(err.message || 'Failed to submit report. Please check your connection and try again.');
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const descLength = formData.description.trim().length;

  return (
    <main className="report-lost-page page">
      <div className="report-lost-container container">
        {/* Page Header */}
        <header className="report-lost-header">
          <div className="report-lost-icon-wrapper">
            <span className="report-lost-badge-icon">🔴</span>
          </div>
          <h1 className="report-lost-title">Report Lost Item</h1>
          <p className="report-lost-subtitle">
            Provide details about the item you have lost on campus. Your report will be published so fellow students can help you find it.
          </p>
        </header>

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

        {/* Server Error Alert Banner */}
        {serverError && (
          <div className="alert alert-error" role="alert">
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
        <div className="report-lost-card">
          <form onSubmit={handleSubmit} className="report-lost-form" noValidate>
            {/* Item Name */}
            <div className="form-group">
              <label htmlFor="item-title" className="form-label">
                Item Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="item-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. AirPods Pro, Blue Backpack, Student ID"
                className={`form-control ${errors.title ? 'form-control--error' : ''}`}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'item-title-error' : undefined}
                disabled={isSubmitting}
              />
              {errors.title && (
                <span className="field-error" id="item-title-error" role="alert">
                  {errors.title}
                </span>
              )}
            </div>

            {/* Category & Location Row */}
            <div className="form-row">
              {/* Category */}
              <div className="form-group">
                <label htmlFor="item-category" className="form-label">
                  Category <span className="required-star">*</span>
                </label>
                <select
                  id="item-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${errors.category ? 'form-control--error' : ''}`}
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? 'item-category-error' : undefined}
                  disabled={isSubmitting}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="field-error" id="item-category-error" role="alert">
                    {errors.category}
                  </span>
                )}
              </div>

              {/* Location Lost */}
              <div className="form-group">
                <label htmlFor="item-location" className="form-label">
                  Location Lost <span className="required-star">*</span>
                </label>
                <select
                  id="item-location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${errors.location ? 'form-control--error' : ''}`}
                  aria-invalid={!!errors.location}
                  aria-describedby={errors.location ? 'item-location-error' : undefined}
                  disabled={isSubmitting}
                >
                  <option value="">Select Campus Location</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <span className="field-error" id="item-location-error" role="alert">
                    {errors.location}
                  </span>
                )}
              </div>
            </div>

            {/* Date Lost */}
            <div className="form-group">
              <label htmlFor="item-date" className="form-label">
                Date Lost <span className="required-star">*</span>
              </label>
              <input
                type="date"
                id="item-date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                onBlur={handleBlur}
                max={new Date().toISOString().split('T')[0]}
                className={`form-control ${errors.date ? 'form-control--error' : ''}`}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? 'item-date-error' : 'item-date-help'}
                disabled={isSubmitting}
              />
              <span className="form-helper-text" id="item-date-help">
                Select the date the item was lost. Future dates are not allowed.
              </span>
              {errors.date && (
                <span className="field-error" id="item-date-error" role="alert">
                  {errors.date}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="item-description" className="form-label">
                  Description <span className="required-star">*</span>
                </label>
                <span
                  className={`char-counter ${
                    descLength >= 10 ? 'char-counter--valid' : ''
                  }`}
                >
                  {descLength} / 10 min chars
                </span>
              </div>
              <textarea
                id="item-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows="4"
                placeholder="Describe unique features, color, brand, condition, or special marks..."
                className={`form-control form-textarea ${errors.description ? 'form-control--error' : ''}`}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'item-description-error' : undefined}
                disabled={isSubmitting}
              ></textarea>
              {errors.description && (
                <span className="field-error" id="item-description-error" role="alert">
                  {errors.description}
                </span>
              )}
            </div>

            {/* Image Upload & Preview Container */}
            <div className="form-group">
              <label htmlFor="item-image" className="form-label">
                Item Image <span className="optional-tag">(Optional)</span>
              </label>

              {!imagePreview ? (
                <div className="image-upload-wrapper">
                  <input
                    type="file"
                    id="item-image"
                    name="image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className={`form-control form-file-input ${errors.image ? 'form-control--error' : ''}`}
                    aria-invalid={!!errors.image}
                    aria-describedby={errors.image ? 'item-image-error' : 'item-image-help'}
                    disabled={isSubmitting}
                  />
                  <span className="form-helper-text" id="item-image-help">
                    Supported formats: JPEG, PNG, WebP (Max 5MB).
                  </span>
                </div>
              ) : (
                <div className="image-preview-card">
                  <div className="image-preview-thumbnail-wrapper">
                    <img
                      src={imagePreview}
                      alt="Lost item preview"
                      className="image-preview-thumbnail"
                    />
                  </div>
                  <div className="image-preview-info">
                    <span className="image-preview-filename">{imageMeta.fileName || 'Selected Image'}</span>
                    <span className="image-preview-filesize">{imageMeta.fileSize}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="btn-remove-image"
                    title="Remove selected image"
                    aria-label="Remove selected image"
                    disabled={isSubmitting}
                  >
                    🗑️ Remove
                  </button>
                </div>
              )}

              {errors.image && (
                <span className="field-error" id="item-image-error" role="alert">
                  {errors.image}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="form-actions-grid">
              <button
                type="submit"
                className="btn btn-primary btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Report...' : 'Submit Lost Report'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-reset"
                onClick={handleResetForm}
                disabled={isSubmitting}
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ReportLost;
