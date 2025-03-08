import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import { getUsers, addUser, updateUser, deleteUser } from '../utils/auth';
import { Squircle, Key, Loader, Pencil, Shield, Trash, UserPlus } from 'lucide-react';
import { Check } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Clear success message after 3 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersList = await getUsers();
      setUsers(usersList);
    } catch (error) {
      console.error("Error loading users:", error);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (isPasswordReset = false) => {
    setError('');
    
    if (!isPasswordReset && !username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if ((showAddModal || isPasswordReset) && !password) {
      setError('Password is required');
      return false;
    }
    
    if ((showAddModal || isPasswordReset) && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (showAddModal && password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await addUser({
        username,
        password,
        email: email || undefined,
        role: 'user'
      });
      
      if (result) {
        setShowAddModal(false);
        resetForm();
        await loadUsers();
        setSuccessMessage('User added successfully');
      } else {
        setError("Failed to add user");
      }
    } catch (err: any) {
      setError(err.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!currentUser || !validateForm(false)) return;
    
    setLoading(true);
    try {
      const result = await updateUser(currentUser.id, { username });
      
      if (result) {
        setShowEditModal(false);
        resetForm();
        await loadUsers();
        setSuccessMessage('User updated successfully');
      } else {
        setError("Failed to update user");
      }
    } catch (err: any) {
      setError(err.message || 'Error updating user');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!currentUser || !validateForm(true)) return;
    
    setLoading(true);
    try {
      const result = await updateUser(currentUser.id, { password });
      
      if (result) {
        setShowResetModal(false);
        resetForm();
        setSuccessMessage('Password reset successfully');
      } else {
        setError("Failed to reset password");
      }
    } catch (err: any) {
      setError(err.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete user ${user.username}? This action cannot be undone.`)) {
      setLoading(true);
      try {
        const success = await deleteUser(user.id);
        if (success) {
          await loadUsers();
          setSuccessMessage('User deleted successfully');
        } else {
          setError("Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("An error occurred while deleting user");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setError('');
    setCurrentUser(null);
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">User Management</h2>
          <button 
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            disabled={loading}
          >
            <UserPlus size={18} />
            <span>Add New User</span>
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-md mb-4 flex items-center">
            <Check size={18} className="mr-2" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center">
            <Squircle size={18} className="mr-2" />
            {error}
          </div>
        )}

        {loading && !users.length ? (
          <div className="text-center p-8">
            <Loader size={40} className="animate-spin mx-auto mb-4 text-teal-600" />
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            {!users.length ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p>No users found. Create your first user by clicking "Add New User".</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className={user.role === 'admin' ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center w-fit ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'admin' && <Shield size={12} className="mr-1" />}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setCurrentUser(user);
                                setUsername(user.username);
                                setShowEditModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                              title="Edit Username"
                              disabled={loading}
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentUser(user);
                                setPassword('');
                                setConfirmPassword('');
                                setShowResetModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded"
                              title="Reset Password"
                              disabled={loading}
                            >
                              <Key size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title="Delete User"
                              disabled={user.role === 'admin' || loading}
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New User</h3>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center">
                  <Squircle size={18} className="mr-2" />
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username*
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={loading}
                    placeholder="Enter username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={loading}
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password*
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={loading}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password*
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={loading}
                    placeholder="Retype password"
                  />
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center hover:bg-teal-700 disabled:opacity-70"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        <span>Creating...</span>
                      </>
                    ) : <span>Create User</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit Username</h3>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center">
                  <Squircle size={18} className="mr-2" />
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={loading}
                  />
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditUser}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center hover:bg-teal-700 disabled:opacity-70"
                    disabled={!username.trim() || loading}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        <span>Saving...</span>
                      </>
                    ) : <span>Save Changes</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Reset Password for {currentUser?.username}</h3>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center">
                  <Squircle size={18} className="mr-2" />
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={loading}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={loading}
                    placeholder="Retype password"
                  />
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setShowResetModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetPassword}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center hover:bg-teal-700 disabled:opacity-70"
                    disabled={!password || loading}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        <span>Resetting...</span>
                      </>
                    ) : <span>Reset Password</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
