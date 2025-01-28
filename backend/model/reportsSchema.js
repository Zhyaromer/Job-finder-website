const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/jobFinder").then(() => {
    console.log('report database is connected')
}).catch((error) => {
    console.log(error.message)
});

const reportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, jobId: {
        type: String,
        required: true
    }, reason: {
        type: String,
        required: true
    }, feedback: {
        type: String,
    }
}, { timestamps: true });

const reports = mongoose.model('reportInfo', reportSchema);

module.exports = reports;
