import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeft, ArrowRight, Check, ListChecks, MessageSquareText, Snowflake, Wind } from 'lucide-react';

const techniques = [
  {
    id: 'intro',
    name: 'Serangan Panik',
    description: 'Kita akan melalui 4 teknik untuk menenangkan diri Anda secara bertahap',
    content: () => (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold text-red-800 mb-4">Anda Sedang Baik-baik Saja</h3>
        <p className="text-red-700 mb-4">
          Tenang, kita akan melalui ini bersama. Ikuti panduan langkah-demi-langkah untuk membantu menenangkan diri Anda.
        </p>
        <p className="text-sm text-red-600">Pastikan Anda berada di tempat yang aman dan nyaman.</p>
      </div>
    )
  },
  {
    id: 'breathing',
    name: 'Pernapasan 4-7-8',
    icon: <Wind size={24} />,
    description: 'Teknik pernapasan untuk menenangkan sistem saraf',
    color: 'bg-sky-500',
    content: () => <BreathingExercise />
  },
  {
    id: 'grounding',
    name: 'Grounding 5-4-3-2-1',
    icon: <ListChecks size={24} />,
    description: 'Teknik menjangkarkan diri ke kondisi saat ini',
    color: 'bg-emerald-500',
    content: () => <GroundingExercise />
  },
  {
    id: 'self-talk',
    name: 'Self-Talk Positif',
    icon: <MessageSquareText size={24} />,
    description: 'Afirmasi positif untuk menenangkan pikiran',
    color: 'bg-purple-500',
    content: () => <AffirmationExercise />
  },
  {
    id: 'cold-therapy',
    name: 'Cold Therapy',
    icon: <Snowflake size={24} />,
    description: 'Terapi dingin untuk reset sistem saraf',
    color: 'bg-blue-500',
    content: () => <ColdTherapyExercise />
  },
  {
    id: 'complete',
    name: 'Selesai',
    description: 'Anda telah menyelesaikan semua teknik',
    content: () => (
      <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">Latihan Selesai</h3>
        <p className="text-green-700 mb-4">
          Anda telah menyelesaikan semua teknik relaksasi. Bagaimana perasaan Anda sekarang?
        </p>
        <p className="text-sm text-green-600">
          Latihan ini dapat diulang kapanpun Anda membutuhkannya.
        </p>
      </div>
    )
  }
];

