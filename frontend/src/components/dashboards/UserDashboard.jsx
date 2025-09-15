import React, { useState } from 'react';
import Sidebar from '../Sidebar.jsx';
import TrainingProposalForm from '../TrainingProposalForm.jsx';
import DashboardOverview from '../../pages/user/DashboardOverview.jsx';
import TrainingProposalList from '../../pages/user/TrainingProposalList.jsx';
import UserProfile from '../../pages/user/UserProfile.jsx';
import './UserDashboard.css';

const UserDashboard = ({ user, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [proposals, setProposals] = useState([
    {
      id: 1,
      uraian: 'Pelatihan Leadership Management',
      waktuPelaksanaan: 'Februari 2025',
      status: 'PENDING',
      tanggalPengajuan: '2024-01-15',
      totalBiaya: 15000000
    },
    {
      id: 2,
      uraian: 'Training Digital Marketing',
      waktuPelaksanaan: 'Maret 2025',
      status: 'APPROVED',
      tanggalPengajuan: '2024-01-10',
      totalBiaya: 8500000
    }
  ]);

  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
  };

  const handleEditProposal = (proposalId) => {
    // Handle edit proposal logic
    console.log('Edit proposal:', proposalId);
  };

  const handleViewDetail = (proposalId) => {
    // Handle view detail logic
    console.log('View detail:', proposalId);
  };

  const handleUpdateProfile = (profileData) => {
    // Handle update profile logic
    console.log('Update profile:', profileData);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'proposal-form':
        return <TrainingProposalForm user={user} />;
      
      case 'my-proposals':
        return (
          <TrainingProposalList 
            proposals={proposals}
            onEdit={handleEditProposal}
            onViewDetail={handleViewDetail}
          />
        );
      
      case 'profile':
        return (
          <UserProfile 
            user={user}
            proposals={proposals}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      
      default:
        return (
          <DashboardOverview 
            user={user}
            proposals={proposals}
            onNavigate={handleMenuChange}
          />
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        user={user} 
        activeMenu={activeMenu} 
        onMenuChange={handleMenuChange}
        onLogout={onLogout}
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default UserDashboard;
