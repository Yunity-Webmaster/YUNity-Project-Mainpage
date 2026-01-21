let article;
let author;
let title;
let date;
let readingTime;
let citationSource;
let image;

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('articleForm');
    if (!form) return;

    // Use the submit event to collect all values at once and prevent the default submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        article = document.getElementById('articleContent').value;
        author = document.getElementById('articleAuthor').value;
        title = document.getElementById('articleTitle').value;
        date = document.getElementById('articleDate').value;
        readingTime = document.getElementById('articleReadTime').value;
        citationSource = document.getElementById('articleCitationPage').value;
        image = document.getElementById('articleImage').value;

        // Log everything together so you see all values clearly
        console.log({ article, author, title, date, readingTime, citationSource, image });
    });
});






