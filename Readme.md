# APS.Net Web Api(Backend) Reactjs (Frontend)  Project 

## Set Up the application

1. Create a new ASP.NET Core Web API project

```bash
dotnet new webapi -n TodoAppApi
cd TodoAppApi

```

2. Add Entity Framework Core package:

```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools

```

3. Create the Models

- Create a TodoItem model in the Models folder.


```csharp
namespace TodoAppApi.Models
{
    public class TodoItem
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public bool IsComplete { get; set; }
    }
}

```


4. Add the connection parameters to the configuration file appsettings.json 

```json
"ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=databaseName;User Id=username;Password=yourpassword;TrustServerCertificate=True;"
},

```


5. Set Up the Database Context

- In Data folder, add a TodoContext class 
```csharp
using Microsoft.EntityFrameworkCore;
using TodoAppApi.Models;

namespace TodoAppApi.Data
{
    public class TodoContext : DbContext
    {
        public TodoContext(DbContextOptions<TodoContext> options) : base(options) { }

        public DbSet<TodoItem> TodoItems { get; set; }
    }
}

```

6. configure the context in Program.cs

```csharp
using Microsoft.EntityFrameworkCore;
using TodoAppApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Configure services
builder.Services.AddDbContext<TodoContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();

app.Run();

```

7. Add Migrations and Create the Database

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update

```

8. Create the TodoController in the Controllers folder.

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoAppApi.Data;
using TodoAppApi.Models;

namespace TodoAppApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoController : ControllerBase
    {
        private readonly TodoContext _context;

        public TodoController(TodoContext context)
        {
            _context = context;
        }

        // GET: api/Todo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems()
        {
            return await _context.TodoItems.ToListAsync();
        }

        // GET: api/Todo/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TodoItem>> GetTodoItem(int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);

            if (todoItem == null)
            {
                return NotFound();
            }

            return todoItem;
        }

        // POST: api/Todo
        [HttpPost]
        public async Task<ActionResult<TodoItem>> PostTodoItem(TodoItem todoItem)
        {
            _context.TodoItems.Add(todoItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTodoItem), new { id = todoItem.Id }, todoItem);
        }

        // PUT: api/Todo/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodoItem(int id, TodoItem todoItem)
        {
            if (id != todoItem.Id)
            {
                return BadRequest();
            }

            _context.Entry(todoItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Todo/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoItem(int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);
            if (todoItem == null)
            {
                return NotFound();
            }

            _context.TodoItems.Remove(todoItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TodoItemExists(int id)
        {
            return _context.TodoItems.Any(e => e.Id == id);
        }
    }
}

```

9. Add the app.MapControllers(); function to the Program.cs if not already defined.


10. Test the API with Insomnia or Postmann 



## Next Steps : Frontend Integration

1. Creaet React app

```bash
 npm create vite@latest my-react-app -- --template react
  ```


2. Install axios to manage HTTP requests

```bash
npm install axios
```

3. Install bootstrap to design your application

```bash
npm install bootstrap
```

4. Structure the App Component and Handle State
in App.jsx

```javascript
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


```

 
5. Enable Cors for Frontend in Progrma.cs 

```csharp
// Enable CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:5173") // Vite's default dev server port
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});
    
    app.UseCors("AllowReactApp"); // Apply CORS policy here

```