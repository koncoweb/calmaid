import { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { ChartBar, CircleAlert, Clock, ListChecks, Thermometer, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
);

interface JournalDashboardProps {
  entries: JournalEntry[];
  selectedMonth: string;
}

interface StatItem {
  label: string;
  value: number | string;
  icon: JSX.Element;
  bgColor: string;
}

const JournalDashboard = ({ entries, selectedMonth }: JournalDashboardProps) => {
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [commonTriggers, setCommonTriggers] = useState<{trigger: string, count: number}[]>([]);
  const [commonSymptoms, setCommonSymptoms] = useState<{symptom: string, count: number}[]>([]);
  const [commonStrategies, setCommonStrategies] = useState<{strategy: string, count: number}[]>([]);
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [{
      label: 'Kondisi',
      data: [] as number[],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      tension: 0.3
    }]
  });
  
  useEffect(() => {
    // Filter entries by selected month
    const filtered = entries.filter(entry => entry.timestamp.startsWith(selectedMonth));
    // Sort by date (oldest first for chart)
    filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setFilteredEntries(filtered);
    
    // Calculate statistics
    calculateStats(filtered);
    analyzeCommonFactors(filtered);
    prepareChartData(filtered);
  }, [entries, selectedMonth]);
  
  const prepareChartData = (filtered: JournalEntry[]) => {
    if (filtered.length === 0) return;
    
    const labels = filtered.map(entry => {
      const date = new Date(entry.timestamp);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    });
    
    const data = filtered.map(entry => entry.condition);
    
    setChartData({
      labels,
      datasets: [{
        label: 'Kondisi',
        data,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        tension: 0.3
      }]
    });
  };
  
  const calculateStats = (filteredEntries: JournalEntry[]) => {
    // Get total entries
    const totalEntries = filteredEntries.length;
    
    // Calculate average time between entries (if more than 1 entry)
    let avgTimeBetween = 'N/A';
    if (totalEntries > 1) {
      const sortedEntries = [...filteredEntries].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      let totalTimeDiff = 0;
      for (let i = 1; i < sortedEntries.length; i++) {
        const prevDate = new Date(sortedEntries[i-1].timestamp);
        const currDate = new Date(sortedEntries[i].timestamp);
        totalTimeDiff += currDate.getTime() - prevDate.getTime();
      }
      
      const avgTimeMs = totalTimeDiff / (sortedEntries.length - 1);
      const avgDays = Math.round(avgTimeMs / (1000 * 60 * 60 * 24));
      avgTimeBetween = `${avgDays} hari`;
    }
    
    // Calculate frequency by time of day
    const timeOfDayCounts = {
      morning: 0,   // 5:00 - 11:59
      afternoon: 0, // 12:00 - 16:59
      evening: 0,   // 17:00 - 21:59
      night: 0      // 22:00 - 4:59
    };
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      
      if (hour >= 5 && hour < 12) {
        timeOfDayCounts.morning++;
      } else if (hour >= 12 && hour < 17) {
        timeOfDayCounts.afternoon++;
      } else if (hour >= 17 && hour < 22) {
        timeOfDayCounts.evening++;
      } else {
        timeOfDayCounts.night++;
      }
    });
    
    // Find most common time of day
    let maxTimeOfDay = 'N/A';
    let maxCount = 0;
    
    (Object.keys(timeOfDayCounts) as Array<keyof typeof timeOfDayCounts>).forEach(time => {
      if (timeOfDayCounts[time] > maxCount) {
        maxCount = timeOfDayCounts[time];
        maxTimeOfDay = time;
      }
    });
    
    const timeOfDayLabels: Record<string, string> = {
      morning: 'Pagi',
      afternoon: 'Siang',
      evening: 'Sore',
      night: 'Malam'
    };
    
    // Calculate average condition
    let avgCondition = 'N/A';
    if (totalEntries > 0) {
      const total = filteredEntries.reduce((sum, entry) => sum + entry.condition, 0);
      const avg = total / totalEntries;
      
      if (avg < 0.5) {
        avgCondition = 'Cemas';
      } else if (avg < 1.5) {
        avgCondition = 'Lebih Baik';
      } else {
        avgCondition = 'Tenang';
      }
    }
    
    setStats([
      {
        label: 'Total Catatan',
        value: totalEntries,
        icon: <ChartBar size={20} />,
        bgColor: 'bg-blue-100'
      },
      {
        label: 'Rata-rata Jarak',
        value: avgTimeBetween,
        icon: <Clock size={20} />,
        bgColor: 'bg-green-100'
      },
      {
        label: 'Waktu Umum',
        value: maxCount > 0 ? timeOfDayLabels[maxTimeOfDay] : 'N/A',
        icon: <Thermometer size={20} />,
        bgColor: 'bg-orange-100'
      },
      {
        label: 'Rata-rata Kondisi',
        value: avgCondition,
        icon: <TrendingUp size={20} />,
        bgColor: 'bg-purple-100'
      }
    ]);
  };
  
  const analyzeCommonFactors = (filteredEntries: JournalEntry[]) => {
    // Helper function to count occurrences of items
    const countOccurrences = (entries: JournalEntry[], field: keyof JournalEntry) => {
      const counts: Record<string, number> = {};
      
      entries.forEach(entry => {
        const value = entry[field] as string;
        if (!value) return;
        
        // Split by commas or semicolons to handle multiple items in one field
        const items = value.split(/[,;]/).map(item => item.trim());
        
        items.forEach(item => {
          if (item) {
            counts[item.toLowerCase()] = (counts[item.toLowerCase()] || 0) + 1;
          }
        });
      });
      
      // Convert to array and sort by count (descending)
      return Object.entries(counts)
        .map(([item, count]) => ({ [field.toString().slice(0, -1)]: item, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3); // Top 3
    };
    
    setCommonTriggers(countOccurrences(filteredEntries, 'triggers') as {trigger: string, count: number}[]);
    setCommonSymptoms(countOccurrences(filteredEntries, 'symptoms') as {symptom: string, count: number}[]);
    setCommonStrategies(countOccurrences(filteredEntries, 'strategies') as {strategy: string, count: number}[]);
  };
  
  const renderBarGraph = (items: {[key: string]: string, count: number}[], label: string, colorClass: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-4 text-slate-500">
          Tidak ada data yang cukup
        </div>
      );
    }
    
    // Find max count for scaling
    const maxCount = Math.max(...items.map(item => item.count));
    
    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-1/3 text-sm truncate pr-2">{item[label]}</div>
            <div className="w-2/3 flex items-center">
              <div 
                className={`h-6 ${colorClass} rounded-md`} 
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              ></div>
              <span className="ml-2 text-xs text-slate-600">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const getConditionLabel = (value: number) => {
    switch (value) {
      case 0: return 'Masih Cemas';
      case 1: return 'Lebih Baik';
      case 2: return 'Tenang';
      default: return 'Tidak diketahui';
    }
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return getConditionLabel(value);
          }
        }
      }
    },
    scales: {
      y: {
        min: -0.5,
        max: 2.5,
        ticks: {
          callback: function(value: any) {
            if (value === 0) return 'Masih Cemas';
            if (value === 1) return 'Lebih Baik';
            if (value === 2) return 'Tenang';
            return '';
          }
        },
        title: {
          display: true,
          text: 'Kondisi'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tanggal'
        }
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <CircleAlert size={40} className="mx-auto mb-3 text-slate-400" />
          <h3 className="text-lg font-medium mb-1">Tidak Ada Data</h3>
          <p className="text-slate-600">
            Tidak ada catatan untuk bulan yang dipilih
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-medium mb-4 flex items-center">
              <TrendingUp size={18} className="mr-2 text-indigo-600" />
              <span>Grafik Kondisi</span>
            </h3>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
                <span className="text-slate-700">Masih Cemas (0)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
                <span className="text-slate-700">Lebih Baik (1)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
                <span className="text-slate-700">Tenang (2)</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.bgColor} rounded-lg p-4 shadow-sm`}>
                <div className="flex items-center mb-2">
                  <div className="mr-2 text-slate-700">{stat.icon}</div>
                  <h3 className="font-medium text-slate-700">{stat.label}</h3>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-medium mb-4 flex items-center">
              <ListChecks size={18} className="mr-2 text-indigo-600" />
              <span>Analisis Pola</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3 text-indigo-800">
                  Pemicu Umum
                </h4>
                {renderBarGraph(commonTriggers, 'trigger', 'bg-red-200')}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3 text-indigo-800">
                  Gejala Umum
                </h4>
                {renderBarGraph(commonSymptoms, 'symptom', 'bg-orange-200')}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3 text-indigo-800">
                  Strategi Efektif
                </h4>
                {renderBarGraph(commonStrategies, 'strategy', 'bg-green-200')}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JournalDashboard;
