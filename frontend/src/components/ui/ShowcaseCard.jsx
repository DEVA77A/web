import React from 'react';

const ShowcaseCard = ({ children, className = '', title }) => {
    return (
        <div className={`glass-panel p-6 ${className}`}>
            {title && (
                <h3 className="text-xl md:text-2xl font-bold mb-4 showcase-text-gradient">
                    {title}
                </h3>
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default ShowcaseCard;
