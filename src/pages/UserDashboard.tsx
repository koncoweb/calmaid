import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { BookText, Heart, ListChecks, MessageSquareText, Shield, Snowflake, Users, Wind } from 'lucide-react';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      id: 'quick-relief',
      name: 'HELP ME!',
      description: 'Panduan Lengkap untuk Serangan Panik',
      icon: <Heart size={36} />,
      color: 'bg-red-500 hover:bg-red-600',
      path: '/quick-relief'
    },
    {
      id: 'journal',
      name: 'JOURNAL',
      description: 'Catat dan Pantau Serangan Panik',
      icon: <BookText size={36} />,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      path: '/journal'
    },
    {
      id: 'breathing',
      name: 'Pernapasan',
      description: 'Teknik Pernapasan 4-7-8',
      icon: <Wind size={36} />,
      color: 'bg-sky-500 hover:bg-sky-600',
      path: '/breathing'
    },
    {
      id: 'grounding',
      name: 'Grounding',
      description: 'Teknik Grounding 5-4-3-2-1',
      icon: <ListChecks size={36} />,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      path: '/grounding'
    },
    {
      id: 'affirmations',
      name: 'Afirmasi',
      description: 'Self-Talk Positif',
      icon: <MessageSquareText size={36} />,
      color: 'bg-purple-500 hover:bg-purple-600',
      path: '/affirmations'
    },
    {
      id: 'cold-therapy',
      name: 'Cold Therapy',
      description: 'Terapi Dingin',
      icon: <Snowflake size={36} />,
      color: 'bg-blue-500 hover:bg-blue-600',
      path: '/cold-therapy'
    }
  ];

  // Admin features - only shown to admin users
  const adminFeatures = [
    {
      id: 'user-management',
      name: 'Kelola User',
      description: 'Manajemen Pengguna Aplikasi',
      icon: <Users size={36} />,
      color: 'bg-gray-700 hover:bg-gray-800',
      path: '/admin'
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Layout title="Pulih Alami">
      <div className="max-w-4xl mx-auto">
        <div className="bg-teal-50 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Selamat Datang, {currentUser?.username}</h2>
          <p className="text-slate-600">
            Pulih Alami membantu Anda mengelola serangan panik dengan teknik-teknik yang terbukti efektif.
          </p>
          {currentUser?.role === 'admin' && (
            <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <Shield size={12} className="mr-1" />
              Administrator
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleNavigate(feature.path)}
              className={`${feature.color} text-white p-4 rounded-xl flex flex-col items-center shadow-md transition-all duration-200 hover:shadow-lg`}
            >
              <div className="bg-white/20 p-3 rounded-full mb-3">
                {feature.icon}
              </div>
              <span className="text-xl font-bold">{feature.name}</span>
              <span className="text-sm opacity-90 mt-1 text-center">{feature.description}</span>
            </button>
          ))}

          {/* Admin features - only shown to admin users */}
          {currentUser?.role === 'admin' && adminFeatures.map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleNavigate(feature.path)}
              className={`${feature.color} text-white p-4 rounded-xl flex flex-col items-center shadow-md transition-all duration-200 hover:shadow-lg`}
            >
              <div className="bg-white/20 p-3 rounded-full mb-3">
                {feature.icon}
              </div>
              <span className="text-xl font-bold">{feature.name}</span>
              <span className="text-sm opacity-90 mt-1 text-center">{feature.description}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Pilih fitur yang Anda butuhkan untuk mengelola serangan panik</p>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
