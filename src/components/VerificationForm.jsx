import { useState } from 'react';
import api, { getAuthToken, setAuthToken, setStoredUser } from '../api/client';

/**
 * =============================================================================
 * VerificationForm — Anti-Fraud Ownership Verification & Claim Flow
 * Author: Parth | Roll Number: 2410998556 (Member 4)
 * Module: Ownership Verification Engine & Connected POST /api/claims
 * =============================================================================
 *
 * Renders the appropriate verification workflow based on item type:
 *  - "found" item → Ownership Verification (claimant proves they own it)
 *  - "lost"  item → Found Item Report (finder reports where they found it)
 *
 * Connected to live POST /api/claims API endpoint.
 *
 * @param {Object}   item       - The item being claimed/reported
 * @param {Function} onSuccess  - Callback when claim is successfully created
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
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};

    if (item.type === 'found') {
      if (!formData.itemColor.trim()) {
        newErrors.itemColor = 'Please describe the color of the item.';
      }
      if (!formData.uniqueFeature.trim()) {
        newErrors.uniqueFeature = 'Please describe a unique feature or mark.';
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
      newErrors.contactName = 'Please enter your name so the student registry can verify with you.';
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Ensure authentication token exists, falling back to demo session if needed
    let token = getAuthToken();
    if (!token) {
      try {
        const demoRes = await api.auth.getDemoToken();
        token = demoRes.token;
      } catch {
        const mockToken = 'demo-student-token';
        const mockUser = {
          id: '64f1a2b3c4d5e6f7a8b9c0d1',
          name: formData.contactName.trim() || 'Demo Student',
          email: 'student@chitkara.edu.in',
          role: 'student',
        };
        setAuthToken(mockToken);
        setStoredUser(mockUser);
      }
    }

    setIsSubmitting(true);

    try {
      const claimType = item.type === 'found' ? 'ownership_claim' : 'found_report';
      const itemId = item._id || item.id;

      const payload = {
        itemId,
        claimType,
        verificationAnswers: {
          itemColor: formData.itemColor.trim(),
          uniqueFeature: formData.uniqueFeature.trim(),
          lostLocation: formData.lostLocation.trim(),
          foundLocation: formData.foundLocation.trim(),
          foundDate: formData.foundDate.trim(),
          additionalInfo: formData.additionalInfo.trim(),
          contactName: formData.contactName.trim(),
        },
      };

      // Real API request to POST /api/claims
      const response = await api.claims.create(payload);

      // On successful submission, notify parent component with claim data
      onSuccess(response?.claim || { status: 'Pending', ...payload });
    } catch (err) {
      console.error('API claim submission error:', err);
      setApiError(err.message || 'Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
              so the finder and registry team can verify it belongs to you. Responses are strictly confidential.
            </p>
          </div>

          {apiError && (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.25rem' }}>
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <strong className="alert-title">Submission Error</strong>
                <p className="alert-text">{apiError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {renderField({
              label: 'What color is the item?',
              name: 'itemColor',
              placeholder: 'e.g., White, Black with silver trim…',
            })}

            {renderField({
              label: 'Describe a unique feature or marking on the item',
              name: 'uniqueFeature',
              placeholder: 'e.g., small scratch on bottom corner, initials engraved, specific keychain…',
              isTextarea: true,
            })}

            {renderField({
              label: 'Where did you originally lose this item?',
              name: 'lostLocation',
              placeholder: 'e.g., Library 2nd floor quiet room, near the Cafeteria entrance…',
            })}

            {renderField({
              label: 'Your Name',
              name: 'contactName',
              placeholder: 'Full name',
            })}

            <div className="form-info-box">
              <p>
                ℹ️ <strong>Status note:</strong> Submitting verification creates a <strong>Pending</strong> claim.
                The item will be marked as Claimed only after verification is approved.
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
                {isSubmitting ? '⏳ Submitting Verification…' : '✓ Submit Verification'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="verification-form-card">
          <div className="verification-form-header">
            <h2 className="verification-form-title">📦 Report Found Item</h2>
            <p className="verification-form-subtitle">
              You found <strong>{item.title}</strong>? Thank you! Please provide details
              below so the owner can be notified.
            </p>
          </div>

          {apiError && (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.25rem' }}>
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <strong className="alert-title">Submission Error</strong>
                <p className="alert-text">{apiError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {renderField({
              label: 'Where did you find this item on campus?',
              name: 'foundLocation',
              placeholder: 'e.g., Block B room 204, Cafeteria booth near window…',
            })}

            {renderField({
              label: 'When did you find it?',
              name: 'foundDate',
              type: 'date',
            })}

            {renderField({
              label: 'Additional information (optional)',
              name: 'additionalInfo',
              placeholder: 'Any other details that might help identify the owner or where the item is kept…',
              required: false,
              isTextarea: true,
            })}

            {renderField({
              label: 'Your Name',
              name: 'contactName',
              placeholder: 'Full name',
            })}

            <div className="form-info-box">
              <p>
                ℹ️ Thank you for helping reconnect this item with its owner!
                The report will be linked to this registry item.
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
                {isSubmitting ? '⏳ Submitting Report…' : '📤 Submit Found Report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default VerificationForm;
