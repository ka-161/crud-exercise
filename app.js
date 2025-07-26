const express = require('express');
const app=express();

const mongoose=require('./database/mongoose');

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

 