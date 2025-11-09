// Wait for the DOM to be fully loaded before running any script
document.addEventListener("DOMContentLoaded", () => {
  
  // Check which page is currently loaded by looking at the body's ID
  const pageId = document.body.id;

  if (pageId === "page-booking") {
    initBookingForm();
  } else if (pageId === "page-contact") {
    initContactForm();
  }

});

// --- Validation Helper Functions ---

/**
 * Validates an email for a basic format (must contain @ and .)
 * @param {string} email - The email string to validate.
 * @returns {boolean} - True if valid, false if not.
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // A simple check for @ and . (as requested)
  // return email.includes('@') && email.includes('.');
  
  // Using a more robust regex is better practice:
  return re.test(String(email).toLowerCase());
}

/**
 * Validates a phone number (must be exactly 10 digits, numbers only).
 * @param {string} phone - The phone string to validate.
 * @returns {boolean} - True if valid, false if not.
 */
function validatePhone(phone) {
  const re = /^\d{10}$/; // Exactly 10 digits
  return re.test(String(phone));
}

/**
 * Shows an error message for a specific input field.
 * @param {string} inputId - The ID of the input field (e.g., "name").
 * @param {string} message - The error message to display.
 */
function showError(inputId, message) {
  const errorElement = document.getElementById(`${inputId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

/**
 * Clears a specific error message.
 * @param {string} inputId - The ID of the input field (e.g., "name").
 */
function clearError(inputId) {
  const errorElement = document.getElementById(`${inputId}-error`);
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
}

/**
 * Clears all error messages within a form.
 * @param {Element} form - The form element.
 */
function clearAllErrors(form) {
    const errorMessages = form.querySelectorAll(".error-message");
    errorMessages.forEach((msg) => {
        msg.textContent = "";
        msg.style.display = "none";
    });
}

// --- Page-Specific Initializers ---

/**
 * Sets up the validation logic for the Booking Form.
 */
function initBookingForm() {
  const form = document.getElementById("booking-form");
  const successMessage = document.getElementById("booking-message");

  // Get all form elements
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const countryCode = document.getElementById("country-code");
  const roomType = document.getElementById("room-type");
  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");
  const guests = document.getElementById("guests");

  // --- Date Picker Logic ---
  // Set minimum check-in date to today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const dd = String(today.getDate()).padStart(2, '0');
  const todayString = `${yyyy}-${mm}-${dd}`;
  
  checkin.min = todayString;

  // When check-in date changes, set minimum check-out date
  checkin.addEventListener("change", () => {
    if (checkin.value) {
      const checkinDate = new Date(checkin.value);
      // Add 1 day to check-in date
      checkinDate.setDate(checkinDate.getDate() + 1);
      
      const nextDay_yyyy = checkinDate.getFullYear();
      const nextDay_mm = String(checkinDate.getMonth() + 1).padStart(2, '0');
      const nextDay_dd = String(checkinDate.getDate()).padStart(2, '0');
      const checkoutMinDate = `${nextDay_yyyy}-${nextDay_mm}-${nextDay_dd}`;
      
      checkout.min = checkoutMinDate;

      // Optional: Clear checkout date if it's no longer valid
      if (checkout.value && checkout.value < checkoutMinDate) {
        checkout.value = "";
      }
    } else {
      // If check-in is cleared, clear checkout's min
      checkout.min = ""; 
    }
  });
  // --- End Date Picker Logic ---

  form.addEventListener("submit", (event) => {
    // Prevent the form from submitting the traditional way
    event.preventDefault();
    
    let isValid = true;
    clearAllErrors(form);
    successMessage.style.display = "none"; // Hide old success message

    // --- Perform Validations ---
    if (name.value.trim() === "") {
      isValid = false;
      showError("name", "Full Name is required.");
    }

    if (email.value.trim() === "") {
      isValid = false;
      showError("email", "Email Address is required.");
    } else if (!validateEmail(email.value)) {
      isValid = false;
      showError("email", "Please enter a valid email (e.g., name@example.com).");
    }

    if (countryCode.value.trim() === "") {
        isValid = false;
        // We show the error on the 'phone' field since they are related
        showError("phone", "Please select a country code.");
    }

    if (phone.value.trim() === "") {
      isValid = false;
      showError("phone", "Phone Number is required.");
    } else if (!validatePhone(phone.value)) {
      isValid = false;
      showError("phone", "Phone Number must be exactly 10 digits.");
    }

    if (roomType.value === "") {
      isValid = false;
      showError("room-type", "Please select a room type.");
    }

    if (checkin.value === "") {
      isValid = false;
      showError("checkin", "Check-in date is required.");
    }

    if (checkout.value === "") {
      isValid = false;
      showError("checkout", "Check-out date is required.");
    }
    
    // --- New Date Validation Logic ---
    // Only run this if both dates are filled in (required checks passed)
    if (checkin.value && checkout.value) {
      const checkinDate = new Date(checkin.value);
      const checkoutDate = new Date(checkout.value);
      
      // Create a 'today' date set to midnight (to compare dates only)
      const todayForCompare = new Date();
      todayForCompare.setHours(0, 0, 0, 0); 

      if (checkinDate < todayForCompare) {
        isValid = false;
        showError("checkin", "Check-in date cannot be in the past.");
      }

      if (checkoutDate <= checkinDate) {
        isValid = false;
        showError("checkout", "Check-out date must be after the check-in date.");
      }
    }
    // --- End New Date Validation ---

    if (guests.value === "") {
      isValid = false;
      showError("guests", "Please select the number of guests.");
    }

    // --- Handle Submission ---
    if (isValid) {
      // Show success message
      successMessage.textContent = "Booking confirmed! We will contact you shortly.";
      successMessage.className = "form-message success";
      successMessage.style.display = "block";
      
      // Reset the form
      form.reset();

      // Optional: Hide the success message after a few seconds
      setTimeout(() => {
        successMessage.style.display = "none";
      }, 5000); // 5 seconds
    }
  });
}

/**
 * Sets up the validation logic for the Contact Form.
 */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const successMessage = document.getElementById("contact-message");

  // Get all form elements
  const name = document.getElementById("contact-name");
  const email = document.getElementById("contact-email");
  const subject = document.getElementById("subject");
  const message = document.getElementById("message");

  form.addEventListener("submit", (event) => {
    // Prevent the form from submitting
    event.preventDefault();

    let isValid = true;
    clearAllErrors(form);
    successMessage.style.display = "none"; // Hide old success message

    // --- Perform Validations ---
    if (name.value.trim() === "") {
      isValid = false;
      showError("contact-name", "Your Name is required.");
    }

    if (email.value.trim() === "") {
      isValid = false;
      showError("contact-email", "Email Address is required.");
    } else if (!validateEmail(email.value)) {
      isValid = false;
      showError("contact-email", "Please enter a valid email (e.g., name@example.com).");
    }
    
    if (subject.value.trim() === "") {
      isValid = false;
      showError("subject", "Subject is required.");
    }
    
    if (message.value.trim() === "") {
      isValid = false;
      showError("message", "Message is required.");
    }

    // --- Handle Submission ---
    if (isValid) {
      // Show success message
      successMessage.textContent = "Thank you! Your message has been sent.";
      successMessage.className = "form-message success";
      successMessage.style.display = "block";
      
      // Reset the form
      form.reset();

      // Optional: Hide the success message after a few seconds
      setTimeout(() => {
        successMessage.style.display = "none";
      }, 5000); // 5 seconds
    }
  });
}