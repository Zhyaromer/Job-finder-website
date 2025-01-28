const express = require('express')
const app = express()
const jobs = require('./model/jobsSchema')
const cors = require("cors");
const cookieParser = require('cookie-parser')
const session = require('express-session')
const { body, validationResult } = require('express-validator');
const xss = require('xss')
const reports = require('./model/reportsSchema')
const User = require('./model/userSchema');
const { auth } = require('./model/FireBase/FirebaseService')
require('dotenv').config()
const port = 3500

app.use(cors({
   origin: 'http://localhost:3000',
   credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({
   secret: 'secret',
   resave: false,
   saveUninitialized: false,
   cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
   }
}))
app.use(cookieParser());

// Route to get all jobs with filtering options
app.get('/', async (req, res) => {
   // Extract filter parameters from query
   const { title, location, minSalary, maxSalary, industry, yearsOfExp, language, gender } = req.query;
   console.log(req.query);

   try {
      // Build the filter object for MongoDB query
      let filter = {};

      // Filter by title (case-insensitive search)
      if (title) {
         filter.title = { $regex: title, $options: 'i' }; // Case-insensitive search for title
      }

      // Filter by location (allow multiple values for location)
      if (location) {
         const locations = location.split(','); // Split the comma-separated cities
         filter.location = { $in: locations }; // MongoDB's $in operator to match any of the selected locations
      }

      // Filter by salary range
      if (minSalary || maxSalary) {
         filter.salary = {}; // Initialize salary filter
         if (minSalary) {
            filter.salary.$gte = minSalary; // Filter for salary greater than or equal to minSalary
         }
         if (maxSalary) {
            filter.salary.$lte = maxSalary; // Filter for salary less than or equal to maxSalary
         }
      }

      // Filter by industry (allow multiple industries)
      if (industry) {
         const industries = industry.split(','); // Split the comma-separated industries
         filter.industry = { $in: industries }; // MongoDB's $in operator to match any of the selected industries
      }

      // Filter by years of experience
      if (yearsOfExp) {
         const yearsArray = yearsOfExp.split(','); // Split the comma-separated yearsOfExp
         filter.yearsOfExp = { $in: yearsArray }; // MongoDB's $in operator to match any of the selected years of experience
      }

      // Filter by language (allow multiple languages)
      if (language) {
         const languages = language.split(','); // Split the comma-separated languages
         filter.language = { $in: languages }; // MongoDB's $in operator to match any of the selected languages
      }

      // Filter by gender
      if (gender) {
         const genderArray = gender.split(','); // Split the comma-separated gender
         filter.gender = { $in: genderArray }; // MongoDB's $in operator to match any of the selected genders
      }

      // Query MongoDB with the built filter
      console.log(filter);
      const allJobs = await jobs.find(filter);
      res.status(200).json(allJobs);
   } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching jobs');
   }
});

const authenticateUser = async (req, res, next) => {
   const idToken = req.cookies.idToken;
   if (!idToken) {
      console.log("inside !idtoken")
      return res.status(401).json({ error: "Unauthorized: Token required" });
   }
   try {
      const decodedToken = await auth.verifySessionCookie(idToken);
      if (!decodedToken) {
         console.log("inside !decodedToken")
         return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }
      console.log(decodedToken);
      req.user = decodedToken;
      next();
   } catch (error) {
      console.error("Error verifying Firebase ID token:", error);
      res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
   }
};

// Route to add a job
app.post('/addjob', authenticateUser, async (req, res) => {
   const { title, description, company, location, skils, companyEmail, companyNumber, industry, howManyHours, yearsOfExp, salary, language, gender, currency, degree, degreeField, jobType } = req.body;
   try {
      const newJobs = new jobs({
         title, description, company, location, skils, salary, companyEmail, companyNumber, industry, howManyHours, yearsOfExp, language, gender, currency, degree, degreeField, jobType, postedby: req.user.name
      });
      await newJobs.save();
      console.log('Job added successfully');
      return res.status(200).json({ message: 'Job added successfully' });
   } catch (error) {
      console.log(error);
      res.sendStatus(500);
   }
});

// Route to get job details by ID
app.get('/job', async (req, res) => {
   console.log(req.cookies.username);
   const jobid = req.query.jobid;
   if (!jobid) {
      return res.sendStatus(404);
   }

   try {
      const foundJob = await jobs.findById(jobid);
      if (!foundJob) {
         return res.sendStatus(404);
      }
      await jobs.findByIdAndUpdate(
         jobid,
         { $inc: { views: 1 } },
         { new: true }
      );
      return res.status(200).json(foundJob);
   } catch (error) {
      console.error(error);
      res.sendStatus(500);
   }
});