const BreathingExercise = () => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'ready'>('ready');
  const [counter, setCounter] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = window.setInterval(() => {
        setCounter(prevCounter => {
          // Decrement counter
          const newCounter = prevCounter - 1;
          
          // If counter reaches 0, move to next phase
          if (newCounter <= 0) {
            switch (phase) {
              case 'inhale':
                setPhase('hold');
                return 7; // Hold for 7 seconds
              case 'hold':
                setPhase('exhale');
                return 8; // Exhale for 8 seconds
              case 'exhale':
                setPhase('inhale');
                setCompletedCycles(prev => prev + 1);
                return 4; // Inhale for 4 seconds
              default:
                return 0;
            }
          }
          return newCounter;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, phase]);

  const startBreathing = () => {
    setPhase('inhale');
    setCounter(4); // Start with inhale for 4 seconds
    setIsActive(true);
    setCompletedCycles(0);
  };

  const stopBreathing = () => {
    setIsActive(false);
    setPhase('ready');
  };

  const getInstructions = () => {
    switch (phase) {
      case 'inhale':
        return 'Tarik napas melalui hidung';
      case 'hold':
        return 'Tahan napas';
      case 'exhale':
        return 'Hembuskan napas melalui mulut';
      default:
        return 'Tekan tombol mulai untuk memulai';
    }
  };

  const getCircleStyle = () => {
    if (phase === 'ready') {
      return 'w-36 h-36 bg-sky-100';
    } else if (phase === 'inhale') {
      return 'w-48 h-48 bg-blue-500';
    } else if (phase === 'hold') {
      return 'w-48 h-48 bg-purple-500';
    } else {
      return 'w-36 h-36 bg-teal-500';
    }
  };

  return (
    <div className="flex flex-col items-center p-2">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold mb-2">Teknik Pernapasan 4-7-8</h3>
        <p className="text-sm text-slate-600">
          Tarik napas (4 detik), tahan (7 detik), hembuskan (8 detik)
        </p>
      </div>

      <div className="flex flex-col items-center justify-center mb-4">
        <div 
          className={`${getCircleStyle()} rounded-full flex items-center justify-center text-white font-bold text-xl transition-all duration-1000 mb-3`}
        >
          {phase !== 'ready' && counter}
        </div>
        
        <h3 className="text-lg font-medium mb-1">{getInstructions()}</h3>
        
        {isActive && (
          <p className="text-sm text-slate-600">
            Siklus selesai: {completedCycles}
          </p>
        )}
      </div>

      <div className="space-x-4">
        {!isActive ? (
          <button
            onClick={startBreathing}
            className="bg-sky-600 text-white py-2 px-5 rounded-lg font-medium hover:bg-sky-700 transition-colors"
          >
            Mulai
          </button>
        ) : (
          <button
            onClick={stopBreathing}
            className="bg-red-600 text-white py-2 px-5 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Berhenti
          </button>
        )}
      </div>
    </div>
  );
};

const GroundingExercise = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState<string[]>(Array(5).fill(''));
  const [completed, setCompleted] = useState<boolean[]>(Array(5).fill(false));

  const steps = [
    { count: 5, text: 'Sebutkan 5 hal yang Anda LIHAT' },
    { count: 4, text: 'Sebutkan 4 hal yang Anda SENTUH' },
    { count: 3, text: 'Sebutkan 3 hal yang Anda DENGAR' },
    { count: 2, text: 'Sebutkan 2 hal yang Anda CIUM' },
    { count: 1, text: 'Sebutkan 1 hal yang Anda RASAKAN' }
  ];

  const handleInputChange = (value: string) => {
    const newInputs = [...inputs];
    newInputs[currentStep] = value;
    setInputs(newInputs);
  };

  const markCompleted = () => {
    if (inputs[currentStep].trim().length > 0) {
      const newCompleted = [...completed];
      newCompleted[currentStep] = true;
      setCompleted(newCompleted);
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const getCompletedCount = () => {
    return completed.filter(c => c).length;
  };

  return (
    <div className="flex flex-col p-2">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold mb-2">Teknik Grounding 5-4-3-2-1</h3>
        <p className="text-sm text-slate-600">
          Fokus pada lingkungan sekitar untuk menenangkan pikiran Anda
        </p>
      </div>

      <div className="bg-emerald-50 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-xs">{getCompletedCount()}/5</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(getCompletedCount() / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white border border-emerald-200 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold mr-2">
            {steps[currentStep].count}
          </div>
          <h3 className="font-medium">{steps[currentStep].text}</h3>
        </div>
        
        <div className="flex space-x-2 mb-1">
          <input
            type="text"
            value={inputs[currentStep]}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Masukkan jawaban Anda..."
            className="flex-1 p-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={markCompleted}
            disabled={!inputs[currentStep].trim()}
            className={`px-3 py-2 rounded-lg text-white ${
              inputs[currentStep].trim() 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-gray-300 cursor-not-allowed'
            } transition-colors`}
          >
            <Check size={20} />
          </button>
        </div>
      </div>

      {getCompletedCount() === 5 && (
        <div className="bg-emerald-100 text-emerald-800 p-3 rounded-lg text-center">
          <p className="font-medium">Bagus! Anda telah menyelesaikan latihan grounding.</p>
        </div>
      )}
    </div>
  );
};

const AffirmationExercise = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [affirmations, setAffirmations] = useState<string[]>([
    "Saya aman sekarang, perasaan ini hanya sementara",
    "Saya bisa melewati ini, saya sudah pernah melakukannya",
    "Napas saya menjadi lebih tenang dengan setiap tarikan",
    "Ini hanya perasaan, bukan kenyataan",
    "Tubuh saya bisa rileks, pikiran saya bisa tenang"
  ]);

  useEffect(() => {
    // Load saved affirmations from localStorage
    const savedAffirmations = localStorage.getItem('pulih_alami_affirmations');
    if (savedAffirmations) {
      setAffirmations(JSON.parse(savedAffirmations));
    }
  }, []);

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % affirmations.length);
  };

  const prevAffirmation = () => {
    setCurrentIndex((prev) => (prev - 1 + affirmations.length) % affirmations.length);
  };

  return (
    <div className="flex flex-col p-2">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold mb-2">Self-Talk Positif</h3>
        <p className="text-sm text-slate-600">
          Ulangi kalimat-kalimat berikut untuk menenangkan pikiran
        </p>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-slate-600 mb-1">Afirmasi #{currentIndex + 1} dari {affirmations.length}</p>
        <div className="bg-white border border-purple-200 rounded-lg p-4 min-h-24 flex items-center justify-center">
          <p className="text-center text-lg font-medium text-purple-800">
            "{affirmations[currentIndex]}"
          </p>
        </div>
      </div>

      <div className="flex justify-center space-x-6">
        <button
          onClick={prevAffirmation}
          className="p-2 bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={nextAffirmation}
          className="p-2 bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200"
        >
          <ArrowRight size={24} />
        </button>
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-slate-600">
          Ulangi dengan suara pelan dan fokus pada maknanya
        </p>
      </div>
    </div>
  );
};

