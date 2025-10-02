import React from 'react';
import TrainingProposalForm from './TrainingProposalForm';
import './TrainingProposalCreate.css';

const TrainingProposalCreate = () => {
  const handleSuccess = (proposal) => {
    // Redirect to proposal list or show success message
    console.log('Proposal created successfully:', proposal);
    // You can add navigation logic here
    // window.location.href = '/training-proposals';
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