app.post('/signup', async (req, res) => {
   const { displayName, email, password, location, gender, role, degree, industry } = req.body;
   const SandisplayName = xss(displayName);
   const Sanemail = xss(email);
   const Sanpassword = xss(password);
   try {
      try {
         await auth.getUserByEmail(Sanemail);
         return res.status(409).json({ message: 'Email already exists. Please use a different email.' });
      } catch (error) {
         if (error.code !== 'auth/user-not-found') throw error;
      }

      console.log('here4');
      const fibUser = await auth.createUser({
         email: Sanemail,
         emailVerified: false,
         password: Sanpassword,
         displayName: SandisplayName,
      })

      await User.create({
         email: Sanemail,
         uid: fibUser.uid,
         displayName: SandisplayName,
         location,
         gender,
         role,
         degree,
         industry
      })
      const SendEmailVerification = await auth.generateEmailVerificationLink(Sanemail);
      console.log(SendEmailVerification);
      return res.status(201).json({ message: 'Signup successful. Please check your email for verification.' });
   } catch (error) {
      if (error.message.includes('Missing password requirements')) {
         return res.status(400).json({ message: 'Password length must be at least 6 characters, and must contain one upper case character, a number, and a special character' });
      }
      console.error(error);
      res.status(500).json({ message: 'An error occurred. Please try again later' });
   }
})

app.post('/emailverify', async (req, res) => {
   const { email } = req.body;
   if (!email) {
      return res.sendStatus(400);
   }
   try {
      const user = await auth.getUserByEmail(email);
      console.log(user.uid);
      console.log(`user verified is ${user.emailVerified}`);

      if (user.emailVerified) {
         console.log(`user verified is ${user.emailVerified}`);
         return res.sendStatus(201);
      }
      console.log(`401`)
      return res.sendStatus(401);
   } catch (error) {
      console.error(error);
      res.sendStatus(500);
   }
})

app.post('/resendemailverify', async (req, res) => {
   const { email } = req.body;
   if (!email) {
      return res.sendStatus(400);
   }
   try {
      const SendEmailVerification = await auth.generateEmailVerificationLink(email);
      console.log(SendEmailVerification);
      return res.sendStatus(200);
   } catch (error) {
      res.sendStatus(500);
   }
})

app.post('/login', async (req, res) => {
   const { email, password } = req.body;
   console.log(password);
   console.log(email);

   if (!email || !password) {
      console.log('Email and password are required.');
      return res.status(400).json({ message: 'Email and password are required.' });
   } try {
      const idToken = req.headers.authorization?.split("Bearer ")[1];
      if (!idToken) {
         console.log('Token required');
         res.status(401).send("Token required");
      }

      const authorization = await auth.verifyIdToken(idToken);
      if (!authorization) {
         console.log('Unauthorized');
         return res.send(401).json({ message: 'Unauthorized' });
      }
      const expiresIn = 60 * 60 * 24 * 13 * 1000;
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

      res.cookie('idToken', sessionCookie, { httpOnly: false, maxAge: expiresIn, sameSite: 'strict' });
      console.log('Login successful.');
      return res.status(200).json({ message: 'Login successful.' });
   }
   catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred. Please try again later.' });
   }
})

app.post('/resetpassword', async (req, res) => {
   const { email } = req.body;
   if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
   }
   try {
      const user = await auth.getUserByEmail(email);
      if (!user) {
         return res.status(404).json({ message: 'User not found.' });
      }
      const passwordResetLink = await auth.generatePasswordResetLink(email);
      console.log(passwordResetLink);
      return res.status(200).json({ message: 'Password reset link sent successfully.' });
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred. Please try again later.' });
   }
})

app.post('/savedjobs', authenticateUser, async (req, res) => {
   const { jobId } = req.body;
   if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required.' });
   }
   const user = await User.findOne({ uid: req.user.uid });
   if (!user) {
      return res.status(404).json({ message: 'User not found.' });
   }
   if (user.savedJobs.includes(jobId)) {
      console.log('here');
      return res.status(409).json({ message: 'Job already saved.' });
   }
   User.findOneAndUpdate({ uid: req.user.uid }, { $addToSet: { savedJobs: jobId } }, { new: true })
      .then((updatedUser) => {
         if (updatedUser) {
            return res.status(200).json({ message: 'Job saved successfully.' });
         } else {
            return res.status(404).json({ message: 'User not found.' });
         }
      })
      .catch((error) => {
         console.error('Error updating user:', error);
         return res.status(500).json({ message: 'An error occurred. Please try again later.' });
      });
})

