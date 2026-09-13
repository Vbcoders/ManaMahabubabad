// ManaMahabubabad Admin Configuration
// This email must also exist as a Firebase Authentication user.
const ADMIN_EMAIL = 'vikasvikas3339@gmail.com';
// Load the push composer after the admin page markup exists.
const pushAdminScript=document.createElement('script');
pushAdminScript.src='notification-admin.js?v=20260913-1';
document.body.appendChild(pushAdminScript);
