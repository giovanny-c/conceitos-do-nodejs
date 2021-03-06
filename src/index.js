const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: "user not found!" })
  }

  request.user = user

  return next()

}

function checkIfTodoExists(request, response, next) {
  const { id } = request.params
  const { user } = request

  const todoExists = user.todos.find(todo => todo.id === id)

  if (!todoExists) {
    return response.status(404).json({ error: "This todo does not exists" })
  }

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const id = uuidv4()

  if (name == "" || username == "") {

    return response.status(400).json({ error: "you could not create a user whitout a name or username" })
  }


  const usernameAlredyExists = users.some(user => user.username === username)

  if (usernameAlredyExists) {

    return response.status(400).json({ error: "This username already exists!" })//400 bad request do client
  }


  if (users)

    users.push({
      id,
      name,
      username,
      todos: []
    })

  const user = users.find(user => user.id === id)

  return response.status(201).json(user)


});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request

  return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  if (title == "" || deadline == "") {

    return response.status(400).json({ error: "you could not create a todo without a title or a deadline" })
  }


  const id = uuidv4()

  user.todos.push({
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()

  })

  const todo = user.todos.find(todo => todo.id === id)

  return response.status(201).json(todo)


});

app.put('/todos/:id', checksExistsUserAccount, checkIfTodoExists, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { user } = request

  if (title == "" || deadline == "") {

    return response.status(400).json({ error: "you could not update a todo without a title or a deadline" })
  }


  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {

    return response.status(404).json({ error: "Todo does not exists" })
  }


  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(201).json(todo)


});

app.patch('/todos/:id/done', checksExistsUserAccount, checkIfTodoExists, (request, response) => {
  const { user } = request
  const { id } = request.params


  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {

    return response.status(404).json({ error: "Todo does not exists" })
  }

  todo.done = true

  return response.status(201).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checkIfTodoExists, (request, response) => {
  const { user } = request
  const { id } = request.params


  user.todos.map(todo => {

    if (todo.id === id) {

      let i = user.todos.indexOf(todo)
      user.todos.splice(i, 1)

    }


  })


  return response.status(204).send()

});

module.exports = app;