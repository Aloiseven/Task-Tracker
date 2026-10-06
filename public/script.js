(function(){
  "use strict";

  let filter = "all";

  const logEl = document.getElementById("log");
  const listEl = document.getElementById("taskList");
  const dbViewEl = document.getElementById("dbView");
  const dbCountEl = document.getElementById("dbCount");
  const addForm = document.getElementById("addForm");
  const taskInput = document.getElementById("taskInput");
  const addBtn = document.getElementById("addBtn");

  // ---------------------------------------------------------------
  // Real network layer: sends an actual HTTP request with fetch()
  // to the Express server and logs the round trip.
  // ---------------------------------------------------------------
  async function request(method, path, body){
    const line = addLogLine(method, path, "pending…");
    const started = performance.now();

    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

    const ms = Math.round(performance.now() - started);
    updateLogLine(line, res.status + (res.ok ? " OK" : " ERROR") + " · " + ms + "ms");
    return res.json();
  }

  function addLogLine(method, path, status){
    const empty = logEl.querySelector(".log-empty");
    if (empty) empty.remove();
    const row = document.createElement("div");
    row.className = "log-line";
    row.innerHTML =
      '<span class="method m-' + method + '">' + method + '</span>' +
      '<span class="path">' + path + '</span>' +
      '<span class="status pending">' + status + '</span>';
    logEl.prepend(row);
    return row;
  }
  function updateLogLine(row, status){
    const s = row.querySelector(".status");
    s.textContent = status;
    s.classList.remove("pending");
  }

  // ---------------------------------------------------------------
  // API — the four endpoints, now handled by server.js
  // ---------------------------------------------------------------
  const api = {
    list()       { return request("GET",    "/api/tasks"); },
    create(text) { return request("POST",   "/api/tasks", { text }); },
    toggle(id)   { return request("PUT",    "/api/tasks/" + id); },
    remove(id)   { return request("DELETE", "/api/tasks/" + id); },
  };

  // ---------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------
  function render(tasks){
    const visible = tasks.filter(t =>
      filter === "all" ? true : filter === "open" ? !t.done : t.done
    );

    listEl.innerHTML = "";
    if (visible.length === 0){
      listEl.innerHTML = '<div class="empty">No tasks here yet.</div>';
    } else {
      visible.forEach(t => {
        const li = document.createElement("li");
        li.className = "task" + (t.done ? " done" : "");
        li.innerHTML =
          '<div class="check" data-id="' + t.id + '">' + (t.done ? "✓" : "") + '</div>' +
          '<div class="text">' + escapeHtml(t.text) + '</div>' +
          '<div class="meta">#' + t.id + '</div>' +
          '<button class="del" data-id="' + t.id + '" title="Delete">×</button>';
        listEl.appendChild(li);
      });
    }

    dbViewEl.textContent = JSON.stringify(tasks, null, 2);
    dbCountEl.textContent = tasks.length + (tasks.length === 1 ? " record" : " records");
  }

  function escapeHtml(str){
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  async function refresh(){
    const tasks = await api.list();
    render(tasks);
  }

  // ---------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;
    taskInput.value = "";
    addBtn.disabled = true;
    await api.create(text);
    addBtn.disabled = false;
    refresh();
  });

  listEl.addEventListener("click", async (e) => {
    const id = Number(e.target.dataset.id);
    if (!id) return;
    if (e.target.classList.contains("check")){
      await api.toggle(id);
      refresh();
    } else if (e.target.classList.contains("del")){
      await api.remove(id);
      refresh();
    }
  });

  document.querySelectorAll(".filters button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filters button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filter = btn.dataset.filter;
      refresh();
    });
  });

  // initial load: fetch the tasks from the server
  refresh();
})();