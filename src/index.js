const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(400).json({ error: "User not found" })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userExists = users.find(user => user.username === username)

  if (userExists) {
    return response.status(400).json({ error: "User already exists" })
  }
  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { tittle, deadline } = request.body;

  const { user } = request;

  const toDos = {
    id: uuidv4(),
    tittle,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  user.todos.push(toDos);
  return response.status(201).json(toDos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { tittle, deadline } = request.body;

  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'To do not Found' });
  }

  todo.tittle = tittle;
  todo.deadline = new Date(deadline)

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: ' To do not Found' });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Not Found' });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204)
});

module.exports = app;