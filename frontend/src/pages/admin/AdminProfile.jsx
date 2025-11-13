import React from 'react';
import Profile from '../../components/Profile';

const AdminProfile = ({ user, onUpdateProfile }) => {
  return (
    <Profile 
      user={user}
      proposals={[]} // Admin might not have proposals, pass empty array
      onUpdateProfile={onUpdateProfile}
    />
  );
};

export default AdminProfile;
