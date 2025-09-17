import React, { useState } from 'react';
import Sidebar from '../Sidebar.jsx';
import TrainingProposalForm from '../TrainingProposalForm.jsx';
import DashboardOverview from '../../pages/user/DashboardOverview.jsx';
import TrainingProposalList from '../../pages/user/TrainingProposalList.jsx';
import UserProfile from '../../pages/user/UserProfile.jsx';
import './UserDashboard.css';

const UserDashboard = ({ user, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
        <div className="topbar">
          <div className="topbar-spacer" />
          <div className="user-menu">
            <button 
              className="user-button" 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-haspopup="true"
              aria-expanded={isUserMenuOpen}
            >
              <span className="user-avatar">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
              <span className="user-name">{user?.username || 'User'}</span>
              <span className={`chevron ${isUserMenuOpen ? 'open' : ''}`}>▾</span>
            </button>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={() => { setActiveMenu('profile'); setIsUserMenuOpen(false); }}>Profile</button>
                <button className="dropdown-item danger" onClick={onLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};

export default UserDashboard;