app.post('/unsavejob', authenticateUser, async (req, res) => {
   const { jobId } = req.body;
   if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required.' });
   }
   const user = await User.findOne({ uid: req.user.uid });
   if (!user) {
      return res.status(404).json({ message: 'User not found.' });
   }
   if (!user.savedJobs.includes(jobId)) {
      return res.status(404).json({ message: 'Job not saved.' });
   }
   User.findOneAndUpdate({ uid: req.user.uid }, { $pull: { savedJobs: jobId } }, { new: true })
      .then((updatedUser) => {
         if (updatedUser) {
            return res.status(200).json({ message: 'Job unsaved successfully.' });
         } else {
            return res.status(404).json({ message: 'User not found.' });
         }
      })
})

app.get('/favoritejobs', authenticateUser, async (req, res) => {
   try {
      console.log(`req.user.uid ${req.user.uid}`);
      const savedJobs = await User.findOne({ uid: req.user.uid }, { savedJobs: 1 });
      console.log(`savedJobs ${savedJobs}`);
      if (!savedJobs) {
         return res.status(404).json({ message: 'User not found.' });
      }
      const foundJobs = await jobs.find({ _id: { $in: savedJobs.savedJobs } });
      console.log(`foundJobs ${foundJobs}`);
      return res.status(200).json({ foundJobs });
   } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred. Please try again later.' });
   }
})

app.get('/checkroles', authenticateUser, async (req, res) => {
   try {
      const user = await User.findOne({ uid: req.user.uid });
      console.log(`user ${user.role}`);
      if (!user) {
         return res.status(404).json({ message: 'User not found.' });
      }
      return res.status(200).json({ roles: user.role });
   } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred. Please try again later.' });
   }
})

app.post('/googleauth', async (req, res) => {
   const { email } = req.body;

   const idToken = req.headers.authorization?.split("Bearer ")[1];
   req.session.idToken = idToken;
   try {
      const user = await User.findOne({ email });

      if (user === null) {
         console.log('201');
         return res.sendStatus(201);
      } else {
         const idToken = req.session.idToken;
         const authorization = await auth.verifyIdToken(idToken);
         if (!authorization) {
            console.log('Unauthorized');
            return res.send(401).json({ message: 'Unauthorized' });
         }
         const expiresIn = 60 * 60 * 24 * 13 * 1000;
         const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
         res.cookie('idToken', sessionCookie, { httpOnly: false, maxAge: expiresIn, sameSite: 'strict' });
         console.log('200');
         return res.sendStatus(200);
      }
   } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred. Please try again later.' });
   }
});

app.post('/googleauthSingup', async (req, res) => {
   const { email, displayName, location, gender, role, degree, industry } = req.body;
   try {
      const user = await auth.getUserByEmail(email);
      await User.create({
         uid: user.uid,
         email,
         displayName,
         location,
         gender,
         role,
         degree,
         industry
      })
      const idToken = req.session.idToken;
      const authorization = await auth.verifyIdToken(idToken);
      if (!authorization) {
         console.log('Unauthorized');
         return res.send(401).json({ message: 'Unauthorized' });
      }
      req.session.destroy();
      const expiresIn = 60 * 60 * 24 * 13 * 1000;
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      res.cookie('idToken', sessionCookie, { httpOnly: false, maxAge: expiresIn, sameSite: 'strict' });
      return res.status(201).json({ message: 'Signup successful' });
   } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred. Please try again later.' });
   }
})

app.post('/checkAuth', async (req, res) => {
   const { uid } = req.body
   console.log(`uid ${uid}`);
   try {
      const user = await User.findOne({ uid });
      console.log(`user isprofilecomplete ${user}`);
      if (!user) {
         console.log('404');
         return res.sendStatus(404);
      } else {
         console.log('200');
         return res.sendStatus(200);
      }
   } catch (error) {
      console.error(error.message);
      return res.sendStatus(500);
   }
})

