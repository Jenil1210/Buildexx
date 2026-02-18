import React from 'react';

/**
 * TabLoading - Reusable loading component for dashboard tabs
 * Shows a gold-themed spinner with customizable loading text
 */
const TabLoading = ({ text = 'Loading data...' }) => {
    return (
        <div className="tab-content-loading">
            <div className="spinner-container"></div>
            <p className="loading-text">
                {text}
            </p>
        </div>
    );
};

export default TabLoading;
