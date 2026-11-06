import React, { useState } from 'react';
import { AFRICAN_COUNTRIES, AfricanCountry } from '../data/africanCountries';
import { Globe, Search } from 'lucide-react';

export default function AfricanFlagsGrid() {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const regions = ['All', 'North Africa', 'West Africa', 'East Africa', 'Central Africa', 'Southern Africa'];

  const filteredCountries = AFRICAN_COUNTRIES.filter((country) => {
    const matchesRegion = selectedRegion === 'All' || country.region === selectedRegion;
    const matchesSearch =
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-widest mb-1.5">
            <Globe className="w-4 h-4" /> Pan-African Sovereign Network
          </div>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">
            The 54 Sovereign Nations of Africa
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Representing youth envoys, diplomatic chapters, and civic initiatives across every sovereign state of the African continent.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 54 countries..."
              className="pl-9 pr-3 py-1.5 bg-black/60 border border-white/15 rounded-full text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Region Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {regions.map((region) => {
          const count =
            region === 'All'
              ? AFRICAN_COUNTRIES.length
              : AFRICAN_COUNTRIES.filter((c) => c.region === region).length;
          return (
            <button
              key={region}
              type="button"
              onClick={() => setSelectedRegion(region)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedRegion === region
                  ? 'bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/20'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20'
              }`}
            >
              <span>{region}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedRegion === region ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 54 Flags Grid */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {filteredCountries.map((country: AfricanCountry) => (
          <div
            key={country.code}
            className="group relative p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col items-center text-center cursor-default hover:-translate-y-1 hover:shadow-lg hover:shadow-black/60"
            title={`${country.name} (${country.region}) - Capital: ${country.capital}`}
          >
            {/* Flag Image */}
            <div className="w-10 h-7 rounded-md overflow-hidden bg-black/50 border border-white/20 shadow-sm mb-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                alt={`${country.name} Flag`}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Country Name */}
            <div className="text-[11px] font-medium text-gray-200 group-hover:text-white line-clamp-1 leading-tight w-full">
              {country.name}
            </div>

            {/* Capital & Code */}
            <div className="text-[9px] text-gray-500 group-hover:text-[#D4AF37] font-mono mt-0.5 uppercase tracking-wider">
              {country.code} • {country.capital}
            </div>
          </div>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="text-center py-8 text-xs text-gray-500">
          No countries found matching "{searchQuery}" in {selectedRegion}.
        </div>
      )}
    </div>
  );
}
