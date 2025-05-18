import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const TodoList = () => {
  const [items, setItems] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [editIndex, setEditIndex] = useState(null); // Track which item is being edited
  const [editText, setEditText] = useState('');
  const [itemsToRemove, setItemsToRemove] = useState([]);

  const API_BASE_URL = 'http://localhost:8000';

  // Fetch current list of tasks
  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/items`);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Add effect to handle removal of completed items
  useEffect(() => {
    const timer = setTimeout(() => {
      if (itemsToRemove.length > 0) {
        const newItems = items.filter((_, index) => !itemsToRemove.includes(index));
        setItems(newItems);
        setItemsToRemove([]);
        
        // Optionally update backend here if needed
        // You might want to actually delete the items from your backend
      }
    }, 86400000); // 1 day delay

    return () => clearTimeout(timer);
  }, [itemsToRemove, items]);

  // Add a new task
  const addItem = async (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    try {
      await axios.post(`${API_BASE_URL}/items`, {
        text: taskText,
        is_done: false
      });
      setTaskText('');
      fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // ✅ Toggle is_done
  const toggleDone = async (index) => {
    const item = items[index];
    try {
      await axios.put(`${API_BASE_URL}/items/${index}`, {
        text: item.text,
        is_done: !item.is_done
      });
      
      if (!item.is_done) {
        // If marking as done, add to removal queue
        setItemsToRemove(prev => [...prev, index]);
        setTimeout(() => {
        axios.delete(`${API_BASE_URL}/items/${index}`);
        }, 86400000)
      } else {
        // If unmarking done, remove from removal queue
        setItemsToRemove(prev => prev.filter(i => i !== index));
      }
      
      fetchItems();
    } catch (error) {
      console.error("Error toggling done status:", error);
    }
  };

  // 🗑️ Delete a task
  const deleteItem = async (index) => {
    try {
      await axios.delete(`${API_BASE_URL}/items/${index}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // ✏️ Start editing
  const startEdit = (index, currentText) => {
    setEditIndex(index);
    setEditText(currentText);
  };

  // ✏️ Save edited task
  const saveEdit = async () => {
    const item = items[editIndex];
    console.log("Saving edit:", {
      index: editIndex,
      oldItem: item,
      newText: editText
    });

    try {
      await axios.put(`${API_BASE_URL}/items/${editIndex}`, {
        text: editText,
        is_done: item.is_done  // preserve original done status
      });
      setEditIndex(null);
      setEditText('');
      fetchItems();
    } catch (error) {
      console.error("Error saving edited task:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="todo-container">
      <h2 className="todo-title">📝 My Todo List</h2>
      <form className="todo-form" onSubmit={addItem}>
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Enter a task"
          className="todo-input"
        />
        <button
          type="submit"
          className="add-button"
        >
          Add Task
        </button>
      </form>

      <ul className="todo-list">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="todo-item"
          >
            {editIndex === idx ? (
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="edit-input"
                />
                <button
                  onClick={saveEdit}
                  className="save-button"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditIndex(null)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span
                  onClick={() => toggleDone(idx)}
                  className={`item-text ${item.is_done ? 'completed' : ''}`}
                >
                  {item.text}
                </span>
                <button
                  onClick={() => startEdit(idx, item.text)}
                  className="edit-button"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteItem(idx)}
                  className="delete-button"
                >
                  🗑️
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;