import { useState } from 'react';
import './VerificationForm.css';

// ============================================
// VerificationForm — Ownership Verification
// and Found Item Report Form
// ============================================

/**
 * Renders the appropriate verification form based on item type:
 *  - "found" item → Ownership Verification (claimant proves they own it)
 *  - "lost"  item → Found Item Report (finder reports where they found it)
 *
 * @param {Object}   item       - The item being claimed/reported
 * @param {Function} onSuccess  - Callback when form submits successfully
 * @param {Function} onCancel   - Callback when user cancels
 */
function VerificationForm({ item, onSuccess, onCancel }) {
  // ----- Form state -----
  const [formData, setFormData] = useState({
    // Ownership fields (for found items)
    itemColor: '',
    uniqueFeature: '',
    lostLocation: '',
    // Found report fields (for lost items)
    foundLocation: '',
    foundDate: '',
    additionalInfo: '',
    // Shared
    contactName: '',
  });

  // Stores per-field validation error messages
  const [errors, setErrors] = useState({});

  // Whether the user is currently submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ----- Handlers -----

  /**
   * Generic change handler — updates formData for any field.
   * Uses computed property name with the input's name attribute.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate required fields depending on item type.
   * Returns an errors object — empty means form is valid.
   */
  const validate = () => {
    const newErrors = {};

    if (item.type === 'found') {
      // Ownership verification for found items
      if (!formData.itemColor.trim()) {
        newErrors.itemColor = 'Please describe the color of the item.';
      }
      if (!formData.uniqueFeature.trim()) {
        newErrors.uniqueFeature = 'Please describe a unique feature.';
      }
      if (!formData.lostLocation.trim()) {
        newErrors.lostLocation = 'Please tell us where you originally lost it.';
      }
    }

    if (item.type === 'lost') {
      // Found item report for lost items
      if (!formData.foundLocation.trim()) {
        newErrors.foundLocation = 'Please enter where you found the item.';
      }
      if (!formData.foundDate.trim()) {
        newErrors.foundDate = 'Please enter the date you found it.';
      }
    }

    // Contact name is required for both
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Please enter your name so the owner can be notified.';
    }

    return newErrors;
  };

  /**
   * Form submit handler:
   * 1. Prevents default browser behavior
   * 2. Validates all required fields
   * 3. Shows errors or calls onSuccess callback
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      // Show all validation errors
      setErrors(validationErrors);
      return;
    }

    // Simulate async submission
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Pass form data up to parent for status update
      onSuccess(formData);
    }, 800);
  };

  // ----- Render helpers -----

  /**
   * Renders a labeled input field with optional error message.
   */
  const renderField = ({
    label,
    name,
    type = 'text',
    placeholder = '',
    required = true,
    isTextarea = false,
  }) => {
    const hasError = Boolean(errors[name]);

    return (
      <div className={`form-field ${hasError ? 'form-field--error' : ''}`}>
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true"> *</span>}
        </label>

        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            className="form-input form-textarea"
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            rows={3}
            aria-required={required}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            className="form-input"
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            aria-required={required}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        )}

        {hasError && (
          <p id={`${name}-error`} className="form-error" role="alert">
            ⚠ {errors[name]}
          </p>
        )}
      </div>
    );
  };

  // ----- Render -----

  return (
    <div className="verification-form-wrapper">
      {item.type === 'found' ? (
        /* ---- Ownership Verification (claimant proving they own a found item) ---- */
        <div className="verification-form-card">
          <div className="verification-form-header">
            <h2 className="verification-form-title">🔐 Verify Ownership</h2>
            <p className="verification-form-subtitle">
              To claim <strong>{item.title}</strong>, please answer a few questions
              so we can verify it belongs to you. Your responses are confidential.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {renderField({
              label: 'What color is the item?',
              name: 'itemColor',
              placeholder: 'e.g., White, Black with gold trim…',
            })}

            {renderField({
              label: 'Describe a unique feature or marking on the item',
              name: 'uniqueFeature',
              placeholder: 'e.g., scratched corner, initials engraved, keychain attached…',
              isTextarea: true,
            })}

            {renderField({
              label: 'Where did you originally lose this item?',
              name: 'lostLocation',
              placeholder: 'e.g., Library study room 3B, near the cafeteria entrance…',
            })}

            {renderField({
              label: 'Your name',
              name: 'contactName',
              placeholder: 'Full name',
            })}

            <div className="form-info-box">
              <p>
                ℹ️ This information helps the finder verify your ownership.
                No contact details are shared publicly.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Submitting…' : '✓ Submit Verification'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ---- Found Item Report (finder reporting they found a lost item) ---- */
        <div className="verification-form-card">
          <div className="verification-form-header">
            <h2 className="verification-form-title">📦 Report Found Item</h2>
            <p className="verification-form-subtitle">
              You found <strong>{item.title}</strong>? Great! Please provide the
              details below so the owner can be notified.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {renderField({
              label: 'Where did you find this item?',
              name: 'foundLocation',
              placeholder: 'e.g., Library 2nd floor, Cafeteria table near window…',
            })}

            {renderField({
              label: 'When did you find it?',
              name: 'foundDate',
              type: 'date',
            })}

            {renderField({
              label: 'Additional information (optional)',
              name: 'additionalInfo',
              placeholder: 'Any other details that might help identify the owner…',
              required: false,
              isTextarea: true,
            })}

            {renderField({
              label: 'Your name',
              name: 'contactName',
              placeholder: 'Full name',
            })}

            <div className="form-info-box">
              <p>
                ℹ️ Thank you for helping reconnect this item with its owner!
                The registry team will follow up if needed.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Submitting…' : '📤 Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default VerificationForm;
