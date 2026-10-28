import { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronRight, BookOpen, Terminal, ClipboardCheck, Calendar, Trophy, Target, AlertTriangle, Lightbulb } from 'lucide-react';
import { planData, Week, Checkpoint } from './data/plan';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
}

function WeekCard({ week, checkpoints, onToggleCheckpoint }: { 
  week: Week; 
  checkpoints: Record<string, boolean>;
  onToggleCheckpoint: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const checkedCount = week.checkpoints.filter(cp => checkpoints[cp.id]).length;
  const totalCount = week.checkpoints.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
            Неделя {week.id}
          </span>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{week.title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">{week.dates}</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{checkedCount}/{totalCount}</span>
          </div>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700">
          {/* Readings */}
          <div className="mt-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} className="text-purple-500" />
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Читать / Смотреть</h4>
            </div>
            <ul className="space-y-1 ml-6">
              {week.readings.map((reading, i) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{reading}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Daily Tasks */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Terminal size={18} className="text-green-500" />
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Ежедневные задачи</h4>
            </div>
            <div className="space-y-3 ml-6">
              {week.dailyTasks.map((dayTask, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <span className="inline-block text-xs font-bold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded mb-2">
                    {dayTask.day}
                  </span>
                  <ul className="space-y-1">
                    {dayTask.tasks.map((task, j) => (
                      <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">→</span>
                        <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded font-mono break-all">{task}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Checkpoints */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck size={18} className="text-blue-500" />
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Контрольные точки</h4>
            </div>
            <ul className="space-y-2 ml-6">
              {week.checkpoints.map((cp) => (
                <li key={cp.id}>
                  <button
                    onClick={() => onToggleCheckpoint(cp.id)}
                    className="flex items-center gap-3 w-full text-left group"
                  >
                    {checkpoints[cp.id] ? (
                      <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                    )}
                    <span className={`text-sm transition-colors ${
                      checkpoints[cp.id] 
                        ? 'text-green-600 dark:text-green-400 line-through' 
                        : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}>
                      {cp.text}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function RetrospectiveSection() {
  const [retroText, setRetroText] = useLocalStorage('retrospective-2months', '');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Trophy size={24} className="text-amber-500" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Ретроспектива за 2 месяца
          </h2>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isEditing ? 'Сохранить' : 'Редактировать'}
        </button>
      </div>

      {isEditing ? (
        <textarea
          value={retroText}
          onChange={(e) => setRetroText(e.target.value)}
          placeholder={`Напиши здесь свою ретроспективу за 2 месяца:\n\n✅ Что получилось?\n❌ Что не получилось?\n💡 Что понял нового?\n🎯 Цели на следующие 2 месяца\n\nПодсказки:\n- Какие команды Linux Networking ты освоил?\n- Какие темы остались непонятными?\n- Что было самым сложным?\n- Что было самым интересным?`}
          className="w-full h-64 p-4 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-y focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      ) : (
        <div className="prose dark:prose-invert max-w-none">
          {retroText ? (
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {retroText}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 italic text-sm">
              <p className="mb-3">Ретроспектива ещё не написана. Нажми "Редактировать" чтобы начать.</p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4 border border-amber-200 dark:border-amber-700">
                <p className="font-semibold text-amber-700 dark:text-amber-400 mb-2">Шаблон для заполнения:</p>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>✅ <strong>Что получилось:</strong> (список достижений)</li>
                  <li>❌ <strong>Что не получилось:</strong> (что осталось непонятным)</li>
                  <li>💡 <strong>Инсайты:</strong> (что понял нового о networking)</li>
                  <li>🔧 <strong>Технические навыки:</strong> (какие команды/инструменты освоил)</li>
                  <li>🎯 <strong>Цели на следующие 2 месяца:</strong></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OverallProgress() {
  const [checkpoints] = useLocalStorage<Record<string, boolean>>('checkpoints', {});
  
  const allCheckpoints = planData.flatMap(m => m.weeks.flatMap(w => w.checkpoints));
  const totalChecked = allCheckpoints.filter(cp => checkpoints[cp.id]).length;
  const totalAll = allCheckpoints.length;
  const percentage = totalAll > 0 ? Math.round((totalChecked / totalAll) * 100) : 0;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Target size={28} />
          <h2 className="text-xl font-bold">Общий прогресс</h2>
        </div>
        <span className="text-3xl font-bold">{percentage}%</span>
      </div>
      <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm text-white/80">
        <span>{totalChecked} из {totalAll} контрольных точек</span>
        <span>{planData.reduce((acc, m) => acc + m.weeks.length, 0)} недель</span>
      </div>
    </div>
  );
}

function MonthSection({ month, checkpoints, onToggleCheckpoint }: {
  month: typeof planData[0];
  checkpoints: Record<string, boolean>;
  onToggleCheckpoint: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const monthCheckpoints = month.weeks.flatMap(w => w.checkpoints);
  const checkedCount = monthCheckpoints.filter(cp => checkpoints[cp.id]).length;
  const totalCount = monthCheckpoints.length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <div className="flex items-center gap-3">
          <Calendar size={22} className="text-indigo-500" />
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{month.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{month.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{progress}%</span>
          {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-4 ml-2">
          {month.weeks.map(week => (
            <WeekCard 
              key={week.id} 
              week={week} 
              checkpoints={checkpoints}
              onToggleCheckpoint={onToggleCheckpoint}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [checkpoints, setCheckpoints] = useLocalStorage<Record<string, boolean>>('checkpoints', {});
  const [activeTab, setActiveTab] = useState<'plan' | 'retro'>('plan');

  const toggleCheckpoint = (id: string) => {
    setCheckpoints((prev: Record<string, boolean>) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Terminal size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Cloud Network Plan</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">72 недели • Linux Networking → Cloud Native</p>
              </div>
            </div>
            <nav className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('plan')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'plan' 
                    ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                📋 План
              </button>
              <button
                onClick={() => setActiveTab('retro')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'retro' 
                    ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                🏆 Ретроспектива
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'plan' ? (
          <div className="space-y-6">
            <OverallProgress />
            
            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Показаны первые 2 месяца (8 недель) из 72</p>
                <p className="text-blue-600 dark:text-blue-400">
                  Прогресс сохраняется автоматически в localStorage. Отмечай контрольные точки по мере выполнения.
                </p>
              </div>
            </div>

            {planData.map(month => (
              <MonthSection 
                key={month.id}
                month={month}
                checkpoints={checkpoints}
                onToggleCheckpoint={toggleCheckpoint}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <OverallProgress />
            <RetrospectiveSection />
            
            {/* Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={20} className="text-yellow-500" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Советы для ретроспективы</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Будь честным с собой — это для твоего роста</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Записывай конкретные примеры: "на неделе 3 я не понял VLAN tagging"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Отметь что было самым полезным и почему</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Поставь конкретные цели на следующие 2 месяца (SMART)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Перечитай ретроспективу через месяц — увидишь прогресс</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <p>Cloud Network Learning Plan • 72 недели • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
