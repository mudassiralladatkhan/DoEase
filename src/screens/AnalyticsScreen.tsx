import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Task } from '../types';
import ReactECharts from 'echarts-for-react';
import { Loader2, TrendingUp, CheckCircle, PieChart, AlertCircle } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
  <div className="glass-pane p-4 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}20`, color }}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  </div>
);

const AnalyticsScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) return;
      setLoading(true);
      const { data, error } = await api.getTasks(currentUser.id);
      if (error) {
        console.error("Failed to fetch tasks for analytics:", error);
      } else {
        setTasks(data || []);
      }
      setLoading(false);
    };
    fetchTasks();
  }, [currentUser]);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, completionRate };
  }, [tasks]);

  const weeklyProductivityOptions = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const tasksCompletedByDay = last7Days.map(day => {
      // Count tasks that were completed and created on this day
      // Note: This is an approximation since we don't have a completed_at timestamp
      return tasks.filter(task => {
        if (!task.completed) return false;
        const createdDate = new Date(task.created_at).toISOString().split('T')[0];
        return createdDate === day;
      }).length;
    });

    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
        axisLine: { lineStyle: { color: '#929AAB' } },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#929AAB' } },
        splitLine: { lineStyle: { color: 'rgba(137, 207, 243, 0.1)' } },
      },
      series: [{
        name: 'Tasks Completed',
        type: 'bar',
        barWidth: '60%',
        data: tasksCompletedByDay,
        itemStyle: { color: '#00A9FF' },
      }],
    };
  }, [tasks]);

  const priorityDistributionOptions = useMemo(() => {
    const priorities = { high: 0, medium: 0, low: 0 };
    tasks.forEach(task => priorities[task.priority]++);
    
    return {
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: '#F0F3FF' },
      },
      series: [{
        name: 'Priority Distribution',
        type: 'pie',
        radius: '70%',
        data: [
          { value: priorities.high, name: 'High', itemStyle: { color: '#F56565' } },
          { value: priorities.medium, name: 'Medium', itemStyle: { color: '#ECC94B' } },
          { value: priorities.low, name: 'Low', itemStyle: { color: '#00A9FF' } },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: { show: false },
      }],
    };
  }, [tasks]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center p-10 glass-pane animate-fade-in">
        <AlertCircle size={48} className="mx-auto text-text-secondary mb-4" />
        <h3 className="text-xl font-semibold text-text-primary">No Data to Analyze</h3>
        <p className="text-text-secondary mt-2">Complete some tasks to see your productivity analytics.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<CheckCircle size={24} />} title="Tasks Completed" value={stats.completedTasks} color="#48BB78" />
        <StatCard icon={<TrendingUp size={24} />} title="Completion Rate" value={`${stats.completionRate}%`} color="#00A9FF" />
        <StatCard icon={<PieChart size={24} />} title="Total Tasks" value={stats.totalTasks} color="#ECC94B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 glass-pane p-4">
          <h2 className="text-lg font-semibold mb-4">Weekly Productivity</h2>
          <ReactECharts option={weeklyProductivityOptions} style={{ height: 300 }} notMerge={true} lazyUpdate={true} />
        </div>
        <div className="lg:col-span-2 glass-pane p-4">
          <h2 className="text-lg font-semibold mb-4">Priority Distribution</h2>
          <ReactECharts option={priorityDistributionOptions} style={{ height: 300 }} notMerge={true} lazyUpdate={true} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;
