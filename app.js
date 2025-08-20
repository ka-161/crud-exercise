const express = require('express');
const app=express();
const cors = require('cors');

//IMPORT DB
const mongoose=require('./database/mongoose');

//IMPORT MODELS
const TaskList=require("./database/models/taskList");
const Task=require("./database/models/task");

//CORS - CROSS ORIGIN REQUEST SECURITY (MIDDLEWARE)
/**backend cvan request, but frontend (e.g. port 4200) will be blocked --> allow 
 * frontend request etc by othermiddleware: 
 * actual call: app.use(cors()); but internally does this */
/**app.use((request,response,next)=>{

    //WEBSITE ALLOWED TO CONNECT
    /**here use port of frontend, for any '*'   
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    //REQUEST METHODS ALLOWED
    response.setHeader('Access-Control-Allow-Methods', 'GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE');

    //REQUEST HEADERS ALLOWED
    response.setHeader('Access-Control-Allow-Headers', 'Origin', 'X-Requested-With, Content-Type', 'Access');

    //PASS TO NEXT LAYER OF MIDDLEWARE
    next();
});

SOMEHOW ADAPTED ABOVE ONE OUTSIDE COURSE TO THE FOLOWING
*/

/***funciona para solicitudes simples (GET, POST), pero falla con PATCH, PUT, DELETE, porque no maneja las solicitudes OPTIONS (preflight) correctamente. */
app.use(function(req,res,next) {

    //WEBSITE ALLOWED TO CONNECT
    /**here use port of frontend, for any '*'   */
    res.setHeader('Access-Control-Allow-Origin', '*');

    //REQUEST METHODS ALLOWED
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, OPTIONS');

    //REQUEST HEADERS ALLOWED
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    if(req.method === 'OPTIONS'){
        return res.sendStatus(200);
    }

    //PASS TO NEXT LAYER OF MIDDLEWARE
    next();
});

//TRANSLATES REQUEST & RESPONSE FROM/TO BROWSER - JSON - EXAMPLE MIDDLEWARE
/**understand anything in this format, 3rd party body parser not neccessary, because express inside library */
app.use(express.json());

//REST API END POINTS OR RESTFUL WEBSITES - ROUTES
 /**Routes for TaskList
  * Create, Update, ReadTaskListByID, ReadAllTaskList
  * Task
  * Create, Update, ReadTaskById, ReadAllTask,
  * eg. www.restapitutorial.com/lessons/httpmethods.html
  */

          //  TASKLISTS
 //ROUTE - GET ALL TASKLISTS
 app.get('/tasklists', (req, res)=>{
    TaskList.find({})
    .then((lists) => {
        console.log('Returned documents: \n', JSON.stringify(lists,null, 2));
        res.status(200).send(lists);
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).send({error: 'failed to fetch task lists'});
    });
 });

 //ROUTE ... CREATE TASKLIST POST
app.post('/tasklists', (req, res)=>{
    //console.log("hello i am inside post method");
  
    console.log(req.body);

    let taskListObj = {'title': req.body.title};
    TaskList(taskListObj).save()
    .then((lists)=>{
        res.status(201).send(lists);
    })
    .catch((error)=>{
        console.log(error);
      res.status(500).send({error: 'failed to fetch task lists'});
    });
 });

 //ROUTE - GET ONE TASKLIST BY ID, like: http://localhost:3000/tasklists/68850500a49217f13e6d62a2
 app.get(
    '/tasklists/:taskListId',(req,res) => {

        let taskListId = req.params.taskListId;
        
        TaskList.find({_id: taskListId})//corresponding objects
        .then((taskList)=>{
            res.status(200).send(taskList)
        })
        .catch((error)=>{
            console.log(error);
            res.status(500);
        });
    }
 );

 //ROUTE - UPDATE TASKLIST - PUT - FULL UPDATE
 /**if we only hand over one field in the body, and there are more, the reply will be none/null(?) 
  * adapted code -  enforce that all required fields are provided
 */
 app.put('/tasklists/:taskListId', (req,res) => {
    const {title} = req.body;

    //check all required fields provided --> 1. Application-level check vs. Database level check in taskList.js
    if(typeof title !== 'string' || title.trim().length < 3) {
        return res.status(400).send({
            error: 'Full update requires valid title, length min 3'
        });        
    }

    TaskList.findOneAndUpdate(/**by default not returns update but old version */
           { _id: req.params.taskListId },
           { title: title.trim() },//trim() is a built-in method on JavaScript strings. It removes leading and trailing whitespace 
           { new: true, runValidators: true }
        )//could also be findById
        /**ID from the URL - to look up a task list by its MongoDB _id
           re.params - is an object that contains all the :named parts of the route
            *  You’re assigning the field _id the value of taskListId from the URL.
            * And using that object as a query filter to tell MongoDB which document to update.
            * 
            * tells Mongoose to apply schema validations when using findOneAndUpdate() (or similar methods). 
            * By default, Mongoose does not apply validators when you update a document using findOneAndUpdate() 
            * or findByIdAndUpdate() unless you explicitly set this flag.*/

        
        .then((taskList)=>{
        if(!taskList) {
            return res.status(404).send({error: 'taskList not found'});
        }    
        res.status(200).send(taskList);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send({ error: 'Server error.'});
        });
    });
 

 //ROUTE - UPDATE TASKLIST - PATCH - PARTIAL UPDATE
  app.patch('/tasklists/:taskListId', (req,res) => 
    {
    Task.findOneAndUpdate(
        { taskListId: req.params.tasklistId, _id: req.params.taskId})
        .then((task) => 
            {
            res.status(200).send(task)
            })
        .catch((error) => { console.log(error)});
    });

