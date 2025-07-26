//CODE FOR CONNECTING TO DATABASE

const mongoose=require('mongoose');

//TASK HANDLING ASYNCHRONOUS
/*takes big tasks to the background, so other tasks can be handled*/
mongoose.Promise = global.Promise;

/*C:\Program Files\MongoDB\Server\8.0\bin - local - in folder cmd mongosh -->:*/
mongoose.connect('mongodb://127.0.0.1:27017/taskmanagerdb')
.then(()=>{
    console.log('DB connected successfully')
})
.catch((error)=>{
    console.log(error)
});

module.exports = mongoose; 