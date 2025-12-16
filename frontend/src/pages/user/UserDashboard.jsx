import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const UserDashboard = React.memo(({ user, onLogout, onUserUpdate, proposals = [] }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [currentUser, setCurrentUser] = useState(user);

  // Sync currentUser when user prop changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleMenuChange = useCallback((menuId) => {
    setActiveMenu(menuId);
    setSelectedProposalId(null);
  }, []);

  const handleEditProposal = useCallback((proposalId) => {
    setSelectedProposalId(proposalId);
    setActiveMenu('proposal-edit');
  }, []);

  const handleViewDetail = useCallback((proposalId) => {
    setSelectedProposalId(proposalId);
    setActiveMenu('proposal-detail');
  }, []);

  const handleCreateProposal = useCallback(() => {
    setActiveMenu('proposal-create');
  }, []);

  const handleBackToList = useCallback(() => {
    setActiveMenu('proposal-list');
    setSelectedProposalId(null);
  }, []);

  const handleUpdateProfile = useCallback((updatedUserData) => {
    setCurrentUser(prevUser => {
      const updatedUser = {
        ...prevUser,
        ...updatedUserData
      };
      return updatedUser;
    });
    
    if (onUserUpdate) {
      onUserUpdate(updatedUserData);
    }
    
    const timestamp = new Date().getTime();
    if (updatedUserData.profilePhoto) {
      const photoWithTimestamp = `${updatedUserData.profilePhoto}${updatedUserData.profilePhoto.includes('?') ? '&' : '?'}t=${timestamp}`;
      setCurrentUser(prev => ({
        ...prev,
        profilePhoto: photoWithTimestamp
      }));
    }
  }, [onUserUpdate]);

  const renderContent = () => {
    switch (activeMenu) {
      case 'proposal-create':
        return (
          <TrainingProposalCreate 
            user={user}
            onSuccess={() => {
              // Redirect ke dashboard utama setelah konfirmasi
              setActiveMenu('dashboard');
              // Refresh data jika perlu
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
            <img src={danantaraLogo} alt="Danantara" className="topbar-logo" loading="eager" />
            <div className="topbar-divider"></div>
            <img src={pelindoLogo} alt="Pelindo" className="topbar-logo" loading="eager" />
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
});

UserDashboard.displayName = 'UserDashboard';

export default UserDashboard;
