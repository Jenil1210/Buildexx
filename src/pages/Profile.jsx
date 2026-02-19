import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUser, updateUser } from '../api/apiService';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: '',
        company_name: '',
        gst_number: '',
        address: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (currentUser?.id) {
                try {
                    const result = await getUser(currentUser.id);
                    if (result.success) {
                        setFormData({
                            full_name: result.data.full_name || '',
                            email: result.data.email || '',
                            phone: result.data.phone || '',
                            role: result.data.role || '',
                            company_name: result.data.company_name || '',
                            gst_number: result.data.gst_number || '',
                            address: result.data.address || ''
                        });
                    } else {
                        toast.error(result.error || 'Failed to fetch profile');
                    }
                } catch (error) {
                    toast.error('Error loading profile');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProfile();
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = await updateUser(currentUser.id, formData);
            if (result.success) {
                toast.success('Profile updated successfully');
                // Optional: Update context if needed, though strictly we might not need to if we only use ID
                // But updating full_name in context reflects in Header immediately
                if (setCurrentUser) {
                    setCurrentUser(prev => ({ ...prev, ...formData }));
                }
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                            <h2 className="mb-0" style={{ color: '#0F172A', fontWeight: '700' }}>My Profile</h2>
                            <p className="text-muted">Manage your account settings and preferences.</p>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    {/* Generic Fields */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">User Role</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            value={formData.role.toUpperCase()}
                                            disabled
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control bg-light"
                                            value={formData.email}
                                            disabled
                                        />
                                        <div className="form-text">Email cannot be changed.</div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Builder Specific Fields */}
                                    {formData.role === 'builder' && (
                                        <>
                                            <div className="col-12 mt-4">
                                                <h5 className="border-bottom pb-2 mb-3" style={{ color: '#C8A24A' }}>Builder Details</h5>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Company Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="company_name"
                                                    value={formData.company_name}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">GST Number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="gst_number"
                                                    value={formData.gst_number}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label fw-semibold">Office Address</label>
                                                <textarea
                                                    className="form-control"
                                                    name="address"
                                                    rows="3"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                ></textarea>
                                            </div>
                                        </>
                                    )}

                                    <div className="col-12 mt-4 d-flex justify-content-end">
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4 py-2"
                                            style={{ backgroundColor: '#C8A24A', border: 'none', fontWeight: '600' }}
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
