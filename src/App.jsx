import React, { useEffect, useMemo, useState } from "react";
import { Logo } from "./components/Logo";
import { TaskItem } from "./components/TaskItem";
import { Filters } from "./components/Filters";
import { NewTask } from "./components/NewTask";
import { useLocalState } from "./hooks/useLocalState";

export default function App() {
  const [tasks, setTasks] = useLocalState("hiqode.tasks", []);
  const [filter, setFilter] = useLocalState("hiqode.filter", "all");

  // ⭐ NEW: Search state
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!Array.isArray(tasks)) setTasks([]);
  }, []);

  // ⭐ UPDATED: Combined Filtering (Tabs + Search)
  const filtered = useMemo(() => {
    let list = tasks;

    // Tabs filter
    if (filter === "active") list = list.filter((t) => !t.done);
    if (filter === "completed") list = list.filter((t) => t.done);

    // Search filter
    if (search.trim() !== "") {
      list = list.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    return list;
  }, [tasks, filter, search]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      done: tasks.filter((t) => t.done).length,
    }),
    [tasks]
  );

  function addTask(title, category, dueDate) {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        category,
        dueDate, // ⭐ NEW
        done: false,
        createdAt: Date.now(),
      },
    ]);
  }

  function toggle(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function edit(id, title) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: title.trim() } : t))
    );
  }

  function remove(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Logo />
        <div className="stats">
          <span>Total: {stats.total}</span>
          <span>Done: {stats.done}</span>
          <span>Open: {stats.total - stats.done}</span>
        </div>
      </header>

      <main className="panel">
        <h1>HiQode Tasks Manager</h1>
        <p className="muted">
          Double-click a task to edit. Click the checkbox to mark done.
        </p>

        <NewTask onAdd={addTask} />

        {/* ⭐ UPDATED: Search + Tabs */}
        <Filters
          value={filter}
          onChange={setFilter}
          searchValue={search}
          onSearchChange={setSearch}
        />

        <ul className="list">
          {filtered.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onToggle={() => toggle(t.id)}
              onEdit={(v) => edit(t.id, v)}
              onRemove={() => remove(t.id)}
            />
          ))}
        </ul>

        <div className="actions">
          <button className="btn ghost" onClick={clearCompleted}>
            Clear completed
          </button>
        </div>
      </main>

      <footer className="footer">
        <small>v1.0.0 · Local only · Designed for classroom Git workflow</small>
      </footer>
    </div>
  );
}
