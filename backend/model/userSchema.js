const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/jobFinder").then(() => {
    console.log('userInfo database is connected')
}).catch((error) => {
    console.log(error.message)
});

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    }, email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }, displayName: {
        type: String,
        required: true
    }, savedJobs: {
        type: [String]
    }, location: {
        type: String,
        required: true
    }, gender: {
        type: String,
        required: true
    }, role: {
        type: String,
        required: true
    }, degree: {
        type: String,
    }, industry: {
        type: String,
    }, likes: {
        type: [String]
    }, dislikes: {
        type: [String]
    }
}, { timestamps: true });

const User = mongoose.model('UserInfo', userSchema);

module.exports = User;
