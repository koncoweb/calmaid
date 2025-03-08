import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Calendar, Check, CircleAlert, Loader, Save, X } from 'lucide-react';
import { JournalEntry as JournalEntryType } from '../types';
import { addJournalEntry, getJournalEntryById, updateJournalEntry } from '../utils/journal';

const JournalEntry = () => {
  const [formData, setFormData] = useState<Omit<JournalEntryType, 'id' | 'userId'>>({
    timestamp: new Date().toISOString(),
    triggers: '',
    symptoms: '',
    strategies: '',
    notes: '',
    condition: 0 // Default to "Masih Cemas"
  });
  const [loading, setLoading] = useState(false);
  const [entryLoading, setEntryLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      loadEntryData(id);
    }
  }, [id]);

  const loadEntryData = async (entryId: string) => {
    setEntryLoading(true);
    setIsEditing(true);
    setError('');
    
    try {
      const entry = await getJournalEntryById(entryId);
      if (entry) {
        console.log("Loaded entry:", entry);
        setFormData({
          timestamp: entry.timestamp,
          triggers: entry.triggers,
          symptoms: entry.symptoms,
          strategies: entry.strategies,
          notes: entry.notes,
          condition: entry.condition
        });
      } else {
        setError('Catatan tidak ditemukan');
        setTimeout(() => navigate('/journal'), 2000);
      }
    } catch (err: any) {
      console.error("Error loading entry:", err);
      setError(err.message || 'Gagal memuat data catatan');
    } finally {
      setEntryLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert local datetime-local value to ISO string
    const localDateTime = e.target.value; // Format: YYYY-MM-DDTHH:MM
    const date = new Date(localDateTime);
    setFormData(prev => ({ ...prev, timestamp: date.toISOString() }));
  };

  const handleConditionChange = (value: number) => {
    setFormData(prev => ({ ...prev, condition: value }));
  };

  const formatDateTimeForInput = (isoString: string) => {
    const date = new Date(isoString);
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (isEditing && id) {
        const updated = await updateJournalEntry(id, formData);
        if (updated) {
          setSuccess('Catatan berhasil diperbarui');
          setTimeout(() => navigate('/journal'), 1500);
        } else {
          setError('Gagal memperbarui catatan');
        }
      } else {
        const added = await addJournalEntry(formData);
        if (added) {
          setSuccess('Catatan berhasil ditambahkan');
          setTimeout(() => navigate('/journal'), 1500);
        } else {
          setError('Gagal menambahkan catatan');
        }
      }
    } catch (err: any) {
      console.error("Error saving entry:", err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan catatan');
    } finally {
      setLoading(false);
    }
  };

  if (entryLoading) {
    return (
      <Layout title={isEditing ? "Edit Catatan" : "Catatan Baru"} showBack backTo="/journal">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
            <p>Memuat data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditing ? "Edit Catatan" : "Catatan Baru"} showBack backTo="/journal">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {isEditing ? "Edit Catatan Serangan Panik" : "Catat Serangan Panik Baru"}
          </h2>
          <p className="text-slate-600">
            Melacak serangan panik membantu Anda mengenali pola dan kemajuan
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 flex items-center">
            <CircleAlert size={20} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-center">
            <Check size={20} className="mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tanggal & Waktu Kejadian
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar size={18} className="text-slate-400" />
              </div>
              <input
                type="datetime-local"
                value={formatDateTimeForInput(formData.timestamp)}
                onChange={handleDateTimeChange}
                className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pemicu (Trigger) yang Dirasakan
            </label>
            <input
              type="text"
              name="triggers"
              value={formData.triggers}
              onChange={handleInputChange}
              placeholder="Apa yang memicu serangan panik? (mis. keramaian, pikiran tertentu)"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Gejala yang Dialami
            </label>
            <input
              type="text"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              placeholder="Gejala yang muncul (mis. jantung berdebar, sesak napas)"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Strategi yang Digunakan
            </label>
            <input
              type="text"
              name="strategies"
              value={formData.strategies}
              onChange={handleInputChange}
              placeholder="Apa yang membantu Anda? (mis. pernapasan, grounding)"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Catatan Tambahan
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Tambahan informasi atau refleksi"
              rows={4}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bagaimana kondisi Anda saat ini?
            </label>
            <div className="flex flex-wrap gap-4">
              <div 
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border ${formData.condition === 0 ? 'bg-red-50 border-red-300' : 'border-gray-200 hover:bg-gray-50'}`}
                onClick={() => handleConditionChange(0)}
              >
                <div className={`w-4 h-4 rounded-full border ${formData.condition === 0 ? 'border-4 border-red-500' : 'border border-gray-300'}`}></div>
                <span className={formData.condition === 0 ? 'font-medium' : ''}>Masih Cemas</span>
              </div>
              
              <div 
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border ${formData.condition === 1 ? 'bg-yellow-50 border-yellow-300' : 'border-gray-200 hover:bg-gray-50'}`}
                onClick={() => handleConditionChange(1)}
              >
                <div className={`w-4 h-4 rounded-full border ${formData.condition === 1 ? 'border-4 border-yellow-500' : 'border border-gray-300'}`}></div>
                <span className={formData.condition === 1 ? 'font-medium' : ''}>Lebih Baik</span>
              </div>
              
              <div 
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border ${formData.condition === 2 ? 'bg-green-50 border-green-300' : 'border-gray-200 hover:bg-gray-50'}`}
                onClick={() => handleConditionChange(2)}
              >
                <div className={`w-4 h-4 rounded-full border ${formData.condition === 2 ? 'border-4 border-green-500' : 'border border-gray-300'}`}></div>
                <span className={formData.condition === 2 ? 'font-medium' : ''}>Tenang</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/journal')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center"
              disabled={loading}
            >
              <X size={18} className="mr-1" />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader size={18} className="mr-1 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={18} className="mr-1" />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default JournalEntry;
