const fs = require('fs');
let content = fs.readFileSync('src/components/CustomAppSection.tsx', 'utf8');

// Add to formData
content = content.replace(
  "    businessName: '',",
  "    businessName: '',\n    customerName: '',\n    customerPhone: '',"
);

// Update contactInfo payload
content = content.replace(
  "contactInfo: formData.businessName,",
  "contactInfo: `نام: ${formData.customerName} | موبایل: ${formData.customerPhone} | کسب‌وکار: ${formData.businessName}`,"
);

// Update form validation
content = content.replace(
  "if (!formData.type || !formData.businessName || !formData.description) {",
  "if (!formData.type || !formData.businessName || !formData.description || !formData.customerName || !formData.customerPhone) {"
);

// We don't have description in the initial state? Let's check what the required fields are.
