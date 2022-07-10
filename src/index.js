const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request?.headers;

  const user = users?.find((e) => e?.username === username);

  if (!user) {
    return response?.status(404)?.json({
      error: "Usuário não encontrado",
    });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request?.body;

  const alreadyExistsUser = users?.some((e) => e?.username === username);

  if (alreadyExistsUser) {
    return response?.status(400)?.json({ error: "Este usuário já existe" });
  }

  const newUser = {
    id: String(uuidv4()),
    name,
    username,
    todos: [],
  };

  users?.push(newUser);

  return response?.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response?.status(200)?.json(user?.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request?.body;

  const { user } = request;

  const newTodo = {
    id: String(uuidv4()),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  users = users?.map((e) => {
    if (e?.username === user?.username) {
      return {
        ...e,
        todos: [...e?.todos, newTodo],
      };
    }

    return e;
  });

  return response?.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request?.params;
  const { title, deadline } = request?.body;

  const { user } = request;

  let updateTodo = {};

  users = users?.map((e) => {
    if (e?.username === user?.username) {
      return {
        ...e,
        todos: e?.todos?.map((todo) => {
          if (todo?.id === id) {
            updateTodo = { ...todo, title, deadline };

            return updateTodo;
          }

          return todo;
        }),
      };
    }

    return e;
  });

  if (!Object?.values(updateTodo)?.length) {
    return response
      .status(404)
      ?.send({ error: "Não encontramos todo para atualizar" });
  }

  return response.status(200)?.send(updateTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request?.params;

  const { user } = request;

  let existTodo = {};

  users = users?.map((e) => {
    if (e?.username === user?.username) {
      return {
        ...e,
        todos: e?.todos?.map((todo) => {
          if (todo?.id === id) {
            existTodo = { ...todo, done: true };
            return existTodo;
          }

          return todo;
        }),
      };
    }

    return e;
  });

  if (!Object?.values(existTodo)?.length) {
    return response
      .status(404)
      ?.send({ error: "Não encontramos todo para atualizar" });
  }

  return response.status(200)?.json(existTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request?.params;

  const { user } = request;

  let existTodo = {};

  users = users?.map((e) => {
    if (e?.username === user?.username) {
      return {
        ...e,
        todos: e?.todos?.filter((todo) => {
          if (todo?.id !== id) {
            return todo;
          } else {
            existTodo = todo;
          }
        }),
      };
    }

    return e;
  });

  if (!Object?.values(existTodo)?.length) {
    return response
      .status(404)
      ?.send({ error: "Não encontramos todo para excluir" });
  }

  return response.status(204)?.send();
});

module.exports = app;