app.post('/like', authenticateUser, async (req, res) => {
   const { jobId } = req.body;
   console.log(`jobId ${jobId}`);
   try {
      const user = await User.findOne({ uid: req.user.uid });
      if (!user) {
         return res.status(404).send('User not found');
      }
      const theJob = await jobs.findById(jobId);
      if (!theJob) {
         return res.status(404).send('Job not found');
      }
      console.log(`theJob ${theJob.likes}`);
      if (!user.likes.includes(jobId)) {
         const job = await jobs.findByIdAndUpdate(
            jobId,
            { $inc: { likes: 1 } },
            { new: true }
         );
         await User.findOneAndUpdate(
            { uid: req.user.uid },
            { $addToSet: { likes: jobId } }
         );
         console.log(`like ${job.likes}`);
         return res.status(200).send({ like: job.likes });
      }
      console.log('Job already liked');
      return res.status(400).send('Job already liked');
   } catch (error) {
      console.error(error);
      return res.status(500).send('Error liking job');
   }
})

app.post('/unlike', authenticateUser, async (req, res) => {
   const { jobId } = req.body;
   console.log('/unlike route')
   console.log(`jobId ${jobId}`);
   try {
      const user = await User.findOne({ uid: req.user.uid });
      if (!user) {
         console.error(`User not found for UID: ${req.user.uid}`);
         return res.status(404).send('User not found');
      }
      const theJob = await jobs.findById(jobId);
      if (!theJob) {
         console.error(`Job not found with ID: ${jobId}`);
         return res.status(404).send('Job not found');
      }
      console.log(`theJob ${theJob.likes}`);
      if (user.likes.includes(jobId)) {
         const updatedJob = await jobs.findByIdAndUpdate(
            jobId,
            { $inc: { likes: -1 } },
            { new: true }
         );
         await User.findOneAndUpdate(
            { uid: req.user.uid },
            { $pull: { likes: jobId } }
         );
         console.log(`like : ${updatedJob.likes}`);
         return res.status(200).send({ like: updatedJob.likes });
      } else {
         console.log(`User has not liked job with ID: ${jobId}`);
         return res.status(400).send('Job not liked');
      }
   } catch (error) {
      console.error(`Error unliking job: ${error.message}`);
      return res.status(500).send('Error unliking job');
   }
});

app.post('/dislike', authenticateUser, async (req, res) => {
   const { jobId } = req.body;
   console.log(`jobId ${jobId}`);
   try {
      const user = await User.findOne({ uid: req.user.uid });
      if (!user) {
         return res.status(404).send('User not found');
      }
      const theJob = await jobs.findById(jobId);
      if (!theJob) {
         return res.status(404).send('Job not found');
      }
      if (!user.dislikes.includes(jobId)) {
         const job = await jobs.findByIdAndUpdate(
            jobId,
            { $inc: { dislikes: 1 } },
            { new: true }
         );
         await User.findOneAndUpdate(
            { uid: req.user.uid },
            { $addToSet: { dislikes: jobId } }
         );
         return res.status(200).send({ dislike: job.dislikes });
      }
      return res.status(400).send('Job already liked');
   } catch (error) {
      console.error(error);
      return res.status(500).send('Error liking job');
   }
})

app.post('/undislike', authenticateUser, async (req, res) => {
   const { jobId } = req.body;
   console.log(`Unliking job with ID: ${jobId}`);

   try {
      const user = await User.findOne({ uid: req.user.uid });
      if (!user) {
         console.error(`User not found for UID: ${req.user.uid}`);
         return res.status(404).send('User not found');
      }

      const theJob = await jobs.findById(jobId);
      if (!theJob) {
         console.error(`Job not found with ID: ${jobId}`);
         return res.status(404).send('Job not found');
      }

      if (user.dislikes.includes(jobId)) {
         const updatedJob = await jobs.findByIdAndUpdate(
            jobId,
            { $inc: { dislikes: -1 } },
            { new: true }
         );
         await User.findOneAndUpdate(
            { uid: req.user.uid },
            { $pull: { dislikes: jobId } }
         );
         console.log(`Successfully unliked job with ID: ${jobId}`);
         return res.status(200).send({ dislike: updatedJob.dislikes });
      } else {
         console.log(`User has not liked job with ID: ${jobId}`);
         return res.status(400).send('Job not liked');
      }
   } catch (error) {
      console.error(`Error unliking job: ${error.message}`);
      return res.status(500).send('Error unliking job');
   }
});

app.post('/likedjobs', authenticateUser, async (req, res) => {
   try {
      console.log(`/likedjobs`)
      const user = await User.findOne({ uid: req.user.uid });
      if (!user) {
         return res.status(404).json({ message: 'User not found.' });
      }

      console.log(`likedJobsid ${user.likes}`);
      return res.status(200).send({ likedjobs: user.likes });
   } catch (error) {
      console.error(error);
      return res.status(500).send('Error fetching liked jobs');
   }
});

