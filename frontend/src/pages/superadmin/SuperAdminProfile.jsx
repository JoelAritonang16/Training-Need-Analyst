import React from 'react';
import Profile from '../../components/Profile';

const SuperAdminProfile = ({ user, onUpdateProfile }) => {
  return (
    <Profile 
      user={user}
      proposals={[]} // Superadmin might not have proposals, pass empty array
      onUpdateProfile={onUpdateProfile}
    />
  );
};

export default SuperAdminProfile;
