'use client';
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import HawkerCard from '../components/HawkerCard';
import SortFilterBar from '../components/SortFilterBar';
import { HawkerCentre } from '../types/hawker';

const CLOSURE_API_URL =
  'https://data.gov.sg/api/action/datastore_search?resource_id=d_bda4baa634dd1cc7a6c7cad5f19e2d68&limit=300';

function parseDate(dateStr: string) {
  if (!dateStr || dateStr === 'TBC' || dateStr === 'NA') return null;
  const [d, m, y] = dateStr.split('/');
  return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
}

function isClosedOnDate(centre: any, date: Date) {
  const periods = [
    ['q1_cleaningstartdate', 'q1_cleaningenddate'],
    ['q2_cleaningstartdate', 'q2_cleaningenddate'],
    ['q3_cleaningstartdate', 'q3_cleaningenddate'],
    ['q4_cleaningstartdate', 'q4_cleaningenddate'],
    ['other_works_startdate', 'other_works_enddate'],
  ];
  for (const [startKey, endKey] of periods) {
    const start = parseDate(centre[startKey]);
    const end = parseDate(centre[endKey]);
    if (start && end && date >= start && date <= end) return true;
  }
  return false;
}

function App() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [closureRecords, setClosureRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // yyyy-mm-dd
  });

  useEffect(() => {
    fetch(CLOSURE_API_URL)
      .then((res) => res.json())
      .then((data) => {
        setClosureRecords(data.result.records);
        setLoading(false);
      });
  }, []);

  const dateObj = new Date(date);

  // Filter and map for display
  const filtered = closureRecords
    .map((rec) => {
      const isOpen = !isClosedOnDate(rec, dateObj);
      return {
        id: rec._id.toString(),
        name: rec.name,
        address: rec.address_myenv,
        isOpen,
      } as HawkerCentre;
    })
    .filter(
      (h) =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.address.toLowerCase().includes(search.toLowerCase())
    )
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

      {/* Date Picker */}
      <div className="flex justify-center mb-4">
        <input
          type="date"
          className="input input-bordered"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max="2100-12-31"
        />
      </div>

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