//ROUTE - DELETE TASKLIST BY ID
app.delete('/tasklists/:tasklistId', (req,res) => 
    {
            
    //delete cascading tasks
    const deleteAllContainingTasks = (taskList) => {
    Task.deleteMany({taskListId: req.params.tasklistId})
    .then(()=>{return taskList})
    .catch((error)=>{
        console.log(error) });
    };

    const responseTaskList = TaskList.findByIdAndDelete(req.params.tasklistId)
    .then((taskList)=>{
        deleteAllContainingTasks(taskList);
    })
        .catch((error)=>{
            console.log(error)
        });
               res.status(200).send(responseTaskList);
   
    }); 


                //TASK - SHOULD ALWAYS BELONG TO TASKLIST
/**http://localhost:3000/tasklists/:tasklistid/tasks/:task */

//ROUTE - GET ALL TASKS FOR ONE TASKLIST
app.get('/tasklists/:tasklistid/tasks', (req,res)=>{
    Task.find({taskListId: req.params.tasklistid})
    .then((tasks)=>{
            res.status(200).send(tasks)
        })
        .catch((error)=>{
            console.log(error);
            res.status(500);
        
} );
});


//ROUTE - GET ONE TASK BY TASKID
/** con leave out tasks - readabiöity, scalability sth sth*/
app.get('/tasklists/:tasklistId/tasks/:taskId', (req, res) => {
   const { tasklistId, taskId} = req.params;

/**chercks if tasklistid is valid */
   if(!mongoose.Types.ObjectId.isValid(tasklistId)) {
    return res.status(400).send({error: 'Invalid task list ID'});
   }

/**checks if task id is valid */
   if(!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).send({error: 'Invalid task Id'});
   }

   
Task.findOne({_id: taskId, taskListId:tasklistId})
    .then((task)=>{

        if(!task)
        {
            res.status(404).send({error: 'task not found'});
        }
        res.status(200).send(task);
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).send({error:'soemthing went wrong here'})
    });
});


//ROUTE - GET ONE TASK BY TITLE
/**works like this: http://localhost:3000/tasklists/6885027f6248241c667e878f/tasks/vegetqables */
app.get('/tasklists/:tasklistId/tasks/:title', (req, res) => {
    Task.findOne({title: req.params.title})
    .then((task)=>{
        res.status(200).send(task)
    })
    .catch((error)=>{
        console.log(error);
        res.status(500);
    });
});

//ROUTE - POST TASK INSIDE ONE TASKLIST
app.post('/tasklists/:tasklistId/tasks', (req,res) =>{
    console.log(req.body);

    let taskObj = { 'title': req.body.title, 'taskListId' : req.params.tasklistId};
    Task(taskObj).save()
    .then((taskList)=> {
        res.status(201).send(taskList);
    })
    .catch((error) => {
        console.log(error);
        res.status(500);
    })
})

//ROUTE - PUT TASK
 app.put('/tasklists/:taskListId/tasks/:taskId', (req,res) => {
    const {title} = req.body;

    //check all required fields provided --> 1. Application-level check vs. Database level check in taskList.js
    if(typeof title !== 'string' || title.trim().length < 3) {
        return res.status(400).send({
            error: 'Full update requires valid title, length min 3'
        });        
    }

    Task.findOneAndUpdate(/**by default not returns update but old version */
           { _id: req.params.taskId },
           { title: title.trim() }, 
           { new: true, runValidators: true }
        )
        
        .then((task)=>{
        if(!task) {
            return res.status(404).send({error: 'task not found'});
        }    
        res.status(200).send(task);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send({ error: 'Server error.'});
        });
    });



//ROUTE - PATCH TASK
  app.patch('/tasklists/:taskListId/tasks/:taskId', (req,res) => {
    const taskId = req.params.taskId;
            
    Task.findByIdAndUpdate(
        taskId, 
        {$set: req.body},
        {new: true, runValidators: true}
    )
    .then((updatedTask)=>{
        if(!updatedTask)
        {
            return res.status(404).send({ message : 'Task not found'});
        }
            res.status(200).send(updatedTask);
        })
        .catch((error)=>{
            console.log(error);
            res.status(500).send({ error : 'An error occured while updating the Task'});
        });
    }); 

//ROUTE - DELETE TASK
app.delete('/tasklists/:taskListId/tasks/:taskId', (req,res) => {
    const taskId = req.params.taskId;
            
    Task.findByIdAndDelete(
        taskId, 
        {new: true}//added because findby... returns notupdated, unless set to true
    )
    .then((updatedTask)=>{
        if(!updatedTask)
        {
            return res.status(404).send({ message : 'Task not found'});
        }
            res.status(201).send(updatedTask);
        })
        .catch((error)=>{
            console.log(error);
            res.status(500).send({ error : 'An error occured while updating the Task'});
        });
    }); 





//SERVER CALL
/*after server is listening, 
function() will be called --> in order of writing in this bracket here? or is the first a condition
app.listen(3000, function(){
    console.log("Server started in port 3000");
});
*/
/*same as, but this is modern*/
app.listen(3000, ()=>{
    console.log("Server started on port 3000 - YAY")})

