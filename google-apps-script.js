// Hash password with salt using SHA-256
function hashPassword(password, salt) {
  try {
    const data = password + salt;
    const hashBuffer = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data);
    const hashArray = hashBuffer.map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    });
    return hashArray.join('');
  } catch (error) {
    Logger.log('hashPassword error: ' + error.toString());
    throw error;
  }
}

// Helper: update a user's CSV field (columnIndex is 1-based)
function updateUserField(email, columnIndex, updater) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const values = sheet.getDataRange().getValues();
  const userIndex = values.findIndex(row => row[0] === email);
  if (userIndex === -1) return { success: false, message: 'User not found' };
  const raw = values[userIndex][columnIndex - 1] || '';
  const current = raw ? raw.toString().split(',').filter(Boolean) : [];
  const updated = updater(current.slice()) || [];
  sheet.getRange(userIndex + 1, columnIndex).setValue(updated.join(','));
  return { success: true };
}

function saveArticleForEmail(email, articleUrl) {
  return updateUserField(email, 5, current => {
    if (!current.includes(articleUrl)) current.push(articleUrl);
    return current;
  });
}

function unsaveArticleForEmail(email, articleUrl) {
  return updateUserField(email, 5, current => current.filter(u => u !== articleUrl));
}

function likeArticleForEmail(email, articleUrl) {
  // remove from disliked, add to liked
  updateUserField(email, 7, current => current.filter(u => u !== articleUrl));
  return updateUserField(email, 6, current => {
    if (!current.includes(articleUrl)) current.push(articleUrl);
    return current;
  });
}

function dislikeArticleForEmail(email, articleUrl) {
  // remove from liked, add to disliked
  updateUserField(email, 6, current => current.filter(u => u !== articleUrl));
  return updateUserField(email, 7, current => {
    if (!current.includes(articleUrl)) current.push(articleUrl);
    return current;
  });
}

