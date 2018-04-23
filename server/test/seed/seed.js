const {ObjectID}=require('mongodb');
const {Todo}=require('./../../models/todo');
const {Users}=require('./../../models/users');
const jwt=require('jsonwebtoken');
const userOneId=new ObjectID();
const userTwoId=new ObjectID();
const users = [{
  _id: userOneId,
  email: 'andrew@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'jen@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];


const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

  
  const populateTodos=(done) => {
    Todo.remove({}).then(() => {
      return Todo.insertMany(todos);
    }).then(() => done());
  };

  const populateUsers=(done)=>{
    Users.remove({}).then(()=>{
       var user1=new Users(users[0]).save(); // -> regresa una promesa
       var user2=new Users(users[1]).save(); // -> regresa una promesa

        // Promise.all -> recibe un array de promesas
       return Promise.all([user1,user2]);
    }).then(()=>done());
  }

  module.exports={
      todos,
      populateTodos,
      users,
      populateUsers
  }