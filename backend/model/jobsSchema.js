const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/jobFinder").then(() => {
    console.log('database is connected')
}).catch((error) => {
    console.log(error.message)
});

const jobsSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    }, description: {
        type: String,
        require: true
    }, company: {
        type: String,
        require: true
    }, location: {
        type: String,
        require: true
    }, postedAt: {
        type: Date,
        default: Date.now()
    }, skils: {
        type: [String],
        require: true
    }, companyEmail: {
        type: String,
        require: false
    }, companyNumber: {
        type: Number,
        require: true
    }, industry: {
        type: String,
        require: true
    }, jobType: {
        type: String,
    }, yearsOfExp: {
        type: String,
        require: true
    }, salary: {
        type: String,
        require: true
    }, language: {
        type: [String],
        require: true
    }, gender: {
        type: String,
        require: true
    }, degree: {
        type: String,
        require: true
    }, degreeField: {
        type: String,
    }, howManyHours: {
        type: Number,
        require: true
    }, currency: {
        type: String,
        require: true
    }, views: {
        type: Number,
        default: 0
    }, likes: {
        type: Number,
        default: 0
    }, dislikes: {
        type: Number,
        default: 0
    }, postedby :{
        type: String,
        require: true
    }
})

const jobs = mongoose.model('jobs', jobsSchema)

module.exports = jobs