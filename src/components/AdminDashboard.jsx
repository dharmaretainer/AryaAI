import React, { useState, useEffect } from 'react';
import axios from 'axios';
import admin from '../assets/admindasboard.png';

const AdminDashboard = () => {
  const [recentQueries, setRecentQueries] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalQueries: 0,
    popularDestinations: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const analyticsResponse = await axios.get('https://aryaai-travel-agent.onrender.com/admin/analytics');
        setAnalytics(analyticsResponse.data);

        const queriesResponse = await axios.get('https://aryaai-travel-agent.onrender.com/admin/queries');
        setRecentQueries(queriesResponse.data.slice(-5));
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin data');

        const mockQueries = [
          {
            id: 1,
            destination: 'Goa',
            days: 5,
            budget: '25000',
            preferences: 'beaches, seafood',
            timestamp: '2024-01-15 14:30',
            status: 'completed'
          },
          {
            id: 2,
            destination: 'Kashmir',
            days: 7,
            budget: '35000',
            preferences: 'mountains, adventure',
            timestamp: '2024-01-15 13:45',
            status: 'completed'
          }
        ];

        const mockAnalytics = {
          totalQueries: 156,
          popularDestinations: [
            { name: 'Goa', count: 45 },
            { name: 'Kashmir', count: 32 },
            { name: 'Kerala', count: 28 },
            { name: 'Rajasthan', count: 25 },
            { name: 'Himachal Pradesh', count: 22 }
          ],
          recentActivity: [
            { time: '2 min ago', action: 'New query for Goa' },
            { time: '5 min ago', action: 'Query completed for Kashmir' },
            { time: '8 min ago', action: 'New voice request' },
            { time: '12 min ago', action: 'PDF downloaded' }
          ]
        };

        setRecentQueries(mockQueries);
        setAnalytics(mockAnalytics);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Showing demo data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <img src={admin} className="h-10 w-10"/>
          <span className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</span>
          {/* <p className="text-gray-600">AI Travel Assistant Analytics & Management</p> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalQueries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <span className="text-2xl">🌍</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Destinations</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.popularDestinations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <span className="text-2xl">🎤</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Voice Queries</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <span className="text-2xl">📄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">PDF Downloads</p>
                <p className="text-2xl font-bold text-gray-900">67</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Recent Queries</h2>
            <div className="space-y-4">
              {recentQueries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No queries yet. Start using the travel assistant!</p>
              ) : (
                recentQueries.map((query) => (
                  <div key={query.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{query.destination}</h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {query.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📅 {query.days} days • 💰 ₹{query.budget}</p>
                      <p>✨ {query.preferences}</p>
                      <p className="text-xs text-gray-500">🕒 {query.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Popular Destinations</h2>
            <div className="space-y-3">
              {analytics.popularDestinations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No destinations yet.</p>
              ) : (
                analytics.popularDestinations.map((dest, index) => (
                  <div key={dest.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </span>
                      <span className="font-medium text-gray-800">{dest.name}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {dest.count} queries
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Recent Activity</h2>
          <div className="space-y-3">
            {analytics.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity.</p>
            ) : (
              analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-800">{activity.action}</span>
                  <span className="ml-auto text-sm text-gray-500">{activity.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
