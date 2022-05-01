const express = require("express");
const { v4 } = require("uuid");

const app = express();

app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  // recebendo o user do header
  const { username } = req.headers;
  // procurando se tem o user no "banco"
  const userExist = users.find((user) => user.username === username);
  // caso o usuario não tenha sido cadastrado exibir mensagem.
  if (!userExist) {
    return res.status(400).json({ error: "Mensagem do erro" });
  }
  // colocando para qualquer um que usar o midwere o usuario e mandando seguir
  req.user = userExist;
  return next();
}

app.post("/users", (request, response) => {
  //recebendo o nome e o user nae do usuario
  const { name, username } = request.body;
  // testando para ver se ja te esse usuario

  console.log(name);
  console.log(username);

  const userExist = users.find((user) => user.username === username);
  // caso o usuario não tenha sido cadastrado exibir mensagem.
  if (userExist) {
    console.log("entrou aqui");
    return response.status(400).json({ error: "Mensagem do erro" });
  }
  // salvando o usuario no "banco de dados"
  const user = {
    id: v4(),
    name,
    username,
    todos: [],
  };
  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (req, res) => {
  //recebendo o usuario do requisição
  const { user } = req;
  // retornando todos os TODOS do usuario
  return res.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (req, res) => {
  //recebendo o usuario do requisição
  const { user } = req;
  // recebendo o titulo e o deadline do usuario
  const { title, deadline } = req.body;

  const post = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(post);

  return res.status(201).json(post);
});

app.put("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const { title, deadline } = req.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Mensagem do erro" });
  }

  todo.deadline = new Date(deadline);
  todo.title = title;

  return res.status(200).json(todo);
  // na atividade não fala que tem que mandar de volta o todo
});

app.patch("/todos/:id/done", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Mensagem do erro" });
  }

  todo.done = true;

  return res.status(201).json(todo);
  // denovo não estava marcado dizendo que deveria voltar o todo
});

app.delete("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.findIndex((todo) => todo.id === id);

  if (todo === -1) {
    return res.status(404).json({ error: "Mensagem do erro" });
  }

  user.todos.splice(todo, 1);

  return res.status(204).json();
});

module.exports = app;
