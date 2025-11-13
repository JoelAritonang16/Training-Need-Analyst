import React from 'react';
import Profile from '../../components/Profile';

const UserProfile = ({ user, proposals = [], onUpdateProfile }) => {
  // No need for local state management as it's handled in the Profile component

  return (
    <Profile 
      user={user}
      proposals={proposals}
      onUpdateProfile={onUpdateProfile}
    />
  );
};

export default UserProfile;
