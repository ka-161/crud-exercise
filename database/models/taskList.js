const mongoose = require('mongoose');

//SCHEMA _ TABELSTRUCTURE
/**mongoose schema */
const TaskListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
    }
});

const TaskList = mongoose.model('TaskList',TaskListSchema);

module.exports = TaskList;