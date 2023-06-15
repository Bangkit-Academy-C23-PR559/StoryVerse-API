# StoryVerse-API Documentation 
API that serving various back-end in our Android app. 🔧

## Prerequisite
- Node.js
- Python 3.9 (For Deploy ML only)

## Setup
- Clone Main API Repo
  ```
  git clone https://github.com/Bangkit-Academy-C23-PR559/StoryVerse-API.git
  ```
- Clone ML Model for **Recommend Titles by Category API:**
  ```
  git clone https://github.com/Bangkit-Academy-C23-PR559/StoryVerse-Machine-Learning.git
  ```
- Install dependencies
  ```
  npm install cheerio cors express mutler node-fetch csv-parser firebase-admin storage axios body-parser tfjs uuid
  ```  
- Run the API
  ```
  npm start index.js
  ```


## Login
- base url : ```https://backend-dot-storyverse-app.et.r.appspot.com/api/login```
- Method : ```POST```
- Data Params :
  ```
  email, password
  ```
- Response :
  ```
  {
    "error": false,
    "message": "Success",
    "loginResult": {
        "userId": "6QXuQgzgcTneLIP7VTdi",
        "name": "dummy-test",
        "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTY4NTM3NzU0NiwiZXhwIjoxNjg1MzgxMTQ2LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay13ZHZ4akBzdG9yeXZlcnNlLWFwcC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLXdkdnhqQHN0b3J5dmVyc2UtYXBwLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoiNlFYdVFnemdjVG5lTElQN1ZUZGkifQ.edhRffE0MbpYXbDuVHekJJ8_iLZIw0WMx7CtL17HWvCh9O3vFNNF6Auj3TA7L_YmcYUTTbkoL0H-910YEgDTZ2yfOtN4WC1Wvi1AOjQxNnRs2ceBQOjimxmfwelbcFmffK4XzfmRW8F6hTJSDIfCQaWYFCRQ7sA1eMb1WtN7Tm7bNBwb8Ob_daXo3fdEqDA5-GhQLGwlAOM11f3-E4QVCG9VZ8eK3s2rgGuQ-uhFm1bNSqI4-1TVvUlcxrcy0MEaN0hCJmg33sNpCQJUwazRmmu20DHPSF49TkyEp0rkey0YjBnye3Fcq-OmDuFQfNW1B_Zx2qHoOrsGIg9Qg6kVLQ"
    }


## Register
- base url : ```https://backend-dot-storyverse-app.et.r.appspot.com/api/register```
- Method : ```POST```
- Data Params :
  ```
  name, email, password
  ```
- Response :
```
{
    "error": false,
    "message": "User Created"
}
```

