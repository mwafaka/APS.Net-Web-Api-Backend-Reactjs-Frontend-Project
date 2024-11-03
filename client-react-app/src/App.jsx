import { useState, useEffect } from "react";
// index.js or App.js
import 'bootstrap/dist/css/bootstrap.css';

import axios from "axios";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editTodoId, setEditTodoId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // Load todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const response = await axios.get("http://localhost:5143/api/Todo");
    const data = await response.data;
    setTodos(data);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo = { title: newTodo, isComplete: false };
    await axios.post("http://localhost:5143/api/Todo", todo);
    setNewTodo("");
    fetchTodos(); // Refresh the list
  };

  const handleToggleComplete = async (id, isComplete) => {
    await axios.put(`http://localhost:5143/api/Todo/${id}`, {
      isComplete: !isComplete,
    });
    fetchTodos();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5143/api/Todo/${id}`);
    fetchTodos();
  };

  // Enter edit mode
  const handleEditClick = (todo) => {
    setEditTodoId(todo.id);
    setEditTitle(todo.title);
  };

  // Save the edited title
  const handleSaveEdit = async (id) => {
    console.log(editTitle)
    await axios.put(`http://localhost:5143/api/Todo/${id}`, {
      id:id,
      title: editTitle,
    });
    setEditTodoId(null); // Exit edit mode
    fetchTodos();
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center text-warning-emphasis mb-4">APS.Net Web Api(Backend) Reactjs (Frontend)  Project </h1>
  
      <form className="input-group mb-3" onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task"
          className="form-control"
        />
        <button type="submit" className="btn btn-success">
          Add
        </button>
      </form>
  
      <ul className="list-group">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <li key={todo.id} className="list-group-item d-flex justify-content-between align-items-center">
              {editTodoId === todo.id ? (
                // Edit mode: input to edit title
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="form-control me-2"
                  />
                  <button className="btn btn-primary me-2" onClick={() => handleSaveEdit(todo.id)}>Save</button>
                  <button className="btn btn-secondary" onClick={() => setEditTodoId(null)}>Cancel</button>
                </>
              ) : (
                // Display mode: show title with edit and delete buttons
                <>
                  <span
                    style={{
                      textDecoration: todo.isComplete ? "line-through" : "none",
                      cursor: "pointer",
                    }}
                    onClick={() => handleToggleComplete(todo.id, todo.isComplete)}
                    className="me-auto"
                  >
                    {todo.title}
                  </span>
                  <button className="btn btn-warning me-2" onClick={() => handleEditClick(todo)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(todo.id)}>Delete</button>
                </>
              )}
            </li>
          ))
        ) : (
          <li className="list-group-item text-center">No data</li>
        )}
      </ul>
    </div>
  );
}

export default App;
