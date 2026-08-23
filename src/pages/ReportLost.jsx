import { useState } from 'react';
import { CATEGORIES, LOCATIONS } from '../data/sampleItems';
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

  // Handle standard input/select changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submission handler placeholder (enhanced in upcoming commits)
  const handleSubmit = (e) => {
    e.preventDefault();
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
                placeholder="e.g. AirPods Pro, Blue Backpack, Student ID"
                className="form-control"
              />
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
                  className="form-control"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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
                  className="form-control"
                >
                  <option value="">Select Campus Location</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
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
                className="form-control"
              />
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
                rows="4"
                placeholder="Describe unique features, color, brand, condition, or special marks..."
                className="form-control form-textarea"
              ></textarea>
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
