import { useState } from 'react';
import { CATEGORIES, LOCATIONS } from '../data/sampleItems';
import { validateLostForm } from '../utils/validation';
import './ReportLost.css';

/**
 * ReportLost Component — Member 1 Responsibility
 * Route: /report-lost
 * Allows students to report a lost campus item.
 */
function ReportLost() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    date: '',
    image: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handle standard input/select/textarea changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for field when modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle blur to trigger field-level validation feedback
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const { errors: currentErrors } = validateLostForm(formData);
    if (currentErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: currentErrors[name] }));
    }
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateLostForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      // Focus first error field for accessibility
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(`item-${firstErrorKey}`);
      if (element) element.focus();
      return;
    }

    // Handled in commit 3: storage saving & success banner
  };

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
                className={`form-control ${errors.date ? 'form-control--error' : ''}`}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? 'item-date-error' : undefined}
              />
              {errors.date && (
                <span className="field-error" id="item-date-error" role="alert">
                  {errors.date}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="item-description" className="form-label">
                Description <span className="required-star">*</span>
              </label>
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
              ></textarea>
              {errors.description && (
                <span className="field-error" id="item-description-error" role="alert">
                  {errors.description}
                </span>
              )}
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label htmlFor="item-image" className="form-label">
                Item Image <span className="optional-tag">(Optional)</span>
              </label>
              <input
                type="file"
                id="item-image"
                name="image"
                accept="image/*"
                className="form-control form-file-input"
              />
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-submit">
                Submit Lost Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ReportLost;
