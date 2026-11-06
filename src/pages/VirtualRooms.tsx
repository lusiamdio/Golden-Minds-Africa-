import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Video, Users, Clock, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminState } from '../contexts/AdminStateContext';

export default function VirtualRooms() {
  const { virtualRooms: ROOMS } = useAdminState();
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleJoin = (roomId: string) => {
    setSelectedRoom(roomId);
    setAccessCode('');
    setError('');
  };

  const handleVerify = () => {
    if (!accessCode.trim()) {
      setError('Please enter your fellowship access code.');
      return;
    }
    
    setIsVerifying(true);
    // Simulate verification
    setTimeout(() => {
      if (accessCode.toUpperCase() === 'GMAF2026') {
        navigate(`/rooms/${selectedRoom}`);
      } else {
        setError('Invalid access code. Please try again.');
        setIsVerifying(false);
      }
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">Virtual Lecture Rooms</h1>
        <p className="text-gray-600 text-sm sm:text-base">Join live, AI-powered sessions with real-time translation and transcription.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {ROOMS.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-12 text-center bg-gray-50 rounded-3xl border border-gray-100">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-serif mb-2 text-gray-700">No Active Rooms</h3>
            <p className="text-gray-500">There are currently no active virtual lecture rooms available.</p>
          </div>
        ) : (
          ROOMS.map((room) => (
            <motion.div
              key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden"
          >
            {room.status === 'live' && (
              <div className="absolute top-0 right-0 mt-5 sm:mt-6 mr-5 sm:mr-6 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-wider">Live</span>
              </div>
            )}

            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${room.color} text-white flex items-center justify-center mb-4 sm:mb-6`}>
              <Video className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif mb-1">{room.name}</h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium mb-4">{room.topic}</p>

            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-1">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{room.participants?.length || 0} / {room.maxCapacity} Fellows</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Facilitator: {room.facilitator}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Unlimited Duration</span>
              </div>
            </div>

            <button
              onClick={() => handleJoin(room.id)}
              className={`w-full py-2 sm:py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${
                room.status === 'live' 
                  ? 'bg-[#1a1a1a] text-white hover:bg-black' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {room.status === 'live' ? 'Join Session' : 'Enter Waiting Room'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
          ))
        )}
      </div>

      {/* Access Code Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden text-white">
              <CardContent className="p-6 sm:p-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto border border-white/20">
                  <Lock className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">Fellowship Authentication</h3>
                <p className="text-white/60 text-center mb-6 sm:mb-8 text-xs sm:text-sm">
                  Please enter your unique fellowship access code to join {ROOMS.find(r => r.id === selectedRoom)?.name}.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-white/80 mb-2">Access Code</label>
                    <Input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="e.g., GMAF2026"
                      className="w-full px-4 py-4 sm:py-6 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-center font-mono text-base sm:text-lg uppercase tracking-widest"
                      onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRoom(null)}
                      className="flex-1 py-4 sm:py-6 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl font-bold transition-colors text-sm sm:text-base"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="flex-1 py-4 sm:py-6 bg-white/20 text-white border border-white/30 rounded-xl font-bold hover:bg-white/30 transition-colors disabled:opacity-70 flex items-center justify-center text-sm sm:text-base"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify & Join'}
                    </Button>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 text-center">
                  <p className="text-[10px] sm:text-xs text-white/40">Hint: Use code GMAF2026</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
