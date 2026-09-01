// ============================================
// Campus Lost & Found — ReportFound Page (Member 2)
// ============================================
import React, { useState } from 'react'; // store and change data inside component  
import { Link } from 'react-router-dom'; // to navigate to different page 
import { CATEGORIES, LOCATIONS } from '../data/sampleItems'; //import category and location list
import { addItem } from '../utils/storage'; //store and retreive data 

const ReportFound = () => { // call this 
  // Controlled form state
  const [formData, setFormData] = useState({ //update the data by setformdata create data by formdata
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
  const [imagePreview, setImagePreview] = useState(''); //store data select by user and save as preview

  // Form validation errors
  const [errors, setErrors] = useState({}); //store error data 

  // Submission success status
  const [isSubmitted, setIsSubmitted] = useState(false); //form submitt succesfully show success page

  // Today's date YYYY-MM-DD for date input max attribute
  const todayDate = new Date().toISOString().split('T')[0]; //disable future dates from the calendar

  // Handle controlled input changes
  const handleChange = (e) => { //user chage input it calls 
    const { name, value } = e.target;
    setFormData((prev) => ({ //update the data
      ...prev, //store all old values 
      [name]: value,
    }));

    if (errors[name]) { //remove error when  start
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle Image upload and FileReader DataURL conversion
  const handleImageChange = (e) => { //image input handle
    const file = e.target.files[0]; //get first file select 
    if (!file) return; //stop function when nothing select 

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) { // check image format allowed 
      setErrors((prev) => ({
        ...prev,
        image: 'Please upload a valid image file (JPG, PNG, or WEBP).',
      }));
      return;
    }

    // Validate max file size (5MB)
    if (file.size > 5 * 1024 * 1024) { //check file size 5mb
      setErrors((prev) => ({
        ...prev,
        image: 'Image size exceeds the 5MB limit.',
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: null })); //remove image error

    const reader = new FileReader(); //filereader is browser api read image data
    reader.onloadend = () => { //when file reader read image it calls 
      const dataUrl = reader.result; //dataurl is the 
      setImagePreview(dataUrl); //show image preview
      setFormData((prev) => ({ //image also stored in formdata in url format so that we can show image in success page and save in local storage
        ...prev,
        image: dataUrl,
      }));
    };
    reader.readAsDataURL(file); //read the image data convert into data url format
  };

  // Remove uploaded image
  const handleRemoveImage = () => { //function remove selected image 
    setImagePreview(''); //remove image preview
    setFormData((prev) => ({ ...prev, image: '' })); //remove img from data 
    const fileInput = document.getElementById('found-image-input'); //get file input 
    if (fileInput) fileInput.value = ''; //reset file input 
  };

  // Form Validation logic
  const validateForm = () => { //validate form data 
    const newErrors = {}; //store errors 

    if (!formData.title || !formData.title.trim()) { //validate title 
      newErrors.title = 'Item name is required.';
    } else if (formData.title.trim().length < 2) { //validate title 
      newErrors.title = 'Item name must be at least 2 characters.';
    }

    if (!formData.category) { //validate category 
      newErrors.category = 'Please select an item category.';
    }

    if (!formData.location) { //validate location 
      newErrors.location = 'Please select the location where the item was found.';
    }

    if (!formData.date) { //validate date 
      newErrors.date = 'Found date is required.';
    } else if (new Date(formData.date) > new Date()) { //validate date 
      newErrors.date = 'Found date cannot be in the future.';
    }

    if (!formData.description || !formData.description.trim()) { //check description is empty 
      newErrors.description = 'Item description is required.';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Please enter at least 10 characters describing the item.';
    }

    if (!formData.currentLocation || !formData.currentLocation.trim()) { //check current location is empty
      newErrors.currentLocation = 'Please specify where the item is currently kept or handed over.';
    }

    setErrors(newErrors); //set errors
    return Object.keys(newErrors).length === 0; //return true if no errors
  };

  // Handle Form Submission
  const handleSubmit = (e) => { //submit form
    e.preventDefault();// prevent from refreshing page 

    if (!validateForm()) { //if form is not valid return 
      return;
    }

    const newItem = { //new item created found item 
      id: Date.now(), //unique id
      type: 'found', //type of item
      title: formData.title.trim(), //title of item
      category: formData.category, //category of item
      description: formData.description.trim(), //description of item
      location: formData.location, //location of item
      date: formData.date, //date of item
      currentLocation: formData.currentLocation.trim(), //current location of item
      contact: formData.contact ? formData.contact.trim() : 'Campus Security Desk', //contact of item ternary item
      image: formData.image, //image of item
      status: 'Open', //status of item
      createdBy: 'Student', //created by
      createdAt: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    };

    addItem(newItem); //sends new item to storage system 
    setIsSubmitted(true); // submision status 
  };

  const handleReportAnother = () => { // reset form 
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
    <main className="page"> // main page container
      <div className="page__header"> // page header container
        <h1 className="page__title">Report a Found Item</h1> // title
        <p className="page__subtitle"> // subtitle
          Help reunite a lost belonging with its owner by providing accurate details. //subtitle
        </p>
      </div>

      {isSubmitted ? ( // if form is submitted show this section
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
        <div className="card form-card"> // form card container
          <form onSubmit={handleSubmit} noValidate> // when from subbmit onsubmit=handlesubmit calls
            {/* 1. Item Title */}
            <div className="form-group"> // form group container
              <label htmlFor="found-title" className="form-label"> // label
                Item Name <span className="required-asterisk">*</span> // required field indicator
              </label>
              <input
                id="found-title"
                type="text"
                name="title" // data came form formdata.title 
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                placeholder="e.g. Black Leather Wallet, Student ID Card, Blue Water Bottle"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <span className="error-message">⚠️ {errors.title}</span>} // display the error message if it is
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
                  {CATEGORIES.map((cat) => ( // get id from url
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
                    <option key={loc} value={loc}> // loops through all campus location
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
                  max={todayDate} // sets maximum date that can be selected
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
                rows="4" // con not conatin multiple lines
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
                  accept="image/jpeg,image/jpg,image/png,image/webp" // accept only these formats
                  className="file-input" // input field for image upload
                  onChange={handleImageChange} // when image is selected call handleimagechange function
                />
                <label htmlFor="found-image-input" className="btn-upload-trigger">
                  📷 Choose Image
                </label>
                <div className="upload-hint">Supported formats: JPG, PNG, WEBP (Max 5MB)</div>

                {imagePreview && (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview} // display selected image 
                      alt="Found Item Preview"
                      className="image-preview"
                    />
                    <button
                      type="button" // button to remove image
                      className="btn-remove-image"
                      onClick={handleRemoveImage} // remove image when clicked 
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
              <button type="submit" className="btn btn--secondary btn--full"> //prevents page refresh validates the form creates the item object saves it displays success
                Report Found Item
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default ReportFound; // export the component available to other file 

