const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {Users}=require('./../models/users');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todos,populateTodos,users,populateUsers}=require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos',()=>{
   it('should create a new todo',(done)=>{
    var text='test todo text';
    request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res)=>{
            expect(res.body.text).toBe(text);
        })
        .end((err,res)=>{
            if(err){
                return done(err);
            }

            // assertion on the database data 
            Todo.find({text}).then((todos)=>{
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e)=> done(e));
        });
   });
   
   it('should not create todo with invalid body data',(done)=>{
    request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res)=>{
            if(err){
                return done(err);
            }
            Todo.find().then((todos)=>{
                expect(todos.length).toBe(2);
                done();
            }).catch((e)=> done(e));
        });
   });
});

describe('GET /todos',()=>{
    it('should get all todos',(done)=>{
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res)=>{
                expect(res.body.todos.length).toBe(2);
            }).end(done);
    });
});

describe('GET /todos/id',()=>{
    it('should return todo doc',(done)=>{
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found',(done)=>{
        var id=new ObjectID().toHexString();
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-objects ids',(done)=>{
        request(app)
            .get('/todos/1234')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
      var hexId = todos[1]._id.toHexString();
      request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo._id).toBe(hexId);
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
  
          Todo.findById(hexId).then((todo) => {
            expect(todo).toNotExist();
            done();
          }).catch((e) => done(e));
        });
    });
  
    it('should return 404 if todo not found', (done) => {
      var hexId = new ObjectID().toHexString();
  
      request(app)
        .delete(`/todos/${hexId}`)
        .expect(404)
        .end(done);
    });
  
    it('should return 404 if object id is invalid', (done) => {
      request(app)
        .delete('/todos/123abc')
        .expect(404)
        .end(done);
    });
  });

  describe('PATCH /todos/:id',()=>{
    it('should update todo',(done)=>{
        var id=todos[1]._id.toHexString();
        var text='new text';
        request(app)
            .patch(`/todos/${id}`)
            .send({
                completed:true,
                text:text
            })
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
    });

    it('should clear completedAt when todo not completed',(done)=>{
        var id=todos[1]._id.toHexString();
        var text='some other text';
        request(app)
            .patch(`/todos/${id}`)
            .send({
                completed:false,
                text:text
            })
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done);
    });
  });

  describe('GET /users/me',()=>{
      it('should  return user if authenticated',(done)=>{
        request(app)
            .get('/users/me')
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
      });

      it('it should return 401 if not authenticated',(done)=>{
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res)=>{
                expect(res.body).toEqual({});
            })
            .end(done);
      });
  });

  describe('POST /users',()=>{
      it('should create a user',(done)=>{
        var email='example@mail.com';
        var password='123456';
        request(app)
            .post('/users')
            .send({email,password})
            .expect(200)
            .expect((res)=>{
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err)=>{
                if(err){
                    return done(err)
                }
                Users.findOne({email}).then((user)=>{
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                })
            });
      });

      it('should return validation error if request invalid',(done)=>{
        request(app)
            .post('/users')
            .send({
                email:'pablo',
                password:'123'
            })
            .expect(400)
            .end(done);
      });

      it('should not create user if email is used',(done)=>{
        var email=users[0].email;
        var password='123456';
        request(app)
            .post('/users')
            .send({email,password})
            .expect(400)
            .end((err)=>{
                if(err){
                    return done(err);
                }
                Users.findOne({email}).then((user)=>{
                    console.log('email address is already in use');
                    expect(user.email).toBe(email);
                    done();
                });
              })
      });
  });
