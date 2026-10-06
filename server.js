const express = require("express");
const app = express();

app.use(express.json());          // parse JSON request bodies
app.use(express.static("public")); // serve index.html, demo.css, script.js

// In-memory "database" (swap for MySQL/MongoDB later)
let tasks = [
  { id: 1, text: "Wireframe the login screen", done: true },
  { id: 2, text: "Build the /api/tasks endpoint", done: true },
  { id: 3, text: "Connect frontend form to API", done: false },
];
let nextId = 4;

app.get("/api/tasks", (req, res) => res.json(tasks));

app.post("/api/tasks", (req, res) => {
  const task = { id: nextId++, text: req.body.text, done: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.put("/api/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  task.done = !task.done;
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  tasks = tasks.filter(t => t.id !== Number(req.params.id));
  res.json({ id: Number(req.params.id) });
});

app.listen(3000, () => console.log("Running at http://localhost:3000"));
