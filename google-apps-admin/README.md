YUNity Admin (Google Apps Script)

This scaffold provides a minimal Google Apps Script web app to host the admin dashboard behind Google account access.

Files
- `Code.gs` - Server-side Apps Script code. Replace `ALLOWED_ADMINS` with your admin email addresses.
- `Index.html` - Admin single-page UI. Calls server methods via `google.script.run`.
- `appsscript.json` - Project manifest.

Deployment
1. Open script.google.com and create a new project.
2. Copy `Code.gs`, `Index.html` and `appsscript.json` into the project (create new files and paste contents).
3. In `Code.gs`, update `ALLOWED_ADMINS` to include your admin Google account(s).
4. Click Deploy → New deployment → Select "Web app".
   - Execute as: Me
   - Who has access: Anyone (or "Only myself" / "Anyone within <your domain>" depending on your needs)
5. Deploy and note the Web app URL.
6. Update your site `admin.html` or the admin link to point to the new Web app URL.

Notes
- This scaffold stores articles in `PropertiesService` as JSON for simplicity. For production, use a Google Sheet, Firestore, or another DB.
- Apps Script will automatically authenticate users with Google accounts. The server checks `Session.getActiveUser().getEmail()` against `ALLOWED_ADMINS` to gate access.
