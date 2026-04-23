import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchTasks = useCallback(async (token) => {
    try {
      const response = await axios.get('http://localhost:3000/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        fetchTasks(token);
      } catch (e) {
        handleLogout();
      }
    }
  }, [fetchTasks]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:3000/tasks',
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setDescription('');
      fetchTasks(token);
    } catch (err) {
      console.error('Failed to create task', err);
      alert('Failed to create task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:3000/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks(token);
    } catch (err) {
      console.error('Failed to delete task', err);
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleEditTask = async (task) => {
    const newTitle = window.prompt('Enter new title:', task.title);
    if (newTitle === null) return;
    
    const newDescription = window.prompt('Enter new description:', task.description || '');
    if (newDescription === null) return;

    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:3000/tasks/${task.id}`,
        { title: newTitle, description: newDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks(token);
    } catch (err) {
      console.error('Failed to update task', err);
      alert(err.response?.data?.error || 'Failed to update task');
    }
  };

  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Logged in as <span className="font-semibold">{user.role}</span> | Org: {user.organizationId}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Task Creation Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Task Title"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Task Description"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Add Task
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm text-center">No tasks found. Create one above!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => {
                // RBAC Logic: Show actions if ADMIN or if user is the creator
                const canModify = user.role === 'ADMIN' || task.createdById === user.id;

                return (
                  <div key={task.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {task.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2 text-sm">{task.description}</p>
                      <p className="text-xs text-gray-400 mt-4">Creator ID: {task.createdById}</p>
                    </div>
                    
                    {canModify && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
