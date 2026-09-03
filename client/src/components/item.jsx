import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export default function Items() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const getItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(api("/api/items"), {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to get items");
      }
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      getItems();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [getItems]);

  const handleLogout = async () => {
    try {
      await fetch(api("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/signin", { replace: true });
    }
  };

  async function createItem(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      setError("");
      const response = await fetch(api("/api/items"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create item");
      }
      setName("");
      await getItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      setError("");
      const response = await fetch(api(`/api/items/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete item");
      }
      await getItems();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(item) {
    setEditId(item._id);
    setEditName(item.name);
  }

  async function updateItem(e) {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      setSaving(true);
      setError("");
      const response = await fetch(api(`/api/items/${editId}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update item");
      }
      setEditId(null);
      setEditName("");
      await getItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full min-w-0 h-[34px] px-[10px] border border-[#232839] rounded-[7px] outline-none bg-[#10141d] text-[#e8eaf2] text-[10px] transition-all focus:border-[#6865f5] focus:ring-[3px] focus:ring-[#6865f5]/15 placeholder:text-[#5f6882]";

  const primaryButton =
    "min-h-[34px] px-[13px] rounded-[7px] border border-[#6865f5] bg-[#6865f5] text-white text-[9px] font-bold cursor-pointer transition-all hover:bg-[#7773ff] hover:border-[#7773ff] hover:-translate-y-[1px] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none";

  const secondaryButton =
    "min-h-[34px] px-[13px] rounded-[7px] border border-[#2c3246] bg-[#1a1f2e] text-[#bbc2db] text-[9px] font-bold cursor-pointer transition-all hover:border-[#3a425a] hover:bg-[#22283a] disabled:opacity-55 disabled:cursor-not-allowed";

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0b0e13] text-[#e8eaf2] flex flex-col items-center justify-center gap-3 font-sans text-[10px]">
        <div className="h-8 w-8 rounded-full border-[3px] border-[#232839] border-t-[#6865f5] animate-spin" />
        <p className="text-[#7c86a5] font-semibold">Loading items...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen m-0 px-[26px] pt-[22px] pb-[30px] bg-[#0b0e13] text-[#e8eaf2] font-sans text-[11px] overflow-x-hidden">
      {/* Header */}
      <div className="min-h-[64px] flex items-start justify-between gap-[18px] mb-[20px] pb-[17px] border-b border-[#232839]">
        <div>
          <span className="text-[#8582ff] text-[9px] font-bold">User Portal</span>
          <h1 className="mt-[7px] mb-[3px] text-[#f2f3f7] text-[20px] leading-[1.2] tracking-[-0.5px] font-semibold">
            My Items
          </h1>
          <p className="m-0 text-[#7c86a5] text-[10px] leading-[1.5]">
            Manage items assigned to your account
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={secondaryButton}
        >
          Log Out
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-[15px] px-[12px] py-[10px] border border-[#64323c] rounded-[7px] bg-[#28171d] text-[#ff8b96] text-[9px] leading-[1.5]">
          {error}
        </div>
      )}

      {/* Add Item Card */}
      <div className="mb-[18px] p-[17px] border border-[#232839] rounded-[10px] bg-[#121620]">
        <h2 className="m-0 mb-[3px] text-[#f0f1f6] text-[14px] leading-[1.3] font-semibold">
          Add New Item
        </h2>
        <p className="m-0 mb-3 text-[9px] text-[#7c86a5]">
          Enter an item name to add it to your list.
        </p>

        <form onSubmit={createItem} className="flex gap-2 max-w-[500px]">
          <input
            type="text"
            placeholder="Enter item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
          <button
            type="submit"
            disabled={saving}
            className={primaryButton}
          >
            {saving ? "Adding..." : "Add Item"}
          </button>
        </form>
      </div>

      {/* Items Table Card */}
      <div className="w-full min-w-0 overflow-hidden border border-[#232839] rounded-[10px] bg-[#121620]">
        <div className="min-h-[54px] flex items-center justify-between gap-[15px] px-[15px] py-[12px] border-b border-[#232839]">
          <h2 className="m-0 text-[#f0f1f6] text-[13px] font-semibold">
            Item List
          </h2>
          <span className="shrink-0 px-[8px] py-[4px] rounded-full bg-[#202441] text-[#9592ff] text-[8px] font-bold">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="min-h-[140px] flex flex-col items-center justify-center px-[18px] py-[25px] text-center text-[#7c86a5]">
            <h3 className="m-0 mb-[5px] text-[#e8eaf2] text-[12px] font-semibold">
              No items found
            </h3>
            <p className="m-0 text-[9px]">Add an item above to get started.</p>
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto overflow-y-hidden">
            <table className="w-full min-w-[500px] table-fixed border-spacing-0 border-collapse">
              <thead>
                <tr>
                  <th className="w-[70%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px]">
                    Item Name
                  </th>
                  <th className="w-[30%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className="bg-transparent hover:bg-[#171b27] transition-colors"
                  >
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#dfe2ec] text-[9px] font-bold whitespace-nowrap text-ellipsis">
                      {editId === item._id ? (
                        <form onSubmit={updateItem} className="flex gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                            className={`${inputClass} max-w-[280px]`}
                          />
                          <button
                            type="submit"
                            disabled={saving}
                            className="min-h-[26px] px-[7px] border border-[#6865f5] rounded-[6px] bg-[#6865f5] text-white text-[7px] font-bold cursor-pointer hover:bg-[#7773ff]"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditId(null);
                              setEditName("");
                            }}
                            className="min-h-[26px] px-[7px] border border-[#2c3246] rounded-[6px] bg-[#1a1f2e] text-[#bbc2db] text-[7px] font-bold cursor-pointer hover:bg-[#22283a]"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden">
                      {editId !== item._id && (
                        <div className="flex items-center gap-[5px]">
                          <button
                            type="button"
                            className="min-h-[26px] px-[7px] border border-[#4945a0] rounded-[6px] bg-transparent text-[#9592ff] text-[7px] font-bold cursor-pointer hover:bg-[#202441] transition-colors"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="min-h-[26px] px-[7px] border border-[#63343c] rounded-[6px] bg-transparent text-[#f07b86] text-[7px] font-bold cursor-pointer hover:bg-[#2b181e] transition-colors"
                            onClick={() => deleteItem(item._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}