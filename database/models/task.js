const mongoose = require('mongoose');

//SCHEMA _ TABELSTRUCTURE
/**mongoose schema */
const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        minlength: 3,
    },
    taskListId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    completed:{
        type: Boolean,
        default: false,
        required: true
    }
});

const Task = mongoose.model('Task',TaskSchema);

module.exports = Task;