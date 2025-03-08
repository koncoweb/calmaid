import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, CircleAlert, Loader } from 'lucide-react';

interface LocationState {
  message?: string;
}

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for success message from signup page
    const state = location.state as LocationState;
    if (state?.message) {
      setSuccessMessage(state.message);
      // Clear the location state
      window.history.replaceState({}, document.title);
      
      // Auto-clear success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const success = await login(username, password);
      
      if (success) {
        // Firebase auth state change will redirect user
        const user = await JSON.parse(localStorage.getItem('pulih_alami_current_user') || '{}');
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError('Username atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-teal-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <div className="text-center mb-6">
          <img 
            src="https://mocha-cdn.com/01956201-0fdf-7886-b193-ade47aa0a699/Copy-of-Desain-tanpa-judul.jpg" 
            alt="Pulih Alami Logo" 
            className="mx-auto w-full max-w-xs h-auto object-contain" 
          />
        </div>
        
        {successMessage && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 flex items-center gap-2">
            <Check size={18} />
            <span>{successMessage}</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center gap-2">
            <CircleAlert size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-teal-600 text-white rounded-lg font-medium transition 
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader size={20} className="animate-spin mr-2" />
                Masuk...
              </span>
            ) : 'Masuk'}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-slate-600">
              Belum punya akun?{' '}
              <Link to="/signup" className="text-teal-600 hover:text-teal-800 font-medium">
                Daftar disini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
