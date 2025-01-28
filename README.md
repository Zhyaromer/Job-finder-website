# Job Portal Application

Jobify is a web app that has been made in Kurdish,i want people to find jobs easier and with little to no time as im also one of the people whos struggling to find a job. It provides an intuitive platform for job seekers and employers to connect. Users can easily manage their profiles, post jobs, search for opportunities, and personalize their experience with advanced filtering options.

< this project is not done yet maybe 10% left as many many of the things are done but for now i will drop it>

## Features

### 🔐 Authentication  
- **Google Sign-In**: Quick and easy login using Firebase Google Authentication.  
- **Email/Password Login**: Traditional login for users without Google accounts.  
- **Email Verification**: Users must verify their email after signing up to activate their account.  
- **Forgot Password**: Allows users to reset their password via email if they forget it.
- **Persistent Login (13 Days)**: Firebase authentication stores a secure cookie, keeping users logged in for **13 days** without needing to re-authenticate.  

### Role-Based Functionality
- **Job Seekers**:  
  - Browse job listings with search filters.  
  - Save jobs to view later.  
  - Update account settings.  
- **Job Providers**:  
  - Post job opportunities.  
  - see and delete their job listings.  
  - View and manage all posted jobs.  

### Job Search & Management
- **Search Filters**: Find jobs by city, gender, or other specific criteria.  
- **Save Jobs**: Bookmark jobs for quick access later.  
- **Manage Listings**: Employers can see and remove their job postings.  
- **Report Suspicious Jobs**: Users can report a job if they suspect it is a scam or inappropriate and leave a message explaining why.  
- **Highlighted VIP Jobs**: VIP jobs appear at the top of the page, increasing visibility.  

## 🛠 Technology Stack  

- **Frontend**: React with Bootstrap and CSS for a responsive and clean user interface.  
- **Backend**: Express.js for handling server-side logic.  
- **Database**: MongoDB for efficient data storage and retrieval.  
- **Authentication**: Firebase for secure user authentication, including Google Sign-In, email verification, password recovery, and persistent login via cookies.  
