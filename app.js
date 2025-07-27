const express = require('express');
const app=express();

//IMPORT DB
const mongoose=require('./database/mongoose');

//IMPORT MODELS
const TaskList=require("./database/models/taskList");
const Task=require("./database/models/task");

//CORS - CROSS ORIGIN REQUEST SECURITY (MIDDLEWARE)
/**backend cvan request, but frontend (e.g. port 4200) will be blocked --> allow 
 * frontend request etc by othermiddleware: 
 * actual call: app.use(cors()); but internally does this */
app.use((request,response,next)=>{

    //WEBSITE ALLOWED TO CONNECT
    /**here use port of frontend, for any '*'   */
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    //REQUEST METHODS ALLOWED
    response.setHeader('Access-Control-Allow-Methods', 'GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE');

    //REQUEST HEADERS ALLOWED
    response.setHeader('Access-Control-Allow-Headers', 'Origin', 'X-Requested-With, Content-Type', 'Access');

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
 //ROUTE - GET ALL TASKLISTS
 app.get('/tasklists', (req, res)=>{
    TaskList.find({})
    .then((lists) => {
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
 /**if we only hand over one field in the body, and there are more, the reply will be none/null(?) */
 app.put('/tasklists/:taskListId', (req,res) => {
    
    TaskList.findOneAndUpdate({/**by default not returns update but old version */
        _id: req.params.taskListId}, 
            {$set: req.body},
            {new: true})//could also be findById
        .then((taskList)=>{
            res.status(200).send(taskList)
        })
        .catch((error)=>{
            console.log(error);
            res.status(500);
        });
    });
 

 //ROUTE - UPDATE TASKLIST - PATCH - PARTIAL UPDATE
  app.patch('/tasklists/:taskListId', (req,res) => {
    const taskListId = req.params.taskListId;
            
    TaskList.findByIdAndUpdate(//findOneAndUpdate also possible
        taskListId, 
        {$set: req.body},
        {new: true}
    )
    .then((updatedTaskList)=>{
        if(!updatedTaskList)
        {
            return res.status(404).send({ message : 'TaskList not found'});
        }
            res.status(200).send(updatedTaskList);
        })
        .catch((error)=>{
            console.log(error);
            res.status(500).send({ error : 'An error occured while updating the TaskList'});
        });
    }); 

//ROUTE - DELETE TASKLIST
app.delete('/tasklists/:taskListId', (req,res) => {
    const taskListId = req.params.taskListId;
            
    TaskList.findByIdAndDelete(//findOneAndUpdate also possible
        taskListId, 
        {new: true}//added because findby... returns notupdated, unless set to true
    )
    .then((updatedTaskList)=>{
        if(!updatedTaskList)
        {
            return res.status(404).send({ message : 'TaskList not found'});
        }
            res.status(201).send(updatedTaskList);
        })
        .catch((error)=>{
            console.log(error);
            res.status(500).send({ error : 'An error occured while updating the TaskList'});
        });
    }); 


//ROUTE - GET ALL TASKS
//ROUTE - GET TASK
//ROUTE - POST TASK
//ROUTE - PUT TASK
//ROUTE - PATCH TASK
//ROUTE - DELETE TASK




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

 