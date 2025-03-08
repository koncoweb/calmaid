import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from '../utils/auth';
import { ArrowLeft, CircleAlert, Loader } from 'lucide-react';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const validateForm = () => {
    setError('');
    
    if (!username.trim()) {
      setError('Username diperlukan');
      return false;
    }
    
    if (!email.trim()) {
      setError('Email diperlukan');
      return false;
    }
    
    if (!password) {
      setError('Password diperlukan');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password harus minimal 6 karakter');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const success = await signupUser(username, email, password);
      
      if (success) {
        navigate('/login', { state: { message: 'Pendaftaran berhasil! Silakan login.' } });
      } else {
        setError('Gagal mendaftar. Silakan coba lagi.');
      }
    } catch (err: any) {
      if (err.message.includes('email-already-in-use')) {
        setError('Email sudah digunakan.');
      } else if (err.message.includes('invalid-email')) {
        setError('Format email tidak valid.');
      } else if (err.message.includes('username already exists')) {
        setError('Username sudah digunakan.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat mendaftar.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-teal-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center mb-6">
          <Link to="/login" className="text-teal-600 hover:text-teal-800 mr-4">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-center flex-1 mr-4">Daftar Akun Baru</h1>
        </div>
        
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
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <p className="text-xs text-slate-500 mt-1">Minimal 6 karakter</p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                Mendaftar...
              </span>
            ) : 'Daftar'}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-slate-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-800 font-medium">
                Login disini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
