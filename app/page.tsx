'use client';

import { useEffect, useState } from 'react';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home as HomeIcon, Settings as SettingsIcon, History as HistoryIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, differenceInDays, addDays, isAfter, isBefore, parseISO, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Toaster, toast } from 'sonner';

interface HabitData {
  name: string;
  progress: number;
  streak: number;
  bestStreak: number;
  startDate: string;
  endDate: string;
  currentDays: number;
  defaultPeriodDays: number;
  // 日付ごとの達成回数を記録
  dailyRecords: { [date: string]: number };
  // 通知設定を追加
  reminderTime: string;
  reminderEnabled: boolean;
  // 期ごとの記録を追加
  periodHistory: {
    startDate: string;
    endDate: string;
    dailyRecords: { [date: string]: number };
    completed: boolean;
  }[];
}

// 応援メッセージのリスト
const encouragementMessages = [
  "その調子！続けていきましょう！👍",
  "素晴らしい進捗です！💪",
  "一歩一歩、着実に前進していますね！🌟",
  "今日も目標達成、すごいです！✨",
  "継続は力なり！頑張っています！🎯",
];

export default function Home() {
  const [habitData, setHabitData] = useState<HabitData>(() => {
    // デフォルト値の設定
    const today = new Date();
    return {
      name: '',
      progress: 0,
      streak: 0,
      bestStreak: 0,
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(addDays(today, 30), 'yyyy-MM-dd'),
      currentDays: 0,
      defaultPeriodDays: 30,
      dailyRecords: {},
      reminderTime: '09:00',
      reminderEnabled: false,
      periodHistory: [],
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(habitData.startDate);
  const [tempEndDate, setTempEndDate] = useState(habitData.endDate);
  const [showHistory, setShowHistory] = useState(false);

  // 初期データの読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('habitData');
      if (savedData) {
        setHabitData(JSON.parse(savedData));
      }
    }
  }, []);

  // データの保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('habitData', JSON.stringify(habitData));
      // 期間設定の一時的な状態も更新
      setTempStartDate(habitData.startDate);
      setTempEndDate(habitData.endDate);
    }
  }, [habitData]);

  // 継続性チェック
  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkContinuity(habitData);
    }
  }, []);

  // 通知のチェックと送信
  useEffect(() => {
    if (!habitData.reminderEnabled || !habitData.reminderTime) return;

    let timeoutId: NodeJS.Timeout;

    const scheduleNotification = () => {
      const now = new Date();
      const [hours, minutes] = habitData.reminderTime.split(':').map(Number);
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // 指定時刻が過ぎている場合は翌日の同時刻に設定
      if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delay = scheduledTime.getTime() - now.getTime();

      timeoutId = setTimeout(() => {
        // 通知の許可を確認
        if (Notification.permission === 'granted') {
          new Notification('習慣の記録', {
            body: `${habitData.name}の記録を忘れずに！`,
            icon: '/favicon.ico'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
        // 次の通知をスケジュール
        scheduleNotification();
      }, delay);
    };

    if (typeof window !== 'undefined') {
      scheduleNotification();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [habitData.reminderEnabled, habitData.reminderTime, habitData.name]);

  const checkContinuity = (data: HabitData) => {
    if (!data.name || Object.keys(data.dailyRecords).length === 0) return;

    const today = new Date();
    const lastRecordDate = Object.keys(data.dailyRecords)
      .sort()
      .pop();

    if (!lastRecordDate) return;

    const lastRecord = parseISO(lastRecordDate);
    const daysSinceLastRecord = differenceInDays(today, lastRecord);

    if (daysSinceLastRecord >= 2) {
      toast.warning(
        `${data.name}の記録が${daysSinceLastRecord}日間途絶えています。\n今日から再開しましょう！`,
        {
          duration: 5000,
          position: 'top-center',
        }
      );
    }
  };

  const getRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * encouragementMessages.length);
    return encouragementMessages[randomIndex];
  };

  const getPeriodDays = () => {
    return differenceInDays(parseISO(habitData.endDate), parseISO(habitData.startDate)) + 1;
  };

  const getFormattedDateRange = () => {
    return `${format(parseISO(habitData.startDate), 'M月d日', { locale: ja })}〜${format(parseISO(habitData.endDate), 'M月d日', { locale: ja })}`;
  };

  const handleProgressClick = () => {
    if (!habitData.name) {
      toast.error('目標が設定されていません');
      return;
    }

    const today = new Date();
    const startDate = parseISO(habitData.startDate);
    const endDate = parseISO(habitData.endDate);

    if (isBefore(today, startDate)) {
      toast.error('開始日前です');
      return;
    }

    if (isAfter(today, endDate)) {
      toast.error('期間が終了しています');
      return;
    }

    const todayStr = format(today, 'yyyy-MM-dd');
    const totalClicksInPeriod = Object.values(habitData.dailyRecords).reduce((sum, count) => sum + count, 0);
    const newCount = (habitData.dailyRecords[todayStr] || 0) + 1;
    const newDays = Math.min(totalClicksInPeriod + 1, getPeriodDays());

    const periodDays = getPeriodDays();
    const newProgress = (newDays / periodDays) * 100;

    if (newDays >= periodDays) {
      // 期間達成時の処理
      const newStreak = habitData.streak + 1;
      const newBestStreak = Math.max(newStreak, habitData.bestStreak);
      
      // 現在の期間を履歴に追加
      const completedPeriod = {
        startDate: habitData.startDate,
        endDate: habitData.endDate,
        dailyRecords: habitData.dailyRecords,
        completed: true,
      };

      toast.success('🎉 期間達成おめでとうございます！', {
        description: `${newStreak}期連続達成！次の期間も頑張りましょう！`,
        duration: 5000,
      });
      
      const nextStartDate = format(addDays(endDate, 1), 'yyyy-MM-dd');
      const nextEndDate = format(addDays(endDate, habitData.defaultPeriodDays), 'yyyy-MM-dd');
      
      setHabitData(prev => ({
        ...prev,
        progress: 0,
        currentDays: 0,
        streak: newStreak,
        bestStreak: newBestStreak,
        startDate: nextStartDate,
        endDate: nextEndDate,
        dailyRecords: { [todayStr]: 1 },
        periodHistory: [...prev.periodHistory, completedPeriod],
      }));
    } else {
      // 通常の進捗更新
      toast.success(`${getRandomMessage()}\n${newDays}日目 ${newCount}回目の達成です！`, {
        duration: 3000,
      });

      setHabitData(prev => ({
        ...prev,
        progress: newProgress,
        currentDays: newDays,
        dailyRecords: {
          ...prev.dailyRecords,
          [todayStr]: newCount
        }
      }));
    }
  };

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setHabitData(prev => ({
        ...prev,
        name: tempName.trim()
      }));
      setIsEditing(false);
      console.log('目標を設定しました:', tempName.trim());
    }
  };

  const handlePeriodSubmit = () => {
    const start = parseISO(tempStartDate);
    const end = parseISO(tempEndDate);

    if (isAfter(start, end)) {
      toast.error('開始日は終了日より前の日付を選択してください');
      return;
    }

    const newPeriodDays = differenceInDays(end, start) + 1;

    setHabitData(prev => ({
      ...prev,
      startDate: tempStartDate,
      endDate: tempEndDate,
      defaultPeriodDays: newPeriodDays,
      // 現在の達成日数が新しい期間を超えている場合は調整
      currentDays: Math.min(prev.currentDays, newPeriodDays),
      progress: Math.min((prev.currentDays / newPeriodDays) * 100, 100)
    }));
    setShowSettings(false);
    toast.success(`期間を${newPeriodDays}日に設定しました`);
  };

  // Enterキーでの送信に対応
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  // 期間の達成状況を計算する関数
  const calculatePeriodProgress = (period: { completed: boolean }) => {
    return period.completed ? 100 : 0;
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <Toaster />
      <div className="container mx-auto max-w-md">
        <h1 className="text-2xl font-semibold text-center text-sky-700 mb-8">
          習慣の記録
        </h1>
        
        <Card className="p-6 mb-8">
          <div className="text-center mb-6">
            {isEditing ? (
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="目標を入力"
                  className="max-w-[200px]"
                  autoFocus
                />
                <Button 
                  variant="default"
                  onClick={handleNameSubmit}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                >
                  設定
                </Button>
              </div>
            ) : (
              <h2 
                className="text-xl font-medium cursor-pointer hover:text-sky-600 transition-colors"
                onClick={() => {
                  setTempName(habitData.name);
                  setIsEditing(true);
                }}
              >
                {habitData.name || '目標を設定してください'}
              </h2>
            )}
          </div>
          
          <div 
            className="relative w-48 h-48 mx-auto mb-6 cursor-pointer transition-transform hover:scale-105"
            onClick={handleProgressClick}
          >
            <CircularProgress 
              value={habitData.progress} 
              size={192}
              strokeWidth={8}
              className="text-sky-500"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-4xl font-bold text-sky-700">
                {Math.round(habitData.progress)}%
              </span>
              <p className="text-sm text-gray-500 mt-1">達成率</p>
              <p className="text-sm text-gray-500 mt-1">
                {habitData.currentDays}/{getPeriodDays()}日
              </p>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              期間: {getFormattedDateRange()}
            </p>
          </div>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sky-600">🔥</span>
              <span className="text-lg">
                {habitData.streak}期連続達成中
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              最高記録: {habitData.bestStreak}期
            </p>
          </div>

          {habitData.name && (
            <p className="text-sm text-center text-gray-500 mt-2">
              円をクリックして1日分の達成を記録
            </p>
          )}
        </Card>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>期間設定</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">開始日</label>
                  <Input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      setTempStartDate(newStartDate);
                      if (habitData.defaultPeriodDays) {
                        const newStart = parseISO(newStartDate);
                        setTempEndDate(format(addDays(newStart, habitData.defaultPeriodDays - 1), 'yyyy-MM-dd'));
                      }
                    }}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">終了日</label>
                  <Input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">リマインド通知</label>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (Notification.permission !== 'granted') {
                        Notification.requestPermission();
                      }
                      setHabitData(prev => ({
                        ...prev,
                        reminderEnabled: !prev.reminderEnabled
                      }));
                    }}
                    className={`${habitData.reminderEnabled ? 'text-sky-600' : 'text-gray-400'}`}
                  >
                    {habitData.reminderEnabled ? '通知オン' : '通知オフ'}
                  </Button>
                </div>
                {habitData.reminderEnabled && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">通知時間</label>
                    <Input
                      type="time"
                      value={habitData.reminderTime}
                      onChange={(e) => setHabitData(prev => ({
                        ...prev,
                        reminderTime: e.target.value
                      }))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                現在の期間設定: {habitData.defaultPeriodDays}日
              </p>
              <Button 
                className="w-full mt-6 bg-sky-600 hover:bg-sky-700 text-white"
                onClick={handlePeriodSubmit}
              >
                設定を保存
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>実施記録</DialogTitle>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
              {habitData.periodHistory.length === 0 ? (
                <p className="text-center text-gray-500">記録がありません</p>
              ) : (
                <div className="space-y-4">
                  {[...habitData.periodHistory].reverse().map((period, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          第{habitData.periodHistory.length - index}期
                        </span>
                        <span className={`text-sm ${period.completed ? 'text-sky-600' : 'text-gray-500'}`}>
                          {period.completed ? '達成' : '未達成'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        期間: {format(parseISO(period.startDate), 'M月d日', { locale: ja })}
                        〜{format(parseISO(period.endDate), 'M月d日', { locale: ja })}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          達成率: {calculatePeriodProgress(period)}%
                        </span>
                        <span className="text-sm text-gray-500">
                          記録回数: {Object.values(period.dailyRecords).reduce((sum, count) => sum + count, 0)}回
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
          <div className="container mx-auto max-w-md">
            <div className="flex justify-around">
              <Button variant="ghost" className="flex flex-col items-center gap-1">
                <HomeIcon className="w-6 h-6 text-sky-600" />
                <span className="text-xs text-sky-600">ホーム</span>
              </Button>
              <Button 
                variant="ghost" 
                className="flex flex-col items-center gap-1"
                onClick={() => setShowHistory(true)}
              >
                <HistoryIcon className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-400">履歴</span>
              </Button>
              <Button 
                variant="ghost" 
                className="flex flex-col items-center gap-1"
                onClick={() => setShowSettings(true)}
              >
                <SettingsIcon className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-400">設定</span>
              </Button>
            </div>
          </div>
        </nav>
      </div>
    </main>
  );
}