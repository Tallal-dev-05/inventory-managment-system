import { useEffect, useState } from "react";

function Items() {
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  const [name, setName] = useState("");

  
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  
  async function getItems() {
    try {
      const response = await fetch(api("/api/items"));

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to get items");
      }

      setItems(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  
  async function createItem() {
    try {
      const response = await fetch(api("/api/items"), {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create item");
      }

      
      setName("");

      
      getItems();
    } catch (error) {
      setError(error.message);
    }
  }

  
  async function deleteItem(id) {
    try {
      const response = await fetch(api(`/api/items/${id}`), {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete item");
      }

      getItems();
    } catch (error) {
      setError(error.message);
    }
  }

  
  function startEdit(item) {
    setEditId(item._id);
    setEditName(item.name);
  }

  
  async function updateItem() {
    try {
      const response = await fetch(api(`/api/items/${editId}`), {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: editName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update item");
      }

      setEditId(null);
      setEditName("");

      getItems();
    } catch (error) {
      setError(error.message);
    }
  }

 
  useEffect(() => {
    getItems();
  }, []);

  
  if (loading) {
    return <h1>Loading items...</h1>;
  }

  
  if (error) {
    return <h1>{error}</h1>;
  }

  
  return (
    <div style={{ padding: "30px" }}>
      <h1>Items</h1>

      
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Enter item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={createItem}>
          Add Item
        </button>
      </div>

      {/* READ */}
      {items.map((item) => (
        <div
          key={item._id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          {/* EDIT MODE */}
          {editId === item._id ? (
            <div>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <button onClick={updateItem}>
                Save
              </button>

              <button
                onClick={() => {
                  setEditId(null);
                  setEditName("");
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            /* NORMAL MODE */
            <div>
              <h2>{item.name}</h2>

              {/* EDIT */}
              <button
                onClick={() => startEdit(item)}
              >
                Edit
              </button>

              {/* DELETE */}
              <button
                onClick={() => deleteItem(item._id)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Items;