import { useEffect, useState } from "react";
import api from "../api/client";

export default function ListMembers({ list, onBack }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("reader");

  // Récupérer les membres
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/task-lists/${list.id}/members`);
      setMembers(res.data);
    } catch (err) {
      setError(err.message || "Erreur lors de la récupération des membres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [list]);

  // Ajouter un membre
  const addMember = async () => {
    if (!newEmail) return;
    try {
      const res = await api.post(`/task-lists/${list.id}/members`, {
        email: newEmail,
        role: newRole,
      });
      setMembers((prev) => [...prev, res.data]);
      setNewEmail("");
      setNewRole("reader");
    } catch (err) {
      alert(err.message);
    }
  };

  // Modifier le rôle
  const updateRole = async (userId, role) => {
    try {
      const res = await api.put(`/task-lists/${list.id}/members/${userId}`, { role });
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? res.data : m))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Retirer un membre
  const removeMember = async (userId) => {
    try {
      await api.delete(`/task-lists/${list.id}/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Chargement des membres...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <button onClick={onBack}>← Retour</button>
      <h2>Membres de {list.name}</h2>

      <div>
        <input
          type="email"
          value={newEmail}
          placeholder="Email du membre"
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          <option value="reader">Reader</option>
          <option value="editor">Editor</option>
          <option value="owner">Owner</option>
        </select>
        <button onClick={addMember}>Ajouter</button>
      </div>

      <ul>
        {members.map((m) => (
          <li key={m.userId}>
            {m.email} - {m.role}
            {m.role !== "owner" && (
              <>
                <select
                  value={m.role}
                  onChange={(e) => updateRole(m.userId, e.target.value)}
                >
                  <option value="reader">Reader</option>
                  <option value="editor">Editor</option>
                </select>
                <button onClick={() => removeMember(m.userId)}>Retirer</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
