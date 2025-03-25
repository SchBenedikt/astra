import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { PluginComponentProps, PluginHandle } from '../PluginRegistry';

// Todo interface
export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

// Cookie helper functions
const COOKIE_NAME = 'gemini_todos';

const saveTodosInCookies = (todos: Todo[]) => {
  const todosJson = JSON.stringify(todos);
  // Set cookie to expire in 30 days
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(todosJson)}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
};

const loadTodosFromCookies = (): Todo[] => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME && value) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        console.error('Error parsing todos from cookie:', e);
        return [];
      }
    }
  }
  return [];
};

// Todo Tool Declaration
export const todoDeclaration: FunctionDeclaration = {
  name: "manage_todo",
  description: "Manages a todo list. Provide a JSON string containing an array of todo objects ({id, text, done}).",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      todos: {
        type: SchemaType.STRING,
        description:
          "JSON string of an array of todos with properties id, text and done. Example: '[{\"id\":\"1\",\"text\":\"Einkaufen\",\"done\":false}]'",
      },
    },
    required: ["todos"],
  },
};

export const TodoPlugin = forwardRef<PluginHandle, PluginComponentProps>(({ isEnabled }, ref) => {
  // Initialize state with todos from cookies
  const [todos, setTodos] = useState<Todo[]>(() => loadTodosFromCookies());

  // Save todos to cookies whenever they change
  useEffect(() => {
    if (todos.length > 0) {
      saveTodosInCookies(todos);
    }
  }, [todos]);

  // Expose plugin methods through ref
  useImperativeHandle(ref, () => ({
    handleToolCall: (fc) => {
      if (fc.name === todoDeclaration.name && isEnabled) {
        try {
          const todosStr = fc.args.todos;
          const newTodos = JSON.parse(todosStr);
          if (!Array.isArray(newTodos)) {
            console.error("Invalid todos format - Array expected");
          } else {
            console.log("Setting todos:", newTodos);
            setTodos(newTodos);
          }
        } catch (e) {
          console.error("Error processing todos:", e);
        }
      }
    }
  }));

  // Toggle todo "done" state
  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo));
  };

  // Clear all todos
  const clearTodos = () => {
    setTodos([]);
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  if (!isEnabled || todos.length === 0) return null;

  return (
    <>
      <div style={{
        color: '#b8e6ff',
        fontSize: '0.9rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        marginTop: '15px',
        marginBottom: '5px',
        paddingBottom: '3px',
        borderBottom: '1px solid rgba(184, 230, 255, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Todo-Liste</span>
        <button 
          onClick={clearTodos}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#b8e6ff',
            fontSize: '0.8rem',
            cursor: 'pointer',
            opacity: 0.7
          }}
        >
          Löschen
        </button>
      </div>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: '10px 0'
      }}>
        {todos.map(todo => (
          <li key={todo.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#e1e2e3',
            backgroundColor: 'rgba(30, 30, 30, 0.7)',
            padding: '8px 10px',
            borderRadius: '6px',
            marginBottom: '5px'
          }}>
            <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
});

export default TodoPlugin;
