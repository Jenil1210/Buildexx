import React from 'react';

const PropertyCardSkeleton = () => {
    return (
        <div className="card h-100 property-card border-0 shadow-sm" style={{ overflow: 'hidden' }}>
            {/* Image Skeleton */}
            <div className="skeleton-box" style={{ height: '250px', width: '100%' }}></div>

            <div className="card-body d-flex flex-column gap-3">
                {/* Title Skeleton */}
                <div className="skeleton-box" style={{ height: '24px', width: '80%', borderRadius: '4px' }}></div>

                {/* Location Skeleton */}
                <div className="skeleton-box" style={{ height: '16px', width: '60%', borderRadius: '4px' }}></div>

                {/* Price & Type Skeleton */}
                <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="skeleton-box" style={{ height: '28px', width: '40%', borderRadius: '4px' }}></div>
                    <div className="skeleton-box" style={{ height: '20px', width: '30%', borderRadius: '12px' }}></div>
                </div>

                {/* Buttons Skeleton */}
                <div className="d-flex justify-content-between mt-auto pt-3">
                    <div className="skeleton-box" style={{ height: '36px', width: '100px', borderRadius: '6px' }}></div>
                    <div className="d-flex gap-2">
                        <div className="skeleton-box" style={{ height: '36px', width: '40px', borderRadius: '6px' }}></div>
                        <div className="skeleton-box" style={{ height: '36px', width: '40px', borderRadius: '6px' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCardSkeleton;
