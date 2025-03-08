import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Squircle, Plus, Save, Trash } from 'lucide-react';

const defaultAffirmations = [
  "Saya aman sekarang, perasaan ini hanya sementara",
  "Saya bisa melewati ini, saya sudah pernah melakukannya",
  "Napas saya menjadi lebih tenang dengan setiap tarikan",
  "Ini hanya perasaan, bukan kenyataan",
  "Tubuh saya bisa rileks, pikiran saya bisa tenang"
];

const PositiveAffirmations = () => {
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    // Load saved affirmations from localStorage or use defaults
    const savedAffirmations = localStorage.getItem('pulih_alami_affirmations');
    
    if (savedAffirmations) {
      setAffirmations(JSON.parse(savedAffirmations));
    } else {
      setAffirmations(defaultAffirmations);
      localStorage.setItem('pulih_alami_affirmations', JSON.stringify(defaultAffirmations));
    }
  }, []);

  const saveAffirmations = (newAffirmations: string[]) => {
    setAffirmations(newAffirmations);
    localStorage.setItem('pulih_alami_affirmations', JSON.stringify(newAffirmations));
  };

  const handleAddAffirmation = () => {
    if (currentAffirmation.trim()) {
      const newAffirmations = [...affirmations, currentAffirmation.trim()];
      saveAffirmations(newAffirmations);
      setCurrentAffirmation('');
      setIsAddingNew(false);
    }
  };

  const handleUpdateAffirmation = () => {
    if (editIndex !== null && currentAffirmation.trim()) {
      const newAffirmations = [...affirmations];
      newAffirmations[editIndex] = currentAffirmation.trim();
      saveAffirmations(newAffirmations);
      setCurrentAffirmation('');
      setEditIndex(null);
    }
  };

  const handleDeleteAffirmation = (index: number) => {
    const newAffirmations = affirmations.filter((_, i) => i !== index);
    saveAffirmations(newAffirmations);
    
    if (editIndex === index) {
      setEditIndex(null);
      setCurrentAffirmation('');
    }
  };

  const startEdit = (index: number) => {
    setCurrentAffirmation(affirmations[index]);
    setEditIndex(index);
    setIsAddingNew(false);
  };

  const cancelEdit = () => {
    setCurrentAffirmation('');
    setEditIndex(null);
    setIsAddingNew(false);
  };

  return (
    <Layout title="Self-Talk Positif" showBack>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Afirmasi Positif</h2>
          <p className="text-slate-600">
            Gunakan kalimat-kalimat ini untuk menenangkan diri saat panik
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-2">Cara Penggunaan:</h3>
          <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
            <li>Pilih afirmasi yang paling sesuai dengan perasaan Anda</li>
            <li>Ulangi afirmasi tersebut dengan suara pelan</li>
            <li>Fokus pada setiap kata dan maknanya</li>
            <li>Tambahkan afirmasi pribadi yang bermakna untuk Anda</li>
          </ol>
        </div>

        {/* Display affirmations */}
        <div className="space-y-3 mb-6">
          {affirmations.map((affirmation, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg flex justify-between items-center ${
                editIndex === index ? 'bg-purple-100 border border-purple-300' : 'bg-white border border-gray-200'
              }`}
            >
              <p className="flex-1">{affirmation}</p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => startEdit(index)}
                  className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                >
                  <Squircle size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteAffirmation(index)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit form */}
        {(isAddingNew || editIndex !== null) ? (
          <div className="bg-white border border-purple-300 p-4 rounded-lg mb-4">
            <textarea
              value={currentAffirmation}
              onChange={(e) => setCurrentAffirmation(e.target.value)}
              placeholder="Tulis afirmasi..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-3"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelEdit}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={editIndex !== null ? handleUpdateAffirmation : handleAddAffirmation}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg flex items-center"
                disabled={!currentAffirmation.trim()}
              >
                <Save size={18} className="mr-1" />
                {editIndex !== null ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditIndex(null);
              setCurrentAffirmation('');
            }}
            className="w-full py-3 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center hover:bg-purple-200 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Tambah Afirmasi Baru
          </button>
        )}
      </div>
    </Layout>
  );
};

export default PositiveAffirmations;
