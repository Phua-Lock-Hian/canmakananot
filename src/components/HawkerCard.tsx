import React from 'react';
import { HawkerCentre } from '../types/hawker';
import StatusTag from './StatusTag';

interface Props {
  hawker: HawkerCentre;
}

const HawkerCard: React.FC<Props> = ({ hawker }) => (
  <div className="card bg-gray-700 shadow-md mb-6">
    <div className="card-body py-6 px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{hawker.name}</h2>
        <StatusTag isOpen={hawker.isOpen} />
      </div>
      <p className="text-lg text-gray-300 mt-2">{hawker.address.replace(/[\(\),]/g, '').trim()}</p>
    </div>
  </div>
);

export default HawkerCard;
