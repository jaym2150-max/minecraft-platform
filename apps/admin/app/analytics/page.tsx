'use client';

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const downloadsData = [
  { date: 'Mon', value: 12300 },
  { date: 'Tue', value: 15800 },
  { date: 'Wed', value: 14200 },
  { date: 'Thu', value: 18900 },
  { date: 'Fri', value: 22100 },
  { date: 'Sat', value: 28500 },
  { date: 'Sun', value: 31200 },
];

const usersData = [
  { date: 'Mon', value: 142 },
  { date: 'Tue', value: 198 },
  { date: 'Wed', value: 167 },
  { date: 'Thu', value: 234 },
  { date: 'Fri', value: 312 },
  { date: 'Sat', value: 421 },
  { date: 'Sun', value: 489 },
];

const topProjects = [
  { name: 'Sodium', downloads: 12500000, growth: 12 },
  { name: 'JEI', downloads: 15100000, growth: 8 },
  { name: 'Create', downloads: 8200000, growth: 24 },
  { name: 'Iris Shaders', downloads: 6800000, growth: 5 },
  { name: 'Lithium', downloads: 4200000, growth: 15 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-slate-600 mt-1">Insights into platform-wide metrics</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                period === p ? 'bg-slate-900 text-white' : 'bg-white border hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-600">Total Downloads</p>
          <p className="text-2xl font-bold mt-1">142,832</p>
          <p className="text-xs text-emerald-600 mt-1">+18.2% vs last period</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-600">New Users</p>
          <p className="text-2xl font-bold mt-1">1,963</p>
          <p className="text-xs text-emerald-600 mt-1">+24.7%</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-600">New Projects</p>
          <p className="text-2xl font-bold mt-1">89</p>
          <p className="text-xs text-emerald-600 mt-1">+12.1%</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-600">Avg. Session</p>
          <p className="text-2xl font-bold mt-1">8m 32s</p>
          <p className="text-xs text-emerald-600 mt-1">+2.4%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="font-semibold mb-4">Daily Downloads</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={downloadsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="font-semibold mb-4">Daily New Users</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={usersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="p-6 border-b">
          <h2 className="font-semibold">Top Projects</h2>
        </div>
        <div className="divide-y">
          {topProjects.map((p, i) => (
            <div key={p.name} className="flex items-center gap-4 p-4">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-slate-600">{p.downloads.toLocaleString('en-US')} downloads</p>
              </div>
              <span className="text-sm text-emerald-600 font-medium">+{p.growth}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
