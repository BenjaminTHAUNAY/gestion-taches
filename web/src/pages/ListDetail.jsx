import { useEffect, useState } from "react";
import api from "../api/client";

export default function ListDetail({ list, onBack }) {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les tâches
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/task-lists/${list.id}/tasks`);
      setTasks(res.data);
    } catch (err) {
      setError(err.message || "Erreur lors de la récupération des tâches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [list]);

  // Ajouter une tâche
  const addTask = async () => {
    if (!newTitle) return;
    try {
      const res = await api.post(`/task-lists/${list.id}/tasks`, { title: newTitle });
      setTasks((prev) => [...prev, res.data]);
      setNewTitle("");
    } catch (err) {
      alert(err.message);
    }
  };

  // Modifier une tâche (done / title / dueDate)
  const updateTask = async (taskId, updates, version) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { ...updates, version });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      if (err.status === 409) alert("Conflit détecté : la tâche a été modifiée par un autre utilisateur.");
      else if (err.status === 428) alert("Precondition Required : version manquante.");
      else alert(err.message);
    }
  };

  // Supprimer une tâche
  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Chargement des tâches...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <button onClick={onBack}>← Retour aux listes</button>
      <h2>{list.name}</h2>

      <div>
        <input
          type="text"
          value={newTitle}
          placeholder="Nouvelle tâche"
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button onClick={addTask}>Ajouter</button>
      </div>

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={(e) =>
                updateTask(t.id, { done: e.target.checked }, t.version)
              }
            />
            <input
              type="text"
              value={t.title}
              onChange={(e) =>
                updateTask(t.id, { title: e.target.value }, t.version)
              }
            />
            {t.dueDate && <span> (Due: {new Date(t.dueDate).toLocaleDateString()})</span>}
            <button onClick={() => deleteTask(t.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
