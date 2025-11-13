import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Task } from '../types';
import { Plus, Loader2, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const priorityStyles = {
  high: 'bg-red-500/20 text-red-300 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

const TaskItem: React.FC<{ task: Task; onUpdate: (id: number, updates: Partial<Task>) => void; onDelete: (id: number) => void; }> = ({ task, onUpdate, onDelete }) => {
  return (
    <div className={`flex items-center gap-4 p-4 glass-pane transition-opacity ${task.completed ? 'opacity-50' : ''}`}>
      <button onClick={() => onUpdate(task.id, { completed: !task.completed })} className="cursor-pointer group">
        <div className={`w-6 h-6 rounded-full border-2 ${task.completed ? 'bg-primary border-primary' : 'border-border-color group-hover:border-primary'} flex items-center justify-center transition-colors`}>
          {task.completed && <Check size={16} className="text-white" />}
        </div>
      </button>
      <div className="flex-grow">
        <p className={`font-medium ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{task.name}</p>
        <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${priorityStyles[task.priority]}`}>{task.priority}</span>
        </div>
      </div>
      <button onClick={() => onDelete(task.id)} className="icon-btn hover:text-danger"><Trash2 size={18} /></button>
    </div>
  );
};

const AddTaskForm: React.FC<{ onAdd: (task: Partial<Task>) => void; onCancel: () => void }> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Task name cannot be empty.");
      return;
    }
    setLoading(true);
    await onAdd({ name, priority, due_date: dueDate });
    setLoading(false);
  };

  return (
    <div className="glass-pane p-6 mb-6 animate-slide-in">
      <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Finish project report"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')} className="form-input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="form-label">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-input" required />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn btn-secondary btn-small">Cancel</button>
          <button type="submit" className="btn btn-primary btn-small" disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) return;
      setLoading(true);
      const { data, error } = await api.getTasks(currentUser.id);
      if (error) {
        toast.error("Failed to fetch tasks.");
      } else {
        setTasks(data || []);
      }
      setLoading(false);
    };
    fetchTasks();
  }, [currentUser]);
  
  const handleAddTask = async (taskData: Partial<Task>) => {
    if (!currentUser) return;
    const { data, error } = await api.addTask(currentUser.id, taskData);
    if (error) {
      toast.error("Failed to add task.");
    } else if (data) {
      setTasks([data, ...tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      toast.success("Task added!");
      setShowForm(false);
    }
  };

  const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    setTasks(updatedTasks);

    const { error } = await api.updateTask(id, updates);
    if (error) {
      toast.error("Failed to update task.");
      setTasks(originalTasks); // Revert on error
    }
  };

  const handleDeleteTask = async (id: number) => {
    const originalTasks = [...tasks];
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    
    const { error } = await api.deleteTask(id);
    if (error) {
      toast.error("Failed to delete task.");
      setTasks(originalTasks); // Revert on error
    } else {
      toast.success("Task deleted.");
    }
  };
  
  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={20} />
          <span>{showForm ? 'Cancel' : 'Add Task'}</span>
        </button>
      </div>

      {showForm && <AddTaskForm onAdd={handleAddTask} onCancel={() => setShowForm(false)} />}
      
      {loading ? (
        <div className="text-center p-10">
          <Loader2 size={32} className="animate-spin text-primary mx-auto" />
        </div>
      ) : (
        <>
          {tasks.length === 0 && !showForm ? (
            <div className="text-center py-16 px-6 glass-pane">
                <h3 className="text-xl font-semibold text-text-primary">All clear!</h3>
                <p className="text-text-secondary mt-2">You have no tasks. Add one to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incompleteTasks.map(task => <TaskItem key={task.id} task={task} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />)}
              
              {completedTasks.length > 0 && (
                <div className="pt-8">
                  <h3 className="text-lg font-semibold text-text-secondary mb-4">Completed ({completedTasks.length})</h3>
                  <div className="space-y-4">
                    {completedTasks.map(task => <TaskItem key={task.id} task={task} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskManager;
