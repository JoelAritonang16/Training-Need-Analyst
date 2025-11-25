import React from 'react';
import PropTypes from 'prop-types';
import './PageHeader.css';

const PageHeader = ({ title, subtitle, actionButton }) => {
  return (
    <div className="page-header">
      <div className="header-content">
        <div className="header-text">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actionButton && (
          <div className="header-actions">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actionButton: PropTypes.node
};

export default PageHeader;
