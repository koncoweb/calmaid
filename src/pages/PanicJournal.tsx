import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { CircleAlert, BookOpen, Calendar, ChartBar, CirclePlus, ExternalLink, FileText, Loader, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { JournalEntry } from '../types';
import { getJournalEntries, deleteJournalEntry } from '../utils/journal';
import JournalDashboard from '../components/JournalDashboard';

const PanicJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // Current month in YYYY-MM format
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [indexError, setIndexError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    setIndexError(null);
    try {
      const journalEntries = await getJournalEntries();
      console.log("Fetched entries:", journalEntries);
      setEntries(journalEntries);
    } catch (err: any) {
      console.error("Error loading entries:", err);
      
      // Check if it's a Firestore index error
      if (err?.code === 'failed-precondition' && err.message.includes('index')) {
        // Extract the URL from the error message
        const urlMatch = err.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
        if (urlMatch) {
          setIndexError(urlMatch[0]);
        } else {
          setIndexError("https://console.firebase.google.com");
        }
        setError("Untuk mengurutkan entri jurnal perlu membuat indeks di Firebase");
      } else {
        setError("Gagal memuat data jurnal");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      setDeleteLoading(id);
      try {
        const success = await deleteJournalEntry(id);
        if (success) {
          // Remove entry from state to avoid having to reload all entries
          setEntries(currentEntries => currentEntries.filter(entry => entry.id !== id));
        } else {
          setError("Gagal menghapus entri");
        }
      } catch (err) {
        console.error("Error deleting entry:", err);
        setError("Terjadi kesalahan saat menghapus entri");
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleView = () => {
    setShowDashboard(!showDashboard);
  };

  const filterEntriesByMonth = (monthStr: string) => {
    setSelectedMonth(monthStr);
  };

  const getAvailableMonths = () => {
    const months = new Set<string>();
    entries.forEach(entry => {
      const monthStr = entry.timestamp.slice(0, 7); // YYYY-MM
      months.add(monthStr);
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a)); // Newest first
  };

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const getConditionBadge = (condition: number) => {
    switch (condition) {
      case 0:
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Masih Cemas</span>;
      case 1:
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Lebih Baik</span>;
      case 2:
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Tenang</span>;
      default:
        return null;
    }
  };

  const renderLoadingState = () => (
    <div className="flex flex-col justify-center items-center h-64">
      <Loader size={40} className="animate-spin text-teal-600 mb-4" />
      <p className="text-slate-600">Memuat data catatan...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 text-red-700 p-6 rounded-lg flex flex-col items-center">
      <CircleAlert size={40} className="mb-3" />
      <p className="mb-3 font-medium">{error}</p>
      <button 
        onClick={loadEntries}
        className="flex items-center gap-2 mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        <RefreshCw size={16} />
        <span>Coba Lagi</span>
      </button>
    </div>
  );

  const renderEmptyState = () => (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <BookOpen size={48} className="mx-auto mb-4 text-indigo-300" />
      <h3 className="text-lg font-medium mb-2">Belum Ada Catatan</h3>
      <p className="text-slate-600 mb-6">
        Mulai catat serangan panik Anda untuk memantau pola dan kemajuan.
      </p>
      <button
        onClick={() => navigate('/journal/new')}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
        Buat Catatan Pertama
      </button>
    </div>
  );

  const renderEntries = () => (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold">{formatDate(entry.timestamp)}</h3>
              <div className="mt-1">
                {getConditionBadge(entry.condition)}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/journal/edit/${entry.id}`)} 
                className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
                disabled={deleteLoading === entry.id}
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => handleDelete(entry.id)} 
                className="p-1 text-red-600 hover:bg-red-100 rounded flex items-center justify-center"
                disabled={deleteLoading === entry.id}
              >
                {deleteLoading === entry.id ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="text-sm font-medium text-indigo-600 mb-1">Pemicu</h4>
              <p className="text-sm text-slate-700">{entry.triggers || "Tidak dicatat"}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-indigo-600 mb-1">Gejala</h4>
              <p className="text-sm text-slate-700">{entry.symptoms || "Tidak dicatat"}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-indigo-600 mb-1">Strategi yang Digunakan</h4>
            <p className="text-sm text-slate-700">{entry.strategies || "Tidak dicatat"}</p>
          </div>
          
          {entry.notes && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-indigo-600 mb-1">Catatan Tambahan</h4>
              <p className="text-sm text-slate-700">{entry.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Layout title="Panic Journaling" showBack backTo="/dashboard">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Catatan Serangan Panik</h2>
            <p className="text-slate-600">Lacak dan analisis serangan panik Anda</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleView}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                !showDashboard 
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-indigo-600 text-white'
              }`}
              disabled={loading}
            >
              {showDashboard ? <FileText size={18} /> : <ChartBar size={18} />}
              <span>{showDashboard ? 'Lihat Entri' : 'Dashboard'}</span>
            </button>
            <button
              onClick={() => navigate('/journal/new')}
              className="flex items-center gap-1 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700"
              disabled={loading}
            >
              <CirclePlus size={18} />
              <span>Tambah Catatan</span>
            </button>
          </div>
        </div>

        {error && !indexError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
            <CircleAlert size={18} className="mr-2" />
            <span>{error}</span>
            <button 
              onClick={() => setError("")} 
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {indexError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center mb-2">
              <CircleAlert size={18} className="mr-2 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <p className="text-sm ml-6 mb-2">
              Anda perlu membuat indeks di Firebase Console untuk mengurutkan entri jurnal. Anda masih bisa menggunakan
              aplikasi, tetapi pengurutan optimal memerlukan indeks yang dibuat.
            </p>
            <div className="ml-6 text-sm">
              <a 
                href={indexError} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-amber-900 hover:text-amber-700 font-medium"
              >
                <span>Buka Firebase Console untuk membuat indeks</span>
                <ExternalLink size={14} className="ml-1" />
              </a>
            </div>
          </div>
        )}

        {showDashboard ? (
          <div>
            {loading ? (
              renderLoadingState()
            ) : (
              <>
                <JournalDashboard entries={entries} selectedMonth={selectedMonth} />
                
                <div className="mt-6 bg-white rounded-lg shadow p-4">
                  <div className="flex items-center mb-4">
                    <Calendar size={18} className="text-indigo-600 mr-2" />
                    <h3 className="font-medium">Filter Berdasarkan Bulan</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableMonths().length > 0 ? (
                      getAvailableMonths().map(month => (
                        <button
                          key={month}
                          onClick={() => filterEntriesByMonth(month)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            selectedMonth === month 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          }`}
                        >
                          {formatMonthLabel(month)}
                        </button>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">Tidak ada data untuk difilter</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {loading ? (
              renderLoadingState()
            ) : entries.length === 0 ? (
              renderEmptyState()
            ) : (
              renderEntries()
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default PanicJournal;
