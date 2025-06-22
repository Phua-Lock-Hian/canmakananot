import React from 'react';

interface StatusTagProps {
  isOpen: boolean;
}

const StatusTag: React.FC<StatusTagProps> = ({ isOpen }) => (
  <span className="text-lg font-bold">
    <span className={isOpen ? "text-green-400" : "text-gray-400"}>OPEN</span>
    <span className="text-white mx-1">/</span>
    <span className={!isOpen ? "text-red-400" : "text-gray-400"}>CLOSED</span>
  </span>
);

export default StatusTag;
