'use client';
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import HawkerCard from '../components/HawkerCard';
import SortFilterBar from '../components/SortFilterBar';
import { HawkerCentre } from '../types/hawker';

const API_URL =
  'https://data.gov.sg/api/action/datastore_search?resource_id=d_68a42f09f350881996d83f9cd73ab02f&limit=200';

function App() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [hawkers, setHawkers] = useState<HawkerCentre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        // Map API records to your HawkerCentre type
        const mapped: HawkerCentre[] = data.result.records.map((rec: any) => ({
          id: rec._id.toString(),
          name: rec.name_of_centre,
          address: rec.location_of_centre,
          isOpen: false, // You can update this logic if you have open/close info
          openingHours: '', // No opening hours in API, leave blank or set default
        }));
        setHawkers(mapped);
        setLoading(false);
      });
  }, []);

  const filtered = hawkers
    .filter((h) => h.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'status') return Number(b.isOpen) - Number(a.isOpen);
      return 0;
    });

  return (
    <div className="min-h-screen text-white px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-4">
        "can makan anot?"
        <div className="text-2xl mt-1 font-normal">
          check if your hawker centre is open today!
        </div>
      </h1>

      <SearchBar searchTerm={search} onChange={setSearch} />
      <SortFilterBar onSortChange={setSort} />

      <div className="mt-6 max-w-5xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No results found.</p>
        ) : (
          filtered.map((hawker) => (
            <HawkerCard key={hawker.id} hawker={hawker} />
          ))
        )}
      </div>
    </div>
  );
}

export default App;
