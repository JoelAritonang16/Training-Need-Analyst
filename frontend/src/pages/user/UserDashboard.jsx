import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import DashboardOverview from './DashboardOverview.jsx';
import TrainingProposalList from './TrainingProposalList.jsx';
import TrainingProposalCreate from './TrainingProposalCreate.jsx';
import TrainingProposalEdit from './TrainingProposalEdit.jsx';
import TrainingProposalDetail from './TrainingProposalDetail.jsx';
import UserProfile from './UserProfile.jsx';
import danantaraLogo from '../../assets/Danantara2.png';
import pelindoLogo from '../../assets/LogoFixx.png';
import './UserDashboard.css';

const UserDashboard = ({ user, onLogout, onUserUpdate, proposals = [] }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [currentUser, setCurrentUser] = useState(user);

  // Sync currentUser when user prop changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
    setSelectedProposalId(null);
  };

  const handleEditProposal = (proposalId) => {
    setSelectedProposalId(proposalId);
    setActiveMenu('proposal-edit');
  };

  const handleViewDetail = (proposalId) => {
    setSelectedProposalId(proposalId);
    setActiveMenu('proposal-detail');
  };

  const handleCreateProposal = () => {
    setActiveMenu('proposal-create');
  };

  const handleBackToList = () => {
    setActiveMenu('proposal-list');
    setSelectedProposalId(null);
  };

  const handleUpdateProfile = (updatedUserData) => {
    // Update local user state with new profile data
    console.log('Update profile:', updatedUserData);
    setCurrentUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
    
    // Call parent update handler to update App.jsx state
    if (onUserUpdate) {
      onUserUpdate(updatedUserData);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'proposal-create':
        return (
          <TrainingProposalCreate 
            user={user}
            onSuccess={() => {
              setActiveMenu('proposal-list');
              // Refresh proposals list
            }}
          />
        );
      
      case 'proposal-list':
        return (
          <TrainingProposalList 
            proposals={proposals}
            onEdit={handleEditProposal}
            onViewDetail={handleViewDetail}
            onCreateNew={handleCreateProposal}
          />
        );

      case 'proposal-edit':
        return (
          <TrainingProposalEdit 
            proposalId={selectedProposalId}
            onSuccess={() => {
              setActiveMenu('proposal-list');
              setSelectedProposalId(null);
            }}
            onBack={handleBackToList}
          />
        );

      case 'proposal-detail':
        return (
          <TrainingProposalDetail 
            proposalId={selectedProposalId}
            onEdit={handleEditProposal}
            onBack={handleBackToList}
          />
        );
      
      case 'profile':
        return (
          <UserProfile 
            user={currentUser}
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
          <div className="topbar-logos">
            <img src={danantaraLogo} alt="Danantara" className="topbar-logo" />
            <div className="topbar-divider"></div>
            <img src={pelindoLogo} alt="Pelindo" className="topbar-logo" />
          </div>
          <div className="topbar-title">
            {activeMenu === 'dashboard' && ''}
            {activeMenu === 'proposal-list' && ''}
            {activeMenu === 'proposal-create' && ''}
            {activeMenu === 'proposal-edit' && 'Edit Usulan Pelatihan'}
            {activeMenu === 'proposal-detail' && ''}
            {activeMenu === 'profile' && ''}
          </div>
          <div className="user-menu">
            <button 
              className="user-button" 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-haspopup="true"
              aria-expanded={isUserMenuOpen}
            >
              <span className="user-avatar">
                {currentUser?.profilePhoto ? (
                  <img 
                    src={`http://localhost:5000/${currentUser.profilePhoto}`} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  currentUser?.username?.charAt(0)?.toUpperCase() || 'U'
                )}
              </span>
              <span className="user-name">{currentUser?.username || 'User'}</span>
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
