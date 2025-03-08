import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const BreathingTechnique = () => {
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
    
    // Play audio guidance
    const audio = new Audio('/assets/breathing-guide.mp3');
    audio.play().catch(error => {
      console.log('Audio could not be played', error);
    });
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
      return 'w-40 h-40';
    } else if (phase === 'inhale') {
      return 'w-56 h-56 bg-blue-500';
    } else if (phase === 'hold') {
      return 'w-56 h-56 bg-purple-500';
    } else {
      return 'w-40 h-40 bg-teal-500';
    }
  };

  return (
    <Layout title="Pernapasan 4-7-8" showBack>
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Teknik Pernapasan 4-7-8</h2>
          <p className="text-slate-600">
            Tarik napas selama 4 detik, tahan selama 7 detik, hembuskan selama 8 detik
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mb-6">
          <div 
            className={`${getCircleStyle()} rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all duration-1000 mb-4`}
          >
            {phase !== 'ready' && counter}
          </div>
          
          <h3 className="text-xl font-medium mb-1">{getInstructions()}</h3>
          
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
              className="bg-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Mulai
            </button>
          ) : (
            <button
              onClick={stopBreathing}
              className="bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Berhenti
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BreathingTechnique;
