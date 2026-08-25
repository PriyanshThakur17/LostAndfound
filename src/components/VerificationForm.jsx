import { useState } from 'react';

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
  const [formData, setFormData] = useState({
    itemColor: '',
    uniqueFeature: '',
    lostLocation: '',
    foundLocation: '',
    foundDate: '',
    additionalInfo: '',
    contactName: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (item.type === 'found') {
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
      if (!formData.foundLocation.trim()) {
        newErrors.foundLocation = 'Please enter where you found the item.';
      }
      if (!formData.foundDate.trim()) {
        newErrors.foundDate = 'Please enter the date you found it.';
      }
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Please enter your name so the owner can be notified.';
    }

    return newErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(formData);
    }, 800);
  };

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

  return (
    <div className="verification-form-wrapper">
      {item.type === 'found' ? (
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
                className="btn btn--outline"
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
                className="btn btn--outline"
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
