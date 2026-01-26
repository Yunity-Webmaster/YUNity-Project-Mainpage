function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const sheet = SpreadsheetApp.getActiveSheet();

    if (action === 'register') {
      const email = data.email;
      const salt = data.salt;
      const hash = data.hash;
      const role = data.role || 'user'; // Default to 'user' role

      // Check if email exists
      const values = sheet.getDataRange().getValues();
      const exists = values.some(row => row[0] === email);

      if (exists) {
        return ContentService
          .createTextOutput(JSON.stringify({success: false, message: 'Email already exists'}))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Add new user with role and empty preferences
      sheet.appendRow([email, salt, hash, role, '', '', '']);
      return ContentService
        .createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);

    } else if (action === 'login') {
      const email = data.email;
      const password = data.password;

      const values = sheet.getDataRange().getValues();
      const userRow = values.find(row => row[0] === email);

      if (!userRow) {
        return ContentService
          .createTextOutput(JSON.stringify({success: false, message: 'Invalid credentials'}))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const salt = userRow[1];
      const storedHash = userRow[2];
      const role = userRow[3] || 'user'; // Default to 'user' if no role specified
      const computedHash = hashPassword(password, salt);

      if (computedHash === storedHash) {
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            role: role,
            savedArticles: userRow[4] || '',
            likedArticles: userRow[5] || '',
            dislikedArticles: userRow[6] || ''
          }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService
          .createTextOutput(JSON.stringify({success: false, message: 'Invalid credentials'}))
          .setMimeType(ContentService.MimeType.JSON);
      }

    } else if (action === 'saveArticle') {
      const email = data.email;
      const articleUrl = data.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        return ContentService
          .createTextOutput(JSON.stringify({success: false, message: 'User not found'}))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const currentSaved = values[userIndex][4] || '';
      const savedArticles = currentSaved ? currentSaved.split(',') : [];

      if (!savedArticles.includes(articleUrl)) {
        savedArticles.push(articleUrl);
        sheet.getRange(userIndex + 1, 5).setValue(savedArticles.join(','));
      }

      return ContentService
        .createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);

    } else if (action === 'unsaveArticle') {
      const email = data.email;
      const articleUrl = data.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        return ContentService
          .createTextOutput(JSON.stringify({success: false, message: 'User not found'}))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const currentSaved = values[userIndex][4] || '';
      const savedArticles = currentSaved ? currentSaved.split(',') : [];
      const filteredArticles = savedArticles.filter(url => url !== articleUrl);

      sheet.getRange(userIndex + 1, 5).setValue(filteredArticles.join(','));

      return ContentService
        .createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);

    } else if (action === 'likeArticle') {
      const email = data.email;
      const articleUrl = data.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        return ContentService
          .createTextOutput(JSON.stringify({success: false, message: 'User not found'}))
          .setMimeType(ContentService.MimeType.JSON);
      }

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

      return ContentService
        .createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);

    } else if (action === 'dislikeArticle') {
      const email = data.email;
      const articleUrl = data.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        return ContentService
          .createTextOutput(JSON.stringify({success: false, message: 'User not found'}))
          .setMimeType(ContentService.MimeType.JSON);
      }

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

      return ContentService
        .createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);

    } else if (action === 'removeRating') {
      const email = data.email;
      const articleUrl = data.articleUrl;

      const values = sheet.getDataRange().getValues();
      const userIndex = values.findIndex(row => row[0] === email);

      if (userIndex === -1) {
        return ContentService
          .createTextOutput(JSON.stringify({success: false, message: 'User not found'}))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const currentLiked = values[userIndex][5] || '';
      const currentDisliked = values[userIndex][6] || '';

      const likedArticles = currentLiked ? currentLiked.split(',') : [];
      const dislikedArticles = currentDisliked ? currentDisliked.split(',') : [];

      // Remove from both lists
      const filteredLiked = likedArticles.filter(url => url !== articleUrl);
      const filteredDisliked = dislikedArticles.filter(url => url !== articleUrl);

      sheet.getRange(userIndex + 1, 6).setValue(filteredLiked.join(','));
      sheet.getRange(userIndex + 1, 7).setValue(filteredDisliked.join(','));

      return ContentService
        .createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Server error'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function hashPassword(password, salt) {
  const toHash = password + salt;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, toHash);
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}