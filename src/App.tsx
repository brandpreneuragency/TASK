import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeView from './views/HomeView';
import CalendarView from './views/CalendarView';
import UsersView from './views/UsersView';
import SettingsView from './views/SettingsView';
import MobileNav from './components/MobileNav';
import AlertBanner from './components/AlertBanner';
import TaskModal from './components/TaskModal';
import { createUserInSupabase, deleteUserFromSupabase, getUsersFromSupabase, updateUserInSupabase } from './services/usersService';
import { getRolePermissions } from './utils/rolePermissions';
import { isSupabaseConfigured } from './services/supabase';

import { mockUsers, mockTasks, mockProjects, getCurrentUser } from './mockData';
import type { Task, User, Project } from './types';
import type { ViewType } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User>(getCurrentUser());

  // Admin filter state - when set, shows only tasks for selected user
  const [selectedUserIdFilter, setSelectedUserIdFilter] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      if (!isSupabaseConfigured) return;

      try {
        const remoteUsers = await getUsersFromSupabase();
        if (remoteUsers.length === 0) return;

        setUsers(remoteUsers);

        const syncedCurrentUser = remoteUsers.find(user => user.id === currentUser.id);
        if (syncedCurrentUser) {
          setCurrentUser(syncedCurrentUser);
        }
      } catch (error) {
        console.error('Failed to load users from Supabase. Falling back to local data.', error);
      }
    };

    loadUsers();
  }, []);

  // Filter tasks based on admin selection
  const filteredTasks = selectedUserIdFilter
    ? tasks.filter(task => task.assignedTo.includes(selectedUserIdFilter))
    : tasks;

  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: '',
      status: 'OFF',
      priority: 'medium',
      deadline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      groupId: 'proj-general',
      assignedTo: [selectedUserIdFilter || currentUser.id],
      subtasks: [],
      files: [],
      comments: []
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleSaveTask = (savedTask: Task) => {
    setTasks(prev => {
      const exists = prev.find(t => t.id === savedTask.id);
      if (exists) {
        return prev.map(t => t.id === savedTask.id ? savedTask : t);
      }
      return [...prev, savedTask];
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleCreateProject = (name: string): Project => {
    const normalizedName = name.trim();
    const baseSlug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProject: Project = {
      id: `proj-${baseSlug || 'custom'}-${Date.now()}`,
      name: normalizedName,
    };

    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const handleSaveCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  const handleUpdateUser = async (updatedUser: User) => {
    const normalizedUser: User = {
      ...updatedUser,
      permissions: getRolePermissions(updatedUser.role),
    };

    await updateUserInSupabase(normalizedUser);
    setUsers(prev => prev.map(user => user.id === normalizedUser.id ? normalizedUser : user));
    if (normalizedUser.id === currentUser.id) {
      setCurrentUser(normalizedUser);
    }
  };

  const handleAddUser = async (newUser: User) => {
    const normalizedUser: User = {
      ...newUser,
      permissions: getRolePermissions(newUser.role),
    };

    await createUserInSupabase(normalizedUser);
    setUsers(prev => [...prev, normalizedUser]);
  };

  const handleRemoveUser = async (userId: string) => {
    await deleteUserFromSupabase(userId);
    setUsers(prev => prev.filter(user => user.id !== userId));
    setTasks(prev => prev.map(task => ({
      ...task,
      assignedTo: task.assignedTo.filter(assigneeId => assigneeId !== userId),
    })));

    if (selectedUserIdFilter === userId) {
      setSelectedUserIdFilter(null);
    }
  };

  const openTaskModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setModalInitialDate(null);
  };

  const handleOpenTaskWithDate = (date: Date) => {
    setModalInitialDate(date.toISOString().split('T')[0]);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const canAccessUsersPage = currentUser.role === 'Admin' || currentUser.role === 'Moderator';

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView
            tasks={filteredTasks}
            users={users}
            projects={projects}
            currentUser={currentUser}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onOpenTask={openTaskModal}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={filteredTasks}
            projects={projects}
            onOpenTask={openTaskModal}
            onAddTaskWithDate={handleOpenTaskWithDate}
          />
        );
      case 'users':
        if (!canAccessUsersPage) {
          return (
            <HomeView
              tasks={filteredTasks}
              users={users}
              projects={projects}
              currentUser={currentUser}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onOpenTask={openTaskModal}
            />
          );
        }

        return (
          <UsersView
            users={users}
            tasks={tasks}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onAddUser={handleAddUser}
            onRemoveUser={handleRemoveUser}
          />
        );
      case 'settings':
        return <SettingsView currentUser={currentUser} onSave={handleSaveCurrentUser} />;
      default:
        return null;
    }
  };

  const selectedUser = selectedUserIdFilter
    ? users.find(u => u.id === selectedUserIdFilter)
    : null;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Admin Impersonation Banner */}
      {selectedUser && (
        <AlertBanner
          message={`Viewing as ${selectedUser.username}. Click to Reset.`}
          onClick={() => setSelectedUserIdFilter(null)}
        />
      )}

      {/* Main Content Area */}

      <div className="flex min-h-[100dvh]">
        {/* Mobile Drawer */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentUser={currentUser}
          users={users}
          selectedUserIdFilter={selectedUserIdFilter}
          onUserFilterChange={setSelectedUserIdFilter}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with Admin Filter */}
          <Header
            currentView={currentView}
            onViewChange={setCurrentView}
            currentUser={currentUser}
            users={users}
            selectedUserIdFilter={selectedUserIdFilter}
            onUserFilterChange={setSelectedUserIdFilter}
          />

          {/* Main Scrollable Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
            {renderView()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Task Modal */}
      <TaskModal
        task={editingTask}
        projects={projects}
        users={users}
        currentUserId={currentUser.id}
        isOpen={isModalOpen}
        onClose={closeTaskModal}
        onSave={handleSaveTask}
        onCreateProject={handleCreateProject}
        onDelete={handleDeleteTask}
        initialDate={modalInitialDate}
      />


    </div>
  );
}

export default App;