app.post('/dislikedjobs', authenticateUser, async (req, res) => {
   console.log(req.user.uid);
   console.log(`req.user.uid`);
   try {
      console.log(`/dislikedjobs`)
      const user = await User.findOne({ uid: req.user.uid });
      if (!user) {
         return res.status(404).json({ message: 'User not found.' });
      }

      console.log(`likedJobsid ${user.dislikes}`);
      return res.status(200).send({ dislikedjobs: user.dislikes });
   } catch (error) {
      console.error(error);
      return res.status(500).send('Error fetching liked jobs');
   }
});

app.post('/reportajob', async (req, res) => {
   const { jobId, name, reason, feedback } = req.body;
   if (!jobId || !name || !reason || !feedback) {
      return res.status(400).json({ message: 'All fields are required.' });
   }
   try {
      const newReport = new reports({
         jobId, name, reason, feedback
      });
      await newReport.save();
      return res.sendStatus(201);
   } catch (error) {
      console.error(error);
      res.sendStatus(500);
   }
});

app.post('/changename', authenticateUser, async (req, res) => {
   const { displayName } = req.body;
   console.log(req.body);
   console.log(`displayName ${displayName}`);
   const xssDisplayName = xss(displayName);
   if (!xssDisplayName) {
      return res.status(400).json({ message: 'Name is required.' });
   }
   try {
      const user = await User.findOne({ uid: req.user.uid });
      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }
      const fUser = await auth.updateUser(req.user.uid, { displayName: xssDisplayName });
      if (!fUser) {
         return res.status(404).json({ message: 'User not found.' });
      }
      await User.findOneAndUpdate({ uid: req.user.uid }, { displayName: xssDisplayName });
      return res.sendStatus(200);
   } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred. Please try again later.' });
   }
})

app.post('/changepassword', authenticateUser, async (req, res) => {
   console.log(req.body);
   const { oldPassword, newPassword, confirmPassword } = req.body;
   const xssOldPassword = xss(oldPassword);
   const xssNewPassword = xss(newPassword);
   const xssConfirmPassword = xss(confirmPassword);
   if (!xssOldPassword || !xssNewPassword || !xssConfirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
   }
   try {
      const user = await auth.getUserByEmail(req.user.email)
      console.log('user')
      console.log(user)
      if (!user) {
         console.log('User not found');
         return res.status(404).json({ message: 'User not found' });
      }
      if (user.password !== xssOldPassword) {
         console.log('Incorrect old password');
         return res.status(400).json({ message: 'Incorrect old password' });
      }
      if (xssNewPassword !== xssConfirmPassword) {
         console.log('New password and confirm password do not match');
         return res.status(400).json({ message: 'New password and confirm password do not match' });
      }
      console.log('Password changed successfully');
      return res.sendStatus(200);
   } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred. Please try again later.' });
   }
})

app.post('/deleteaccounts', authenticateUser, async (req, res) => {
   try {
      const fUser = await auth.getUserByEmail(req.user.email)
      const user = await User.findOne({ uid: req.user.uid });
      if (!user) {
         console.log('User not found');
         return res.status(404).json({ message: 'User not found.' });
      }
      if (!fUser) {
         console.log('fUser not found');
         return res.status(404).json({ message: 'User not found.' });
      }
      await auth.deleteUser(req.user.uid);
      await User.findOneAndDelete({ uid: req.user.uid });
      res.clearCookie('idToken');
      return res.sendStatus(200)
   } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred. Please try again later.' });
   }
})

app.post('/changerole', authenticateUser, async (req, res) => {
   const { role } = req.body;
   console.log(`role ${role}`);
   console.log(req.body.role);
   if (!role) {
      return res.status(400).json({ message: 'Role is required.' });
   }
   try {
      if (role === 'employeeSeeker') {
         await User.findOneAndUpdate({ uid: req.user.uid }, { role: 'employeeSeeker' });
         return res.sendStatus(200);
      } else if (role === 'jobSeeker') {
         await User.findOneAndUpdate({ uid: req.user.uid }, { role: 'jobSeeker' });
         return res.sendStatus(200);
      } 
      return res.status(400).json({ message: 'Invalid role.' });
   } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred. Please try again later.' });
   }
})
// Catch-all route
app.get('*', (req, res) => {
   res.sendStatus(404);
});

app.listen(port, () => console.log('> Server is up and running on port : ' + port));
