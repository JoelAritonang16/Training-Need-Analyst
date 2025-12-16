import React from 'react';
import TrainingProposalForm from './TrainingProposalForm';
import './TrainingProposalCreate.css';

const TrainingProposalCreate = ({ onSuccess, user }) => {
  const handleSuccess = (proposal) => {
    if (onSuccess) {
      onSuccess(proposal);
    }
  };

  return (
    <div className="training-proposal-create">
      <div className="page-header">
       
      </div>
      
      <TrainingProposalForm 
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default TrainingProposalCreate;
