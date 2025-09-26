// src/components/TodoList/TodoList.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { Star, CheckSquare, Square, Plus, X } from 'lucide-react';
import { TodoItem } from '@/types/dashboard';
import { getPriorityColor } from '@/lib/theme';

interface TodoListProps {
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
  onTodoComplete?: (todo: TodoItem) => void;
  currentTheme: any;
  isDarkMode: boolean;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  setTodos,
  onTodoComplete,
  currentTheme,
  isDarkMode
}) => {
  const [newTodo, setNewTodo] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Note: Completed todos are now handled by the parent component's
  // historical tracking system and are removed immediately upon completion

  // Toggle todo item
  const toggleTodo = (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    if (!todo.completed && onTodoComplete) {
      // About to mark as complete - use the completion handler
      onTodoComplete(todo);
    } else {
      // Toggling from complete to incomplete or no handler provided
      setTodos(todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    }
  };

  // Add new todo
  const addTodo = () => {
    if (newTodo.trim()) {
      const newId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
      setTodos([...todos, {
        id: newId,
        text: newTodo,
        priority: newTodoPriority,
        completed: false
      }]);
      setNewTodo('');
    }
  };

  // Remove todo
  const removeTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <section style={{
      background: currentTheme.cardBackground,
      borderRadius: '1rem',
      padding: '1.5rem',
      height: '400px', // Fixed height
      boxShadow: isDarkMode ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        color: currentTheme.textPrimary
      }}>
        <Star size={20} />
        <h2 style={{ flex: 1, fontSize: '1.25rem', margin: 0 }}>Today's Tasks</h2>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1rem',
        flex: 1,
        overflowY: 'auto',
        minHeight: 0 // Important for flex child scrolling
      }}>
        {todos.map(todo => (
          <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={() => toggleTodo(todo.id)}
              style={{
                background: 'none',
                border: 'none',
                color: todo.completed ? currentTheme.success : currentTheme.textMuted,
                cursor: 'pointer',
                padding: 0
              }}
            >
              {todo.completed ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>
            <span style={{
              flex: 1,
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? currentTheme.textMuted : currentTheme.textPrimary
            }}>
              {todo.text}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                backgroundColor: getPriorityColor(currentTheme, todo.priority)
              }} />
              <button onClick={() => removeTodo(todo.id)} style={{
                background: 'none',
                border: 'none',
                color: currentTheme.textMuted,
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '0.25rem'
              }}>
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Add new task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '0.5rem',
            outline: 'none',
            background: currentTheme.cardBackground,
            color: currentTheme.textPrimary
          }}
        />
        <select
          value={newTodoPriority}
          onChange={(e) => setNewTodoPriority(e.target.value as 'low' | 'medium' | 'high')}
          style={{
            padding: '0.5rem',
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '0.5rem',
            outline: 'none',
            background: currentTheme.cardBackground,
            color: currentTheme.textPrimary
          }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={addTodo} style={{
          padding: '0.5rem',
          background: currentTheme.primary,
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          <Plus size={20} />
        </button>
      </div>
      <div style={{
        height: '0.5rem',
        background: currentTheme.border,
        borderRadius: '0.25rem',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: currentTheme.success,
          width: todos.length > 0 ? `${(todos.filter(t => t.completed).length / todos.length) * 100}%` : '0%',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </section>
  );
};

export default TodoList;