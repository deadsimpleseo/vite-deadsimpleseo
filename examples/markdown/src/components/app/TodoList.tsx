import { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, { id: Date.now(), text: inputValue, completed: false }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <div style={{ 
      marginTop: '3rem', 
      background: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '2rem 2rem 1.5rem',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <h2 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '1.75rem',
          fontWeight: '300',
          color: '#2c3e50',
          letterSpacing: '-0.5px'
        }}>
          todos
        </h2>
        <p style={{ 
          color: '#95a5a6', 
          margin: 0,
          fontSize: '0.875rem'
        }}>
          Double-click to edit • Click checkbox to complete
        </p>
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '0', 
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            style={{
              flex: 1,
              padding: '1rem 1.25rem',
              border: 'none',
              fontSize: '1.125rem',
              outline: 'none',
              fontStyle: inputValue ? 'normal' : 'italic',
              color: '#4d4d4d'
            }}
          />
          <button
            onClick={addTodo}
            disabled={!inputValue.trim()}
            style={{
              padding: '1rem 1.75rem',
              background: inputValue.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
              color: 'white',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              opacity: inputValue.trim() ? 1 : 0.6
            }}
          >
            Add
          </button>
        </div>

        {todos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            color: '#d0d0d0'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>✓</div>
            <p style={{ 
              fontSize: '1.125rem',
              fontWeight: '300',
              margin: 0,
              color: '#bbb'
            }}>
              No todos yet
            </p>
          </div>
        ) : (
          <div>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              borderTop: '1px solid #f0f0f0'
            }}>
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 0',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    const deleteBtn = e.currentTarget.querySelector('button') as HTMLElement;
                    if (deleteBtn) deleteBtn.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const deleteBtn = e.currentTarget.querySelector('button') as HTMLElement;
                    if (deleteBtn) deleteBtn.style.opacity = '0';
                  }}
                >
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flex: 1,
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        cursor: 'pointer',
                        accentColor: '#667eea'
                      }}
                    />
                    <span style={{ 
                      fontSize: '1.125rem',
                      color: todo.completed ? '#d0d0d0' : '#4d4d4d',
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      transition: 'color 0.2s ease',
                      fontWeight: '300'
                    }}>
                      {todo.text}
                    </span>
                  </label>
                  <button
                    onClick={() => removeTodo(todo.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#cc9a9a',
                      fontSize: '1.75rem',
                      cursor: 'pointer',
                      padding: '0',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease',
                      opacity: '0',
                      fontWeight: '300'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#af5b5e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#cc9a9a';
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 0 0.5rem',
              fontSize: '0.875rem',
              color: '#777'
            }}>
              <span>
                <strong style={{ color: '#667eea' }}>{activeTodos.length}</strong> {activeTodos.length === 1 ? 'item' : 'items'} left
              </span>
              {completedTodos.length > 0 && (
                <button
                  onClick={() => setTodos(activeTodos)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#777',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textDecoration: 'underline',
                    padding: '0.25rem 0.5rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#333'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#777'}
                >
                  Clear completed ({completedTodos.length})
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