## View Dataset
- base url : ```https://backend-dot-storyverse-app.et.r.appspot.com/api/dataset```
- Method : ```GET```
- Response :
```
    {
        "id": 1,
        "Title": "4 ways to get high-paying writing work do not self-publish.",
        "Created_date": "2/11/2019",
        "Author": "Kayla Lee",
        "Url": "https://medium.com/writing-cooperative/4-ways-to-get-high-paying-writing-work-dont-self-publish-badfa6b07ae2",
        "Article": "Most creatives do not understand one, simple truth:\nTurning what you love into a business involves being good at business.\nI write full-time for a living, a luxury I enjoy because I am just as much a business person as a writer. While I learned The Elements of Style, I also learned Million Dollar Consulting (not affiliate links). My business acumen said do not listen to the \"pros\" selling overnight self-publishing success. Not that I do not want to self-publish and I am definitely not condemning it but, without a high number of followers (many thousands) or email subscribers (many thousands), self-publishing is not likely to earn a livable wage. You can build a following and email list, and then self-publish profitably. But the likelihood that you will make money from your first book (immense amount of effort) is extremely low. Even if you are a best-seller in some random category no one has ever heard of, people do not search for keywords they have never heard of. You could invest money into ads for your self-published work, but then, you would likely be far in the red before you start to make money. You would be lucky to break even. Or, you might write a dynamite book on your first try (highly unlikely) and sell the shit out of it without any marketing effort whatsoever (highly unlikely). I asked myself, would a smart business person gamble all that writing time and effort on something so unlikely to pay off?\nA better way to make money writing\nHere are a few mediums I have used to generate a significant income from my writing. I write or ghostwrite ebooks, blogs, articles, and emails for businesses. I write for IT/tech companies, but you can choose any niche that interests you. I have friends that make money writing for lifestyle companies, yoga studios, medical journals, finance firms, law firms, women's rights organs, etc. I built a six-figure writing company with zero professional writing experience, zero followers, and zero people on an email list using the tools I will share here. I have no affiliation with any of these tools.\n\nLinkedIn Profinder\nLinkedIn Profinder is one of my favorite tools for finding quality work. You can find decent-paying gigs with small/medium businesses here. It works by creating a profile and entering the type of work you are looking for (content writing, ghostwriting, etc.). Then, when companies create proposal requests for those types of work, you are notified and can apply for the gig. It is a passive medium, meaning, you wait for requests to come to you. The money I made from LinkedIn Profinder One-off writing/email project for $3k.\nContena\nContena is a job board that aggregates all the writing jobs posted on the web and puts them into one place. You can create alerts for yourself for specific job types like how well they pay, what niche, etc. The money I made from Contena Client 1: more than 0.25 USD per word for more than 6 months. Multiple articles per month. Total earnings are about $10k. Client 2: more than 0.25 USD per word for a few projects sporadically for a year. Total earnings are about $14k.\nSending your own pitch 2X per week\nThis is by far the best way to make money as a writer. Any time a company sends out an RFP or posts to a job board, thousands of writers see it and apply. If you send a pitch to a company, you are likely the only person pitching. There is much less competition. You need to pitch in bulk. Make it a goal to pitch at least 100 companies per week. Ask to write for their blog. Find companies in industries you are interested in writing about (i.e., fitness/lifestyle, tech startups, women's health, etc.). I wrote this article for salespeople, but writers can use it to learn to send pitches in bulk. The money I made from sending a pitch to 7 regular clients buying multiple articles/ebooks per month. Monthly income varies from $3-6k depending on the number of projects. 1 retainer client at $2k/mo.\nGet the cheapest WeWork (or other coworking space) membership\nIf you join WeWork for $45/month, you have access to their online platform. This platform is full of business connections and leads. I got more clients out of the platform than I got by working in the space. The money I made from WeWork app Retainer for email writing and marketing. Total yearly earnings are about $20k. I have had this client for more than 2 years.If you want to write for a living\nYou need to be open minded about the types of work you can do to earn a decent wage.\n\nA lot of writers feel bummed when they read about writers who are not as skilled making lots of money. But, if you are a highly skilled writer, you should be gleeful that other, less skilled writers make more than you. That only means you can earn much more.",
        "Category": "Kesehatan Mental",
        "CoverImage": "https://storage.googleapis.com/storyverse-app.appspot.com/kesehatan_mental.jpg"
    } etc. (there are 110 datasets in total)
```

## Upload Photo Stories
- base url : ```https://backend-dot-storyverse-app.et.r.appspot.com/api/upload/stories```
- Method : ```POST```
- Data Params :
  ```
  title, description
  ```
- Response :
```
{
    "error": false,
    "message": "File uploaded successfully",
    "uploadUrl": "https://storage.googleapis.com/storyverse-app.appspot.com/upload/e01995d5-afe6-4d43-be8e-025423bdf372.json"
}
```

## New Comment Stories
- base url : ```https://backend-dot-storyverse-app.et.r.appspot.com/api/comment```
- Method : ```POST```
- Data Params :
  ```
  comment
  ```
- Response :
```
{
    "success": true,
    "commentId": "7eba5621-7829-4655-b440-8c8bcebe3a99"
}
```

## Update Comment Stories
- base url : ```https://backend-dot-storyverse-app.et.r.appspot.com/api/comment/{commentId}```
- Method : ```PUT```
- Data Params :
  ```
  comment
  ```
- Response :
```
{
    "success": true,
    "message": "Comment updated successfully"
}
```

## Delete Comment Stories
- base url : ```https://backend-dot-storyverse-app.et.r.appspot.com/api/comment/{commentId}```
- Method : ```DELETE```
- Data Params :
  ```
  comment
  ```
- Response :
```
{
    "success": true,
    "message": "Comment deleted successfully"
}
```

## Recommend Titles by Category 
- base url : ```https://storyverse-app.et.r.appspot.com/recommend```
- Method : ```POST```
- Data Params :
  ```
  categories = ["Profesi", "Pengalaman Pribadi", "Kesehatan Mental", "Mistis", "Percintaan"] 
  ```
  **1-5 categories, case-sensitive**
- Response :
```
{
    {
    "recommended_titles": [
        "Mengapa Saya Meninggalkan Go-Jek, Unicorn Start up Indonesia",
        "Bagaimana Memulai Startup di Indonesia?",
        "Designer *katanya",
        "Berapa Gaji Yoel?",
        "How to Find Confidence in Your Career Path",
        "How to Become an Employee Benefits Professional",
        "The Secrets of a Successful Internship",
        "Menjadi Penulis Mobile"
    ]
}
}
```


