import React from 'react';

interface SortFilterBarProps {
  onSortChange: (value: string) => void;
}

const SortFilterBar: React.FC<SortFilterBarProps> = ({ onSortChange }) => {
  return (
    <div className="flex justify-end max-w-5xl mx-auto mt-4">
      <select
        className="select select-bordered select-sm bg-black text-white"
        onChange={(e) => onSortChange(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          Sort by
        </option>
        <option value="name">Name (A-Z)</option>
        <option value="status">Open status</option>
      </select>
    </div>
  );
};

export default SortFilterBar;
