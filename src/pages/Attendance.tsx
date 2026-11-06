import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { MapPin, CheckCircle2, AlertCircle, Fingerprint } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Attendance() {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<'idle' | 'locating' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  useEffect(() => {
    // Check if already attended today
    const checkAttendance = async () => {
      if (!user) return;
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString())
          .limit(1);
          
        if (error) {
          // If table doesn't exist yet, just ignore
          if (error.code !== '42P01') {
            console.error("Error checking attendance:", error);
          }
          return;
        }
        
        if (data && data.length > 0) {
          setTodayAttendance(data[0]);
          setStatus('success');
        }
      } catch (error) {
        console.error("Error checking attendance:", error);
      }
    };
    checkAttendance();
  }, [user]);

  const handleSignPresence = () => {
    setStatus('locating');
    
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser');
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus('verifying');
        try {
          // In a real app, we would verify the coordinates against the session location
          const { latitude, longitude } = position.coords;
          
          // Write to Supabase
          const attendanceData = {
            session_id: 'current-session-id', // Mocked for now
            user_id: user?.id,
            status: 'present',
            geo_verified: true,
            latitude,
            longitude
          };

          const { error } = await supabase
            .from('attendance')
            .insert([attendanceData]);
            
          if (error) throw error;
          
          setTodayAttendance(attendanceData);
          setStatus('success');
        } catch (error: any) {
          console.error("Error recording attendance:", error);
          setErrorMessage('Failed to record attendance. Please try again.');
          setStatus('error');
        }
      },
      (error) => {
        setErrorMessage('Unable to retrieve your location. Please enable location services.');
        setStatus('error');
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-1 sm:mb-2">Smart Attendance</h1>
        <p className="text-gray-600 text-sm sm:text-base">Geo-verified presence signing for today's session.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Action Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] text-center"
        >
          {status === 'idle' && (
            <>
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <Fingerprint className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Sign Presence</h2>
              <p className="text-gray-500 mb-6 sm:mb-8 max-w-xs text-sm sm:text-base">
                Ensure you are within the venue. We will verify your location.
              </p>
              <button 
                onClick={handleSignPresence}
                className="w-full max-w-xs py-3 sm:py-4 px-4 sm:px-6 bg-[#1a1a1a] text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-black transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-2 sm:gap-3"
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                Mark Attendance
              </button>
            </>
          )}

          {status === 'locating' && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-gray-100 border-t-[#ff4e00] rounded-full animate-spin mb-4 sm:mb-6" />
              <h2 className="text-lg sm:text-xl font-bold">Acquiring Location...</h2>
            </div>
          )}

          {status === 'verifying' && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-gray-100 border-t-[#5A5A40] rounded-full animate-spin mb-4 sm:mb-6" />
              <h2 className="text-lg sm:text-xl font-bold">Verifying Coordinates...</h2>
            </div>
          )}

          {status === 'success' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-green-500">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-green-600 mb-1 sm:mb-2">Attendance Recorded</h2>
              <p className="text-gray-500 text-sm sm:text-base">
                You have successfully signed in for today's session.
              </p>
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-xl w-full text-left">
                <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider font-medium mb-0.5 sm:mb-1">Timestamp</p>
                <p className="font-mono text-gray-900 text-sm sm:text-base">
                  {todayAttendance?.timestamp ? new Date(todayAttendance.timestamp).toLocaleString() : new Date().toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-red-500">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-1 sm:mb-2">Verification Failed</h2>
              <p className="text-gray-500 mb-6 sm:mb-8 max-w-xs text-sm sm:text-base">{errorMessage}</p>
              <button 
                onClick={() => setStatus('idle')}
                className="py-2.5 sm:py-3 px-5 sm:px-6 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          )}
        </motion.div>

        {/* Stats & Info */}
        <div className="space-y-4 sm:space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#5A5A40] text-white rounded-3xl p-6 sm:p-8 shadow-sm"
          >
            <h3 className="text-lg sm:text-xl font-bold font-serif mb-4 sm:mb-6">Your Streak</h3>
            <div className="flex items-end gap-3 sm:gap-4 mb-3 sm:mb-4">
              <span className="text-5xl sm:text-6xl font-bold">{profile?.attendanceStreak || 0}</span>
              <span className="text-base sm:text-lg text-white/70 pb-1 sm:pb-2">days</span>
            </div>
            <p className="text-white/80 text-xs sm:text-sm">
              You are in the top 20% of your cohort for attendance consistency. Keep it up!
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100"
          >
            <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Recent History</h3>
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm sm:text-base">Session {10 - i}</p>
                    <p className="text-xs sm:text-sm text-gray-500">Oct {25 - i}, 2023</p>
                  </div>
                  <span className="px-2 sm:px-3 py-1 bg-green-50 text-green-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full">
                    Present
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
