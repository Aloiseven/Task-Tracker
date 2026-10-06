#SERVER.JS

##Express
const express = require("express");
const app = express();
##Middleware
app.use(express.json());
app.use(express.static("public"));
##The Storage
let tasks = [
  { id: 1, text: "Wireframe the login screen", done: true },
  { id: 2, text: "Build the /api/tasks endpoint", done: true },
  { id: 3, text: "Connect frontend form to API", done: false },
];
##API
| Method | Endpoint         | Purpose        |
| ------ | ---------------- | -------------- |
| GET    | `/api/tasks`     | Retrieve tasks |
| POST   | `/api/tasks`     | Create a task  |
| PUT    | `/api/tasks/:id` | Update a task  |
| DELETE | `/api/tasks/:id` | Delete a task  |

