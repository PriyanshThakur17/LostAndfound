// ============================================
// Campus Lost & Found — ReportFound Page (Member 2)
// ============================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, LOCATIONS } from '../data/sampleItems';
import { addItem } from '../utils/storage';

const ReportFound = () => {
  // Controlled form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    date: '',
    location: '',
    currentLocation: '',
    contact: '',
    image: '',
  });

  // State for image preview thumbnail
  const [imagePreview, setImagePreview] = useState('');

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Submission success status
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Today's date YYYY-MM-DD for date input max attribute
  const todayDate = new Date().toISOString().split('T')[0];

  // Handle controlled input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle Image upload and FileReader DataURL conversion
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrors((prev) => ({
        ...prev,
        image: 'Please upload a valid image file (JPG, PNG, or WEBP).',
      }));
      return;
    }

    // Validate max file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: 'Image size exceeds the 5MB limit.',
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: null }));

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      setFormData((prev) => ({
        ...prev,
        image: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: '' }));
    const fileInput = document.getElementById('found-image-input');
    if (fileInput) fileInput.value = '';
  };

  // Form Validation logic
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Item name is required.';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Item name must be at least 2 characters.';
    }

    if (!formData.category) {
      newErrors.category = 'Please select an item category.';
    }

    if (!formData.location) {
      newErrors.location = 'Please select the location where the item was found.';
    }

    if (!formData.date) {
      newErrors.date = 'Found date is required.';
    } else if (new Date(formData.date) > new Date()) {
      newErrors.date = 'Found date cannot be in the future.';
    }

    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Item description is required.';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Please enter at least 10 characters describing the item.';
    }

    if (!formData.currentLocation || !formData.currentLocation.trim()) {
      newErrors.currentLocation = 'Please specify where the item is currently kept or handed over.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newItem = {
      id: Date.now(),
      type: 'found',
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim(),
      location: formData.location,
      date: formData.date,
      currentLocation: formData.currentLocation.trim(),
      contact: formData.contact ? formData.contact.trim() : 'Campus Security Desk',
      image: formData.image,
      status: 'Open',
      createdBy: 'Student',
      createdAt: new Date().toISOString().split('T')[0],
    };

    addItem(newItem);
    setIsSubmitted(true);
  };

  const handleReportAnother = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      date: '',
      location: '',
      currentLocation: '',
      contact: '',
      image: '',
    });
    setImagePreview('');
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <main className="page">
      <div className="page__header">
        <h1 className="page__title">Report a Found Item</h1>
        <p className="page__subtitle">
          Help reunite a lost belonging with its owner by providing accurate details.
        </p>
      </div>

      {isSubmitted ? (
        <div className="card success-card">
          <div className="success-card__icon">✓</div>
          <h2 className="success-card__title">Found item reported successfully!</h2>
          <p className="success-card__message">
            Thank you for helping reunite this item with its owner. Your report has been added to the campus registry.
          </p>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleReportAnother}
            >
              Report Another Item
            </button>
            <Link to="/found-items" className="btn btn--primary">
              View Found Items Directory
            </Link>
          </div>
        </div>
      ) : (
        <div className="card form-card">
          <form onSubmit={handleSubmit} noValidate>
            {/* 1. Item Title */}
            <div className="form-group">
              <label htmlFor="found-title" className="form-label">
                Item Name <span className="required-asterisk">*</span>
              </label>
              <input
                id="found-title"
                type="text"
                name="title"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                placeholder="e.g. Black Leather Wallet, Student ID Card, Blue Water Bottle"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <span className="error-message">⚠️ {errors.title}</span>}
            </div>

            {/* 2. Category & Location (Row) */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="found-category" className="form-label">
                  Category <span className="required-asterisk">*</span>
                </label>
                <select
                  id="found-category"
                  name="category"
                  className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category ▼</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="error-message">⚠️ {errors.category}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="found-location" className="form-label">
                  Found Location <span className="required-asterisk">*</span>
                </label>
                <select
                  id="found-location"
                  name="location"
                  className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                  value={formData.location}
                  onChange={handleChange}
                >
                  <option value="">Select Campus Location ▼</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                {errors.location && <span className="error-message">⚠️ {errors.location}</span>}
              </div>
            </div>

            {/* 3. Found Date & Current Location (Row) */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="found-date" className="form-label">
                  Found Date <span className="required-asterisk">*</span>
                </label>
                <input
                  id="found-date"
                  type="date"
                  name="date"
                  max={todayDate}
                  className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                  value={formData.date}
                  onChange={handleChange}
                />
                {errors.date && <span className="error-message">⚠️ {errors.date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="found-current-location" className="form-label">
                  Currently Kept At / Handed Over To <span className="required-asterisk">*</span>
                </label>
                <input
                  id="found-current-location"
                  type="text"
                  name="currentLocation"
                  className={`form-control ${errors.currentLocation ? 'is-invalid' : ''}`}
                  placeholder="e.g. Block A Security Desk, Library Reception"
                  value={formData.currentLocation}
                  onChange={handleChange}
                />
                {errors.currentLocation && (
                  <span className="error-message">⚠️ {errors.currentLocation}</span>
                )}
              </div>
            </div>

            {/* 4. Description */}
            <div className="form-group">
              <label htmlFor="found-description" className="form-label">
                Detailed Description <span className="required-asterisk">*</span>
              </label>
              <textarea
                id="found-description"
                name="description"
                rows="4"
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                placeholder="Describe unique features, color, brand, condition, or marks (minimum 10 characters)..."
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && (
                <span className="error-message">⚠️ {errors.description}</span>
              )}
            </div>

            {/* 5. Contact Info (Optional) */}
            <div className="form-group">
              <label htmlFor="found-contact" className="form-label">
                Finder Contact Info (Optional)
              </label>
              <input
                id="found-contact"
                type="text"
                name="contact"
                className="form-control"
                placeholder="e.g. student@univ.edu or Block A Security Office"
                value={formData.contact}
                onChange={handleChange}
              />
              <span className="form-hint">
                Provide contact info if owners can reach you directly, or leave blank if turned in to security.
              </span>
            </div>

            {/* 6. Image Upload */}
            <div className="form-group">
              <label className="form-label">Item Image (Optional)</label>
              <div className="image-upload-wrapper">
                <input
                  id="found-image-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="file-input"
                  onChange={handleImageChange}
                />
                <label htmlFor="found-image-input" className="btn-upload-trigger">
                  📷 Choose Image
                </label>
                <div className="upload-hint">Supported formats: JPG, PNG, WEBP (Max 5MB)</div>

                {imagePreview && (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Found Item Preview"
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={handleRemoveImage}
                      title="Remove Image"
                      aria-label="Remove Image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              {errors.image && <span className="error-message">⚠️ {errors.image}</span>}
            </div>

            {/* Submit Button */}
            <div className="form-actions" style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn--secondary btn--full">
                Report Found Item
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default ReportFound;