const ColdTherapyExercise = () => {
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30); // Default 30 seconds
  
  useEffect(() => {
    let interval: number | undefined;

    if (timerActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setTimerActive(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startTimer = () => {
    setTimerActive(true);
  };

  const pauseTimer = () => {
    setTimerActive(false);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimeRemaining(30);
  };

  return (
    <div className="flex flex-col p-2">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold mb-2">Cold Therapy</h3>
        <p className="text-sm text-slate-600">
          Gunakan sensasi dingin untuk reset sistem saraf
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
        <h4 className="font-medium text-blue-800 mb-2">Langkah-langkah:</h4>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1 mb-1">
          <li>Siapkan air dingin atau es yang dibungkus kain</li>
          <li>Tempatkan pada wajah, leher, atau pergelangan tangan</li>
          <li>Rasakan sensasi dingin selama 30 detik</li>
          <li>Bernapaslah perlahan dan dalam</li>
        </ol>
      </div>

      <div className="flex flex-col items-center mb-4">
        <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-blue-500 flex items-center justify-center mb-3">
          <div className="text-2xl font-bold text-blue-800">
            {formatTime(timeRemaining)}
          </div>
        </div>

        <div className="flex space-x-3">
          {!timerActive ? (
            <button
              onClick={startTimer}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Mulai
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Jeda
            </button>
          )}
          <button
            onClick={resetTimer}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {timeRemaining === 0 && (
        <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center">
          <p className="font-medium">Terapi dingin selesai! Bagaimana perasaan Anda?</p>
        </div>
      )}
    </div>
  );
};

const QuickRelief = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const goToNext = () => {
    if (currentStep < techniques.length - 1) {
      // Mark current step as completed if not already
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      // Go to next step
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <Layout title="Bantuan Cepat" showBack backTo="/dashboard">
      <div className="max-w-md mx-auto">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Langkah {currentStep + 1} dari {techniques.length}</span>
            <span className="text-sm text-slate-600">{techniques[currentStep].name}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / techniques.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current step content */}
        <div className="mb-6">
          {techniques[currentStep].content()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={goToPrevious}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentStep > 0 
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>Kembali</span>
          </button>

          {currentStep < techniques.length - 1 ? (
            <button
              onClick={goToNext}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center hover:bg-teal-700"
            >
              <span>Lanjut</span>
              <ArrowRight size={16} className="ml-1" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center hover:bg-green-700"
            >
              <span>Selesai</span>
              <Check size={16} className="ml-1" />
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuickRelief;
