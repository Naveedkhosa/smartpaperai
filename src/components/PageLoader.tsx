import React from 'react';

const PageLoader: React.FC = () => {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-300"></div>
            </div>
        </div>
    );
};

export default PageLoader;