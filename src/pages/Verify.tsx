import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle2, XCircle, Search, ArrowLeft, Crown, Award, FileText, Link as LinkIcon, Copy, Clock, AlertCircle } from 'lucide-react';
import appLogo from '../assets/images/logo.png';

// Mock database of valid certificates
const VALID_CERTIFICATES: Record<string, any> = {
  "GMF-2026-000123": {
    name: "Lusima Dio",
    track: "Public Policy & Tech Governance",
    duration: "Jan 2026 - Dec 2026",
    classification: "Distinction",
    percentile: "Top 10%",
    issueDate: "December 15, 2026",
    status: "Valid",
    issuer: "Golden Minds Africa Fellowship",
    director: "Dr. Amina Mensah",
    dean: "Prof. Kwame Osei",
    blockchain: {
      status: "Verified on-chain",
      hash: "0x8f3c...9a2b",
      fullHash: "0x8f3c9a2b4e7d1f5c8a0b3e6d9f2c5a8b1e4d7f0c3a6b9d2e5f8a1b4c7d0e3f6a",
      network: "Polygon"
    }
  }
};

export default function Verify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(id || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (id) {
      handleVerify(id);
    }
  }, [id]);

  const handleVerify = (certId: string) => {
    if (!certId.trim()) return;
    
    setIsVerifying(true);
    setHasSearched(true);
    
    // Simulate network request
    setTimeout(() => {
      const data = VALID_CERTIFICATES[certId.trim()];
      setResult(data || null);
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="bg-[#0A1F44] text-white py-6 px-4 md:px-8 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg p-1 overflow-hidden flex items-center justify-center">
              <img src={appLogo} alt="Golden Minds Africa" className="w-full h-full object-contain filter drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-wide">GMAF Credential Verification</h1>
              <p className="text-xs text-white/70 uppercase tracking-widest">Official Registry</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to App
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4 md:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Search Box */}
          <div className="bg-white dark:bg-[#141414] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Verify a Certificate</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Enter the unique Certificate ID found at the bottom of the document to verify its authenticity and view the fellow's official academic standing.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g., GMF-2026-000123"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#0A1F44] dark:focus:ring-[#C9A646] focus:border-transparent outline-none transition-all font-mono text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify(searchId)}
                />
              </div>
              <button
                onClick={() => handleVerify(searchId)}
                disabled={isVerifying || !searchId.trim()}
                className="px-8 py-4 bg-[#0A1F44] text-[#C9A646] font-bold rounded-xl hover:bg-[#071530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
              >
                {isVerifying ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </motion.div>
                ) : (
                  'Verify'
                )}
              </button>
            </div>
          </div>

          {/* Results Area */}
          {hasSearched && !isVerifying && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#141414] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {result ? (
                <div>
                  {/* Success Header */}
                  <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900/30 p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-800 dark:text-green-400">Verified Authentic</h3>
                      <p className="text-green-600 dark:text-green-500 text-sm">This credential is official and recognized by Golden Minds Africa.</p>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="p-6 md:p-8 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Fellow Name</p>
                        <p className="text-3xl font-serif font-bold text-gray-900 dark:text-white">{result.name}</p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Certificate ID</p>
                        <p className="text-xl font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-md inline-block">{searchId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#C9A646]" /> Fellowship Track
                          </p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">{result.track}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#C9A646]" /> Duration
                          </p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">{result.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Issue Date</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">{result.issueDate}</p>
                        </div>
                      </div>

                      <div className="bg-[#0A1F44] rounded-xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A646]/20 rounded-full blur-2xl" />
                        <div className="relative z-10 space-y-4">
                          <div>
                            <p className="text-xs text-[#C9A646] uppercase tracking-widest font-bold mb-1">Final Classification</p>
                            <p className="text-3xl font-serif font-bold">{result.classification}</p>
                          </div>
                          <div className="pt-4 border-t border-white/20">
                            <p className="text-xs text-[#C9A646] uppercase tracking-widest font-bold mb-1 flex items-center gap-2">
                              <Crown className="w-4 h-4" /> Cohort Standing
                            </p>
                            <p className="text-xl font-medium">{result.percentile}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      <p>
                        This digital credential verifies that the individual named above has successfully completed the rigorous academic and practical requirements of the Golden Minds Africa Fellowship. The classification awarded reflects their performance across policy projects, crisis simulations, and academic assessments.
                      </p>
                    </div>

                    {/* Blockchain Verification */}
                    {result.blockchain && (
                      <div className="mt-8 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-blue-500" /> Blockchain Verification
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Status</p>
                            <p className={`text-sm font-medium flex items-center gap-1 ${
                              result.blockchain.status === 'Verified on-chain' ? 'text-green-600 dark:text-green-400' :
                              result.blockchain.status === 'Pending' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {result.blockchain.status === 'Verified on-chain' && <CheckCircle2 className="w-4 h-4" />}
                              {result.blockchain.status === 'Pending' && <Clock className="w-4 h-4" />}
                              {result.blockchain.status === 'Failed' && <AlertCircle className="w-4 h-4" />}
                              {result.blockchain.status}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Network</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{result.blockchain.network}</p>
                          </div>
                          {result.blockchain.hash && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Transaction Hash</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-[#222] px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                                  {result.blockchain.hash}
                                </p>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(result.blockchain.fullHash)}
                                  className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#222] rounded transition-colors"
                                  title="Copy Full Hash"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-12 text-center">
                  <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Record Not Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    We could not find a valid certificate matching the ID "{searchId}". Please check the ID and try again, or contact the program administration.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
