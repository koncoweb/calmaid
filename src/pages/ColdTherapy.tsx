import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { AlarmClock, CircleAlert, Pause, Play, RotateCcw, ThermometerSnowflake } from 'lucide-react';

const ColdTherapy = () => {
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // Default 60 seconds
  const [selectedTime, setSelectedTime] = useState(60);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      // Cleanup
      if (timerActive) {
        setTimerActive(false);
      }
    };
  }, []);

  useEffect(() => {
    let interval: number | undefined;

    if (timerActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            setTimerActive(false);
            sendNotification();
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
    setTimeRemaining(selectedTime);
  };

  const changeTime = (seconds: number) => {
    setSelectedTime(seconds);
    setTimeRemaining(seconds);
    setTimerActive(false);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const sendNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Cold Therapy Complete', {
        body: 'Your cold therapy session has ended. How do you feel?',
        icon: '/assets/notification-icon.png'
      });
    }
  };

  return (
    <Layout title="Cold Therapy" showBack>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Terapi Dingin</h2>
          <p className="text-slate-600">
            Menggunakan sensasi dingin untuk menenangkan sistem saraf dan mengurangi panik
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <h3 className="flex items-center text-blue-800 font-medium mb-2">
            <CircleAlert size={18} className="mr-2" />
            Instruksi Penggunaan
          </h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-2 ml-1">
            <li>Siapkan air dingin dalam wadah atau mangkuk</li>
            <li>Rendam wajah atau tangan Anda selama 15-60 detik</li>
            <li>Rasakan sensasi dingin dan fokus pada perasaan tersebut</li>
            <li>Bernapaslah perlahan dan dalam</li>
            <li>Ulangi sesuai kebutuhan</li>
          </ol>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-center mb-6">
            <div className="w-44 h-44 rounded-full bg-blue-100 border-8 border-blue-500 flex items-center justify-center">
              <div className="text-4xl font-bold text-blue-700">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            {!timerActive ? (
              <button
                onClick={startTimer}
                className="bg-blue-600 text-white rounded-full p-3"
                disabled={timeRemaining === 0}
              >
                <Play size={24} />
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="bg-orange-500 text-white rounded-full p-3"
              >
                <Pause size={24} />
              </button>
            )}
            <button
              onClick={resetTimer}
              className="bg-gray-200 text-gray-700 rounded-full p-3"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => changeTime(15)}
              className={`py-2 rounded-lg ${
                selectedTime === 15
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              15 detik
            </button>
            <button
              onClick={() => changeTime(30)}
              className={`py-2 rounded-lg ${
                selectedTime === 30
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              30 detik
            </button>
            <button
              onClick={() => changeTime(60)}
              className={`py-2 rounded-lg ${
                selectedTime === 60
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              60 detik
            </button>
          </div>
        </div>

        {notificationPermission !== 'granted' && (
          <div className="text-center mb-6">
            <button
              onClick={requestNotificationPermission}
              className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg"
            >
              <AlarmClock size={18} className="mr-2" />
              Aktifkan Notifikasi
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-medium flex items-center mb-2">
            <ThermometerSnowflake size={20} className="mr-2 text-blue-600" />
            Tips Tambahan
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Gunakan es yang dibungkus kain jika tidak ada air dingin</li>
            <li>• Terapkan di area dahi, leher, atau pergelangan tangan</li>
            <li>• Sensasi dingin merangsang saraf vagus yang menenangkan</li>
            <li>• Jika terlalu dingin, mulai dengan suhu yang lebih hangat</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ColdTherapy;
