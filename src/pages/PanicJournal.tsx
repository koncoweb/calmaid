import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { CircleAlert, BookOpen, ChartBar, CirclePlus, ExternalLink, FileText, Loader, Pencil, RefreshCw, Trash2 } from 'lucide-react';
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
    <Layout title="Jurnal Panik">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Catatan Serangan Panik</h1>
          <div className="flex gap-4">
            <button
              onClick={toggleView}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
            >
              {showDashboard ? <FileText size={16} /> : <ChartBar size={16} />}
              <span>{showDashboard ? 'Lihat Catatan' : 'Lihat Statistik'}</span>
            </button>
            <button
              onClick={() => navigate('/journal/new')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <CirclePlus size={16} />
              <span>Tambah Catatan</span>
            </button>
          </div>
        </div>

        {loading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : entries.length === 0 ? (
          renderEmptyState()
        ) : showDashboard ? (
          <JournalDashboard entries={entries} selectedMonth={selectedMonth} />
        ) : (
          <div>
            <div className="mb-6">
              <select
                value={selectedMonth}
                onChange={(e) => filterEntriesByMonth(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {getAvailableMonths().map(month => (
                  <option key={month} value={month}>
                    {formatMonthLabel(month)}
                  </option>
                ))}
              </select>
            </div>
            {renderEntries()}
          </div>
        )}

        {indexError && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800 mb-2">
              Untuk mengurutkan entri jurnal perlu membuat indeks di Firebase Console.
            </p>
            <a
              href={indexError}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-yellow-800 hover:text-yellow-900 underline"
            >
              <span>Buat Indeks</span>
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PanicJournal;
