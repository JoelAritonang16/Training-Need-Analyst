import React from 'react';
import UserDashboard from '../pages/user/UserDashboard.jsx';
import { useDatabaseData } from './DatabaseDataProvider.jsx';

const UserDashboardWrapper = ({ user, onLogout, onUserUpdate }) => {
  const { proposals } = useDatabaseData();
  
  return (
    <UserDashboard 
      user={user} 
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
      proposals={proposals}
    />
  );
};

export default UserDashboardWrapper;
