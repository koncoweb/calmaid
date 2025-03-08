import { useState } from 'react';
import Layout from '../components/Layout';
import { Check, CircleCheck, Circle } from 'lucide-react';

interface GroundingItem {
  id: number;
  category: string;
  count: number;
  items: string[];
  completed: boolean[];
}

const GroundingTechnique = () => {
  const [groundingItems, setGroundingItems] = useState<GroundingItem[]>([
    { 
      id: 1, 
      category: 'Apa yang Anda LIHAT?', 
      count: 5,
      items: Array(5).fill(''),
      completed: Array(5).fill(false)
    },
    { 
      id: 2, 
      category: 'Apa yang Anda SENTUH?', 
      count: 4,
      items: Array(4).fill(''),
      completed: Array(4).fill(false)
    },
    { 
      id: 3, 
      category: 'Apa yang Anda DENGAR?', 
      count: 3,
      items: Array(3).fill(''),
      completed: Array(3).fill(false)
    },
    { 
      id: 4, 
      category: 'Apa yang Anda CIUM?', 
      count: 2,
      items: Array(2).fill(''),
      completed: Array(2).fill(false)
    },
    { 
      id: 5, 
      category: 'Apa yang Anda RASAKAN?', 
      count: 1,
      items: Array(1).fill(''),
      completed: Array(1).fill(false)
    }
  ]);

  const [activeCategory, setActiveCategory] = useState(1);

  const handleInputChange = (categoryId: number, index: number, value: string) => {
    setGroundingItems(items => 
      items.map(item => 
        item.id === categoryId 
          ? {
              ...item,
              items: item.items.map((val, i) => i === index ? value : val)
            }
          : item
      )
    );
  };

  const handleToggleComplete = (categoryId: number, index: number) => {
    setGroundingItems(items => 
      items.map(item => 
        item.id === categoryId 
          ? {
              ...item,
              completed: item.completed.map((val, i) => i === index ? !val : val)
            }
          : item
      )
    );
  };

  const isAllCompleted = groundingItems.every(category => 
    category.completed.every(item => item === true)
  );

  const getTotalCompleted = () => {
    return groundingItems.reduce((total, category) => {
      return total + category.completed.filter(c => c === true).length;
    }, 0);
  };

  const getTotalItems = () => {
    return groundingItems.reduce((total, category) => {
      return total + category.count;
    }, 0);
  };

  const resetExercise = () => {
    setGroundingItems(items => 
      items.map(item => ({
        ...item,
        items: Array(item.count).fill(''),
        completed: Array(item.count).fill(false)
      }))
    );
    setActiveCategory(1);
  };

  return (
    <Layout title="Teknik Grounding" showBack>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Teknik Grounding 5-4-3-2-1</h2>
          <p className="text-slate-600">
            Fokus pada lingkungan sekitar untuk menenangkan pikiran Anda
          </p>
        </div>

        <div className="bg-emerald-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-medium">Progress</span>
            <span className="text-sm">{getTotalCompleted()}/{getTotalItems()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(getTotalCompleted() / getTotalItems()) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-6">
          {groundingItems.map((category) => (
            <div 
              key={category.id} 
              className={`border ${activeCategory === category.id ? 'border-emerald-500' : 'border-gray-200'} rounded-lg p-4`}
            >
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setActiveCategory(category.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    category.completed.every(c => c === true) 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {category.count}
                  </div>
                  <h3 className="font-medium">{category.category}</h3>
                </div>
                {category.completed.every(c => c === true) && (
                  <CircleCheck size={20} className="text-emerald-500" />
                )}
              </div>

              {activeCategory === category.id && (
                <div className="mt-4 space-y-3">
                  {Array.from({ length: category.count }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleToggleComplete(category.id, index)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                          category.completed[index] 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-gray-300'
                        }`}
                      >
                        {category.completed[index] && <Check size={14} />}
                      </button>
                      <input
                        type="text"
                        value={category.items[index]}
                        onChange={(e) => handleInputChange(category.id, index, e.target.value)}
                        placeholder={`Masukkan ${index + 1}...`}
                        className="flex-1 p-2 border border-gray-200 rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {isAllCompleted && (
          <div className="mt-6 text-center">
            <div className="bg-emerald-100 text-emerald-700 p-4 rounded-lg mb-4">
              <p className="font-medium">Selamat! Anda telah menyelesaikan latihan grounding.</p>
            </div>
            <button
              onClick={resetExercise}
              className="bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Mulai Ulang
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GroundingTechnique;