function removeRatingForEmail(email, articleUrl) {
  updateUserField(email, 6, current => current.filter(u => u !== articleUrl));
  return updateUserField(email, 7, current => current.filter(u => u !== articleUrl));
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const callback = e.parameter.callback; // Check for JSONP callback
    const sheet = SpreadsheetApp.getActiveSheet();

    let result;

    if (action === 'register') {
      const email = data.email;
      const salt = data.salt;
      const hash = data.hash;
      const role = data.role || 'user'; // Default to 'user' role

      // Check if email exists
      const values = sheet.getDataRange().getValues();
      const exists = values.some(row => row[0] === email);

      if (exists) {
        result = {success: false, message: 'Email already exists'};
      } else {
        // Add new user with role and empty preferences
        sheet.appendRow([email, salt, hash, role, '', '', '']);
        result = {success: true};
      }

    } else if (action === 'login') {
      const email = data.email;
      const password = data.password;

      const values = sheet.getDataRange().getValues();
      const userRow = values.find(row => row[0] === email);

      if (!userRow) {
        result = {success: false, message: 'Invalid credentials'};
      } else {
        const salt = userRow[1];
        const storedHash = userRow[2];
        const role = userRow[3] || 'user'; // Default to 'user' if no role specified
        const computedHash = hashPassword(password, salt);

        if (computedHash === storedHash) {
          result = {
            success: true,
            role: role,
            savedArticles: userRow[4] || '',
            likedArticles: userRow[5] || '',
            dislikedArticles: userRow[6] || ''
          };
        } else {
          result = {success: false, message: 'Invalid credentials'};
        }
      }

    } else if (action === 'saveArticle') {
      const email = data.email;
      const articleUrl = data.articleUrl;
      result = saveArticleForEmail(email, articleUrl);

    } else if (action === 'unsaveArticle') {
      const email = data.email;
      const articleUrl = data.articleUrl;
      result = unsaveArticleForEmail(email, articleUrl);

    } else if (action === 'likeArticle') {
      const email = data.email;
      const articleUrl = data.articleUrl;
      result = likeArticleForEmail(email, articleUrl);

    } else if (action === 'dislikeArticle') {
      const email = data.email;
      const articleUrl = data.articleUrl;
      result = dislikeArticleForEmail(email, articleUrl);

    } else if (action === 'removeRating') {
      const email = data.email;
      const articleUrl = data.articleUrl;
      result = removeRatingForEmail(email, articleUrl);

    } else {
      result = {success: false, message: 'Invalid action'};
    }

    // Return JSONP response if callback is provided, otherwise regular JSON
    const jsonResponse = JSON.stringify(result);
    if (callback) {
      return ContentService
        .createTextOutput(`${callback}(${jsonResponse})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService
        .createTextOutput(jsonResponse)
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    Logger.log('doPost error: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    const errorResult = {success: false, message: 'Server error'};
    const jsonResponse = JSON.stringify(errorResult);
    const callback = e.parameter ? e.parameter.callback : null;

    if (callback) {
      return ContentService
        .createTextOutput(`${callback}(${jsonResponse})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService
        .createTextOutput(jsonResponse)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

function doGet(e) {
  try {
    Logger.log('doGet called with parameters: ' + JSON.stringify(e.parameter));
    const action = e.parameter.action;
    const callback = e.parameter.callback;
    Logger.log('Action: ' + action + ', Callback: ' + callback);

    const sheet = SpreadsheetApp.getActiveSheet();
    Logger.log('Sheet name: ' + sheet.getName());
    Logger.log('Script executed successfully - basic setup complete');

    let result;

    if (action === 'register') {
      const email = e.parameter.email;
      const salt = e.parameter.salt;
      const hash = e.parameter.hash;
      const role = e.parameter.role || 'user';

      // Check if email exists
      const values = sheet.getDataRange().getValues();
      const exists = values.some(row => row[0] === email);

      if (exists) {
        result = {success: false, message: 'Email already exists'};
      } else {
        // Add new user with role and empty preferences
        sheet.appendRow([email, salt, hash, role, '', '', '']);
        result = {success: true};
      }

    } else if (action === 'login') {
      Logger.log('Login attempt for: ' + e.parameter.email);
      const email = e.parameter.email;
      const password = e.parameter.password;

      const values = sheet.getDataRange().getValues();
      Logger.log('Sheet has ' + values.length + ' rows');

      const userRow = values.find(row => row[0] === email);

      if (!userRow) {
        Logger.log('User not found: ' + email);
        result = {success: false, message: 'Invalid credentials'};
      } else {
        Logger.log('User found, checking password');
        const salt = userRow[1];
        const storedHash = userRow[2];
        Logger.log('Salt: ' + salt + ', Stored hash length: ' + storedHash.length);

        const computedHash = hashPassword(password, salt);
        Logger.log('Computed hash length: ' + computedHash.length);

        if (computedHash === storedHash) {
          Logger.log('Password match successful');
          result = {
            success: true,
            role: userRow[3] || 'user',
            savedArticles: userRow[4] || '',
            likedArticles: userRow[5] || '',
            dislikedArticles: userRow[6] || ''
          };
        } else {
          Logger.log('Password mismatch');
          result = {success: false, message: 'Invalid credentials'};
        }
      }

    } else if (action === 'saveArticle') {
      const email = e.parameter.email;
      const articleUrl = e.parameter.articleUrl;
      result = saveArticleForEmail(email, articleUrl);

    } else if (action === 'unsaveArticle') {
      const email = e.parameter.email;
      const articleUrl = e.parameter.articleUrl;
      result = unsaveArticleForEmail(email, articleUrl);

    } else if (action === 'likeArticle') {
      const email = e.parameter.email;
      const articleUrl = e.parameter.articleUrl;
      result = likeArticleForEmail(email, articleUrl);

    } else if (action === 'dislikeArticle') {
      const email = e.parameter.email;
      const articleUrl = e.parameter.articleUrl;
      result = dislikeArticleForEmail(email, articleUrl);

    } else if (action === 'removeRating') {
      const email = e.parameter.email;
      const articleUrl = e.parameter.articleUrl;
      result = removeRatingForEmail(email, articleUrl);

    } else if (action === 'getAllUsers') {
      result = getAllUsers(e.parameter.email);

    } else if (action === 'changeUserRole') {
      result = changeUserRole(e.parameter.email, e.parameter.targetEmail, e.parameter.role);

    } else {
      result = {success: false, message: 'Invalid action'};
    }

    // Return JSONP response
    const jsonResponse = JSON.stringify(result);
    return ContentService
      .createTextOutput(`${callback}(${jsonResponse})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    Logger.log('doGet error: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    const errorResult = {success: false, message: 'Server error'};
    const jsonResponse = JSON.stringify(errorResult);

    return ContentService
      .createTextOutput(`${callback}(${jsonResponse})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Helper function to get all users (for admin use only)
function getAllUsers(requestingEmail) {
  Logger.log('getAllUsers called with email: ' + requestingEmail);
  const sheet = SpreadsheetApp.getActiveSheet();
  const values = sheet.getDataRange().getValues();
  Logger.log('Sheet has ' + values.length + ' rows');

  const requestingUser = values.find(row => row[0] === requestingEmail);
  Logger.log('Requesting user found: ' + !!requestingUser);

  if (requestingUser) {
    Logger.log('Requesting user role: ' + requestingUser[3]);
  }

  if (!requestingUser || requestingUser[3] !== 'admin') {
    Logger.log('Unauthorized access attempt');
    return {success: false, message: 'Unauthorized'};
  }

  // Return all users (excluding sensitive data like passwords)
  const users = values.map(row => ({
    email: row[0],
    role: row[3] || 'user',
    savedArticles: row[4] || '',
    likedArticles: row[5] || '',
    dislikedArticles: row[6] || ''
  }));

  Logger.log('Returning ' + users.length + ' users');
  return {success: true, users: users};
}

// Helper function to change user role (admin only)
function changeUserRole(requestingEmail, targetEmail, newRole) {
  Logger.log('changeUserRole called: ' + requestingEmail + ' -> ' + targetEmail + ' role: ' + newRole);
  const sheet = SpreadsheetApp.getActiveSheet();
  const values = sheet.getDataRange().getValues();
  const requestingUser = values.find(row => row[0] === requestingEmail);
  const targetUserIndex = values.findIndex(row => row[0] === targetEmail);

  Logger.log('Requesting user found: ' + !!requestingUser + ', Target user index: ' + targetUserIndex);

  if (!requestingUser || requestingUser[3] !== 'admin') {
    Logger.log('Unauthorized access attempt');
    return {success: false, message: 'Unauthorized'};
  }

  if (targetUserIndex === -1) {
    Logger.log('Target user not found');
    return {success: false, message: 'User not found'};
  }

  if (!['user', 'admin'].includes(newRole)) {
    Logger.log('Invalid role: ' + newRole);
    return {success: false, message: 'Invalid role'};
  }

  // Update the user's role
  sheet.getRange(targetUserIndex + 1, 4).setValue(newRole);
  Logger.log('Role updated successfully');
  return {success: true};
}
