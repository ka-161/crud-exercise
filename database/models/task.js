const mongoose = require('mongoose');

//SCHEMA _ TABELSTRUCTURE
/**mongoose schema */
const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        trin: true,
        minlength: 3,
    },
    _taskListId: {
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