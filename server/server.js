const express=require('express');
const bodyParser=require('body-parser');
const _=require('lodash');
const {ObjectID}=require('mongodb');

var {mongoose}=require('./db/mongoose');
var {Todo}=require('./models/todo');
var {User}=require('./models/users');

var app=express();
const port=process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos',(req,res)=>{
    
    var todo=new Todo({
        text:req.body.text
    });

    todo.save().then((doc)=>{
        res.send(doc);
    },(e)=>{
        res.status(400).send(e);
    });
});

app.get('/todos',(req,res)=>{
    Todo.find().then((todos)=>{
        res.send({todos});
    },(e)=>{
        res.status(400).send(e);
    });
});


// GET /todos/123456
app.get('/todos/:id',(req,res)=>{
    var id=req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findById(id).then((todo)=>{
        if(!todo){
            return res.status(404).send();
        }
        // responde con un objeto al que pueden añadirse proopiedades adicionales
        res.status(200).send({todo});
    }).catch((e)=>{
        res.status(400).send();
    });

});

app.delete('/todos/:id',(req,res)=>{

    var id=req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then((todo)=>{
        if(!todo){
            return res.status(404).send();
        }
        res.status(200).send({todo});
    }).catch((e)=>{
        res.status(400).send();
    });
    
});

app.patch('/todos/:id',(req,res)=>{
    var id=req.params.id;
    var body=_.pick(req.body,['text','completed']);
    if(!ObjectID.isValid(id)){
        console.log('invalid ID');
        return res.status(404).send();
    }
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt=new Date().getTime();
    }else{
        body.completed=false;
        body.completedAt=null;
    }

    Todo.findByIdAndUpdate(id,{$set:body},{new:true}).then((todo)=>{
        if(!todo){
            console.log('todo not found');
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e)=>{
        console.log('an error has ocurred');
        res.status(400).send();
    });
})

app.listen(port,()=>{
    console.log('Started on port 3000');
});

module.exports={
    app
};