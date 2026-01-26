// Hash password with salt using SHA-256
function hashPassword(password, salt) {
  const data = password + salt;
  const hashBuffer = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data);
  const hashArray = hashBuffer.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  });
  return hashArray.join('');
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

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        result = {success: false, message: 'User not found'};
      } else {
        const currentSaved = values[userIndex][4] || '';
        const savedArticles = currentSaved ? currentSaved.split(',') : [];

        if (!savedArticles.includes(articleUrl)) {
          savedArticles.push(articleUrl);
          sheet.getRange(userIndex + 1, 5).setValue(savedArticles.join(','));
        }
        result = {success: true};
      }

    } else if (action === 'unsaveArticle') {
      const email = data.email;
      const articleUrl = data.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        result = {success: false, message: 'User not found'};
      } else {
        const currentSaved = values[userIndex][4] || '';
        const savedArticles = currentSaved ? currentSaved.split(',') : [];
        const filteredArticles = savedArticles.filter(url => url !== articleUrl);
        sheet.getRange(userIndex + 1, 5).setValue(filteredArticles.join(','));
        result = {success: true};
      }

    } else if (action === 'likeArticle') {
      const email = data.email;
      const articleUrl = data.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        result = {success: false, message: 'User not found'};
      } else {
        const currentLiked = values[userIndex][5] || '';
        const currentDisliked = values[userIndex][6] || '';
        const likedArticles = currentLiked ? currentLiked.split(',') : [];
        const dislikedArticles = currentDisliked ? currentDisliked.split(',') : [];

        // Remove from disliked if present
        const filteredDisliked = dislikedArticles.filter(url => url !== articleUrl);
        // Add to liked if not already there
        if (!likedArticles.includes(articleUrl)) {
          likedArticles.push(articleUrl);
        }

        sheet.getRange(userIndex + 1, 6).setValue(likedArticles.join(','));
        sheet.getRange(userIndex + 1, 7).setValue(filteredDisliked.join(','));
        result = {success: true};
      }

    } else if (action === 'dislikeArticle') {
      const email = data.email;
      const articleUrl = data.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        result = {success: false, message: 'User not found'};
      } else {
        const currentLiked = values[userIndex][5] || '';
        const currentDisliked = values[userIndex][6] || '';
        const likedArticles = currentLiked ? currentLiked.split(',') : [];
        const dislikedArticles = currentDisliked ? currentDisliked.split(',') : [];

        // Remove from liked if present
        const filteredLiked = likedArticles.filter(url => url !== articleUrl);
        // Add to disliked if not already there
        if (!dislikedArticles.includes(articleUrl)) {
          dislikedArticles.push(articleUrl);
        }

        sheet.getRange(userIndex + 1, 6).setValue(filteredLiked.join(','));
        sheet.getRange(userIndex + 1, 7).setValue(dislikedArticles.join(','));
        result = {success: true};
      }

    } else if (action === 'removeRating') {
      const email = data.email;
      const articleUrl = data.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        result = {success: false, message: 'User not found'};
      } else {
        const currentLiked = values[userIndex][5] || '';
        const currentDisliked = values[userIndex][6] || '';
        const likedArticles = currentLiked ? currentLiked.split(',') : [];
        const dislikedArticles = currentDisliked ? currentDisliked.split(',') : [];

        // Remove from both lists
        const filteredLiked = likedArticles.filter(url => url !== articleUrl);
        const filteredDisliked = dislikedArticles.filter(url => url !== articleUrl);

        sheet.getRange(userIndex + 1, 6).setValue(filteredLiked.join(','));
        sheet.getRange(userIndex + 1, 7).setValue(filteredDisliked.join(','));
        result = {success: true};
      }

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

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        result = {success: false, message: 'User not found'};
      } else {
        const currentSaved = values[userIndex][4] || '';
        const savedArticles = currentSaved ? currentSaved.split(',') : [];

        if (!savedArticles.includes(articleUrl)) {
          savedArticles.push(articleUrl);
          sheet.getRange(userIndex + 1, 5).setValue(savedArticles.join(','));
        }
        result = {success: true};
      }

    } else if (action === 'unsaveArticle') {
      const email = e.parameter.email;
      const articleUrl = e.parameter.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        result = {success: false, message: 'User not found'};
      } else {
        const currentSaved = values[userIndex][4] || '';
        const savedArticles = currentSaved ? currentSaved.split(',') : [];
        const filteredArticles = savedArticles.filter(url => url !== articleUrl);
        sheet.getRange(userIndex + 1, 5).setValue(filteredArticles.join(','));
        result = {success: true};
      }

    } else if (action === 'likeArticle') {
      const email = e.parameter.email;
      const articleUrl = e.parameter.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        result = {success: false, message: 'User not found'};
      } else {
        const currentLiked = values[userIndex][5] || '';
        const currentDisliked = values[userIndex][6] || '';
        const likedArticles = currentLiked ? currentLiked.split(',') : [];
        const dislikedArticles = currentDisliked ? currentDisliked.split(',') : [];

        // Remove from disliked if present
        const filteredDisliked = dislikedArticles.filter(url => url !== articleUrl);
        // Add to liked if not already there
        if (!likedArticles.includes(articleUrl)) {
          likedArticles.push(articleUrl);
        }

        sheet.getRange(userIndex + 1, 6).setValue(likedArticles.join(','));
        sheet.getRange(userIndex + 1, 7).setValue(filteredDisliked.join(','));
        result = {success: true};
      }

    } else if (action === 'dislikeArticle') {
      const email = e.parameter.email;
      const articleUrl = e.parameter.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        result = {success: false, message: 'User not found'};
      } else {
        const currentLiked = values[userIndex][5] || '';
        const currentDisliked = values[userIndex][6] || '';
        const likedArticles = currentLiked ? currentLiked.split(',') : [];
        const dislikedArticles = currentDisliked ? currentDisliked.split(',') : [];

        // Remove from liked if present
        const filteredLiked = likedArticles.filter(url => url !== articleUrl);
        // Add to disliked if not already there
        if (!dislikedArticles.includes(articleUrl)) {
          dislikedArticles.push(articleUrl);
        }

        sheet.getRange(userIndex + 1, 6).setValue(filteredLiked.join(','));
        sheet.getRange(userIndex + 1, 7).setValue(dislikedArticles.join(','));
        result = {success: true};
      }

    } else if (action === 'removeRating') {
      const email = e.parameter.email;
      const articleUrl = e.parameter.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        result = {success: false, message: 'User not found'};
      } else {
        const currentLiked = values[userIndex][5] || '';
        const currentDisliked = values[userIndex][6] || '';
        const likedArticles = currentLiked ? currentLiked.split(',') : [];
        const dislikedArticles = currentDisliked ? currentDisliked.split(',') : [];

        // Remove from both lists
        const filteredLiked = likedArticles.filter(url => url !== articleUrl);
        const filteredDisliked = dislikedArticles.filter(url => url !== articleUrl);

        sheet.getRange(userIndex + 1, 6).setValue(filteredLiked.join(','));
        sheet.getRange(userIndex + 1, 7).setValue(filteredDisliked.join(','));
        result = {success: true};
      }

    } else {
      result = {success: false, message: 'Invalid action'};
    }

    // Return JSONP response
    const jsonResponse = JSON.stringify(result);
    return ContentService
      .createTextOutput(`${callback}(${jsonResponse})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    Logger.log('doPost error: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    const errorResult = {success: false, message: 'Server error'};
    const jsonResponse = JSON.stringify(errorResult);
    const callback = e.parameter.callback;

    return ContentService
      .createTextOutput(`${callback}(${jsonResponse})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}
