import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onChange }) => (
  <div className="form-control w-full max-w-md mx-auto mt-6">
    <input
      type="text"
      placeholder="Search hawker centres..."
      className="input input-bordered w-full"
      value={searchTerm}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default SearchBar;
