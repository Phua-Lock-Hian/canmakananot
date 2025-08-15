'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import SearchBar from '../components/SearchBar';
import HawkerCard from '../components/HawkerCard';
import SortFilterBar from '../components/SortFilterBar';
import { HawkerCentre } from '../types/hawker';
import { ClosureRecord } from '../types/closure';

const CLOSURE_API_URL =
  'https://data.gov.sg/api/action/datastore_search?resource_id=d_bda4baa634dd1cc7a6c7cad5f19e2d68&limit=300';

function isValidDate(day: number, month: number, year: number): boolean {
  // Check month range
  if (month < 1 || month > 12) return false;
  
  // Check day range based on month
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;
  
  // Check year range (allowing reasonable range)
  const currentYear = new Date().getFullYear();
  if (year < currentYear - 1 || year > currentYear + 5) return false;
  
  return true;
}

function parseDate(dateStr: string) {
  if (!dateStr || dateStr === 'TBC' || dateStr === 'NA') return null;
  
  // Check format using regex (accept 1 or 2 digits for day/month)
  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateStr.match(dateRegex);
  if (!match) return null;
  
  const [, dayStr, monthStr, yearStr] = match;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);
  
  if (!isValidDate(day, month, year)) return null;
  
  return new Date(`${yearStr}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`);
}

function isClosedOnDate(centre: ClosureRecord, date: Date) {
  const periods: Array<[keyof ClosureRecord, keyof ClosureRecord]> = [
    ['q1_cleaningstartdate', 'q1_cleaningenddate'],
    ['q2_cleaningstartdate', 'q2_cleaningenddate'],
    ['q3_cleaningstartdate', 'q3_cleaningenddate'],
    ['q4_cleaningstartdate', 'q4_cleaningenddate'],
    ['other_works_startdate', 'other_works_enddate'],
  ];
  for (const [startKey, endKey] of periods) {
    const start = parseDate(String(centre[startKey]));
    const end = parseDate(String(centre[endKey]));
    if (start && end && date >= start && date <= end) return true;
  }
  return false;
}

function App() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [closureRecords, setClosureRecords] = useState<ClosureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => {
    const today = new Date();
    // Format as dd/mm/yyyy
    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  });
  const [dateError, setDateError] = useState<string>('');
  const [selectedHawker, setSelectedHawker] = useState<ClosureRecord | null>(null);


  useEffect(() => {
    fetch(CLOSURE_API_URL)
      .then((res) => res.json())
      .then((data) => {
        setClosureRecords(data.result.records);
        setLoading(false);
      });
  }, []);

  // Use parseDate for user input as well
  const dateObj = parseDate(date) || new Date();

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
        &ldquo;can makan anot?&rdquo;
        <div className="text-2xl mt-1 font-normal">
          check if your hawker centre is open today!
        </div>
      </h1>

      {/* Date Picker */}
      <div className="flex flex-col items-center mb-4">
        <input
          type="text"
          className={`input input-bordered ${dateError ? 'border-red-500' : ''}`}
          value={date}
          onChange={(e) => {
            const newValue = e.target.value;
            setDate(newValue);
            
            // Clear error when input is empty
            if (!newValue) {
              setDateError('');
              return;
            }

            // Validate format
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(newValue)) {
              setDateError('Please use format: dd/mm/yyyy');
              return;
            }

            // Parse and validate date
            const parsedDate = parseDate(newValue);
            if (!parsedDate) {
              setDateError('Invalid date');
            } else {
              setDateError('');
            }
          }}
          placeholder="dd/mm/yyyy"
          pattern="\d{2}/\d{2}/\d{4}"
          maxLength={10}
          aria-invalid={!!dateError}
          aria-describedby="date-error"
        />
        {dateError && (
          <p id="date-error" className="text-red-500 mt-1 text-sm">
            {dateError}
          </p>
        )}
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
            <div
              key={hawker.id}
              onClick={() => {
                const found = closureRecords.find((rec) => rec._id.toString() === hawker.id);
                if (found) setSelectedHawker(found);
              }}
              className="cursor-pointer"
            >
              <HawkerCard hawker={hawker} />
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedHawker && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setSelectedHawker(null)}
        >
          <div
            className="bg-gray-800 rounded-lg p-6 max-w-lg w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
              onClick={() => setSelectedHawker(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedHawker.name}</h2>
            {selectedHawker.photourl && (
              <div className="relative w-full h-64 mb-4">
                <Image
                  src={selectedHawker.photourl}
                  alt={selectedHawker.name}
                  fill
                  className="rounded shadow object-cover"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.style.display = 'none';
                  }}
                  unoptimized // This will bypass Next.js image optimization for external URLs that might be problematic
                />
              </div>
            )}
            <p className="mb-2 text-gray-300">{selectedHawker.address_myenv}</p>
            <p className="mb-4">{selectedHawker.description_myenv}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
