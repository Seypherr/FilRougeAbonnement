import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import { Badge } from "../components/Badge.jsx";
import { Button } from "../components/Button.jsx";
import { Card } from "../components/Card.jsx";
import { formatMoney } from "../utils/subscriptions.js";

export function AdminPage({ t, notify }) {
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "USER", isActive: true });
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const [userData, subscriptionData] = await Promise.all([
        apiRequest("/admin/users"),
        apiRequest("/admin/subscriptions")
      ]);
      setUsers(userData.users);
      setSubscriptions(subscriptionData.subscriptions);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/admin/users", { method: "POST", body: newUser });
      setNewUser({ name: "", email: "", password: "", role: "USER", isActive: true });
      notify(t.userCreated);
      load();
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    }
  };

  const updateUser = async (user, patch) => {
    try {
      await apiRequest(`/admin/users/${user.id}`, { method: "PUT", body: patch });
      notify(t.userUpdated);
      load();
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(t.confirmDeleteUser)) {
      return;
    }
    try {
      await apiRequest(`/admin/users/${user.id}`, { method: "DELETE" });
      notify(t.userDeleted);
      load();
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    }
  };

  return (
    <div className="grid gap-5">
      {error && <Card><p className="text-sm font-bold text-rose-700">{error}</p></Card>}
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-5 text-xl font-black">{t.createUser}</h2>
          <form className="grid gap-4" onSubmit={createUser}>
            <input className="input" placeholder={t.name} value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} required />
            <input className="input" placeholder={t.email} type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} required />
            <input className="input" placeholder={t.password} type="password" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} required minLength={8} />
            <select className="input" value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <Button><Plus size={16} />{t.save}</Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-5 text-xl font-black">{t.manageUsers}</h2>
          <div className="grid gap-3">
            {users.map((item) => (
              <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 lg:grid-cols-[1fr_140px_130px_auto]" key={item.id}>
                <div>
                  <p className="font-black">{item.name}</p>
                  <p className="break-all text-sm font-semibold text-slate-500">{item.email}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">{t.subscriptionCount}: {item._count?.subscriptions ?? 0}</p>
                </div>
                <select className="input" value={item.role} onChange={(event) => updateUser(item, { role: event.target.value })}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <Button variant="secondary" onClick={() => updateUser(item, { isActive: !item.isActive })}>{item.isActive ? t.enabled : t.disabled}</Button>
                <Button variant="danger" onClick={() => deleteUser(item)}><Trash2 size={16} />{t.delete}</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-5 text-xl font-black">{t.allSubscriptions}</h2>
        <div className="grid gap-3">
          {subscriptions.length === 0 ? <p className="text-sm font-semibold text-slate-500">{t.empty}</p> : subscriptions.map((item) => (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4" key={item.id}>
              <div>
                <p className="font-black">{item.name}</p>
                <p className="text-sm font-semibold text-slate-500">{item.user?.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={item.status}>{item.status}</Badge>
                <p className="font-black">{formatMoney(item.monthlyAmount)} / {t.perMonth}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
