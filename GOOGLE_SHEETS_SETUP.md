# Google Sheets Authentication Setup Guide

## Overview
Your authentication system has been updated to store user emails and encrypted passwords in Google Sheets instead of localStorage. The system now supports **role-based access control** with two user types:

- **Admin Users**: Access to administrative functions and the admin dashboard
- **Regular Users**: Access to personal profile and account management

This provides a secure, scalable authentication system with centralized user management.

## Security Features
- **SHA-256 Password Hashing** with unique salts per user
- **Email-based Authentication** instead of usernames
- **Secure API Communication** via HTTPS
- **Centralized User Management** in Google Sheets

## Setup Instructions

### 1. Create Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet named "UserAuthentication"
3. In row 1, add headers: `Email`, `Salt`, `PasswordHash`, `Role`, `SavedArticles`, `LikedArticles`, `DislikedArticles`
4. Note the spreadsheet ID from the URL (long string between `/d/` and `/edit`)

### 2. Create Google Apps Script
1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete the default code
3. Copy and paste the code from `google-apps-script.js` in this directory
4. Click **Save**

### 3. Deploy as Web App
1. Click **Deploy > New deployment**
2. Select type: **Web app**
3. Configure:
   - **Description**: User Auth API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Copy the web app URL** - you'll need this next

### 4. Update JavaScript Code
1. Open `admin-auth.js`
2. Find the line: `const APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';`
3. Replace `'YOUR_WEB_APP_URL_HERE'` with your deployed web app URL

### 5. Authorize Permissions
1. The first deployment will ask for permissions
2. Grant access to Google Sheets and Apps Script

### 6. Migrate Existing Users (Optional)
If you have existing users, manually add them to your Google Sheet with proper salts/hashes and roles:
- Column A: Email
- Column B: Random salt string (e.g., "abc123def456")
- Column C: SHA-256 hash of (password + salt)
- Column D: Role ("admin" for administrators, "user" for regular users)

**Important:** Only add "admin" role for trusted administrators. Regular user registrations will automatically get "user" role.

## How It Works

### Registration
1. User enters email and password
2. System generates unique salt
3. Password + salt is hashed with SHA-256
4. Data is sent to Google Apps Script
5. Apps Script adds user to Google Sheet

### Login
1. User enters email and password
2. System retrieves salt from Google Sheet
3. Password + salt is hashed and compared
4. Success/failure returned to client

## File Changes Made

### `index.html`
- Changed username input to email input: `<input type="email" id="username" ...>`

### `admin-auth.js`
- Replaced localStorage with Google Sheets API calls
- Added salt-based password hashing
- Updated to use email instead of username
- Added error handling for network issues

## Testing

1. Try registering a new account
2. Verify the data appears in your Google Sheet
3. Try logging in with the new account
4. Test error cases (duplicate email, wrong password, etc.)

## User Preferences Storage

The system now stores user article preferences in Google Sheets:

- **SavedArticles**: Comma-separated list of saved article URLs
- **LikedArticles**: Comma-separated list of liked article URLs  
- **DislikedArticles**: Comma-separated list of disliked article URLs

### Article Interaction Features

Users can now:
- **Save Articles**: Save articles to their profile for later reading
- **Like Articles**: Express positive feedback on content
- **Dislike Articles**: Express negative feedback on content
- **View Saved Articles**: Access all saved articles from their profile page

### Article Pages

Article pages now include interaction buttons that:
- Show current user preferences on page load
- Update in real-time when clicked
- Require user authentication
- Provide visual feedback for all actions

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure your site uses HTTPS
2. **Permission Denied**: Re-authorize the Apps Script
3. **Execution Limits**: Upgrade to Google Workspace for higher limits
4. **Network Errors**: Check internet connection and Apps Script URL

### Debug Tips:
- Check browser console for JavaScript errors
- View Apps Script execution logs in the Apps Script editor
- Test the web app URL directly in a browser

## Migration from localStorage

Your old user data in localStorage will no longer work. You'll need to:
1. Recreate accounts through the new system, or
2. Manually migrate users to the Google Sheet with proper salts and hashes

The old `admin-auth-old.js` file is preserved for reference.