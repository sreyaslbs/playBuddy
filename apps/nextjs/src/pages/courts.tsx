import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  CalendarRange,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useData, STATES, getCitiesByState, COURT_TYPES } from '@playbuddy/shared';
import { Button, Card, Colors, Spacing, Typography } from '@playbuddy/ui';

export default function WebManageCourts() {
    const { 
        complexes, 
        courts, 
        deleteCourt, 
        deleteComplex, 
        loading, 
        addComplex, 
        updateComplex, 
        addCourt, 
        updateCourt 
    } = useData();
    const router = useRouter();
    const [expandedComplex, setExpandedComplex] = useState<string | null>(null);

    // Modal States
    const [showComplexModal, setShowComplexModal] = useState(false);
    const [showCourtModal, setShowCourtModal] = useState(false);
    const [editingComplex, setEditingComplex] = useState<any>(null);
    const [editingCourt, setEditingCourt] = useState<any>(null);
    const [selectedComplexId, setSelectedComplexId] = useState<string | null>(null);

    // Form states
    const [complexForm, setComplexForm] = useState({ name: '', address: '', city: '', state: '', landmark: '' });
    const [courtForm, setCourtForm] = useState({ name: '', type: COURT_TYPES[0], price: '' });

    const handleSaveComplex = async () => {
        if (!complexForm.name || !complexForm.address || !complexForm.city || !complexForm.state) {
            alert('All fields (Name, Address, State, and City) are mandatory.');
            return;
        }
        try {
            if (editingComplex) {
                await updateComplex(editingComplex.id, complexForm);
                alert('Complex updated successfully');
            } else {
                await addComplex(complexForm);
                alert('Complex added successfully');
            }
            setShowComplexModal(false);
            setEditingComplex(null);
            setComplexForm({ name: '', address: '', city: '', state: '', landmark: '' });
        } catch (error) {
            alert('Error saving complex');
        }
    };

    const handleSaveCourt = async () => {
        if (!courtForm.name || !courtForm.price) {
            alert('Court Name and Price are mandatory.');
            return;
        }
        if (!selectedComplexId && !editingCourt) return;
        try {
            const courtData = { ...courtForm, price: Number(courtForm.price) };
            if (editingCourt) {
                await updateCourt(editingCourt.id, courtData);
                alert('Court updated successfully');
            } else {
                await addCourt({ ...courtData, complexId: selectedComplexId! });
                alert('Court added successfully');
            }
            setShowCourtModal(false);
            setEditingCourt(null);
            setCourtForm({ name: '', type: 'Badminton', price: '' });
        } catch (error) {
            alert('Error saving court');
        }
    };

    const handleDeleteCourt = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await deleteCourt(id);
                alert('Court deleted successfully');
            } catch (error: any) {
                alert(error.message || 'Failed to delete court');
            }
        }
    };

    const handleDeleteComplex = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name} and all its courts?`)) {
            try {
                await deleteComplex(id);
                alert('Complex deleted successfully');
            } catch (error: any) {
                alert(error.message || 'Failed to delete complex');
            }
        }
    };

    if (loading) return <div className="loading">Loading Manage Centers...</div>;

    return (
        <div className="manage-container">
            <header className="page-header">
                <div>
                    <h1>Manage Hubs</h1>
                    <p>Configure your sports complexes and courts.</p>
                </div>
                <Button
                    title="Add Complex"
                    onPress={() => {
                        setEditingComplex(null);
                        setComplexForm({ name: '', address: '', city: '', state: '', landmark: '' });
                        setShowComplexModal(true);
                    }}
                    variant="primary"
                    icon={<Plus size={20} />}
                />
            </header>

            <div className="complexes-grid">
                {complexes.length > 0 ? (
                    complexes.map((complex) => {
                        const complexCourts = courts.filter(c => c.complexId === complex.id);
                        const isExpanded = expandedComplex === complex.id;

                        return (
                            <Card key={complex.id} style={{ padding: 0, overflow: 'hidden' }}>
                                <div className="complex-main-row" onClick={() => setExpandedComplex(isExpanded ? null : complex.id)}>
                                    <div className="complex-info-web">
                                        <div className="icon-box"><Building2 size={24} /></div>
                                        <div className="info-text">
                                            <h3>{complex.name}</h3>
                                            <div className="location">
                                                <MapPin size={14} />
                                                <span>{complex.city}, {complex.state}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="complex-meta">
                                        <div className="court-count">{complexCourts.length} Courts</div>
                                        <div className="actions">
                                            <button className="action-icn edit" title="Edit Complex" onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingComplex(complex);
                                                setComplexForm({ 
                                                    name: complex.name, 
                                                    address: complex.address, 
                                                    city: complex.city, 
                                                    state: complex.state,
                                                    landmark: complex.landmark || ''
                                                });
                                                setShowComplexModal(true);
                                            }}><Edit2 size={18} /></button>
                                            <button className="action-icn delete" onClick={(e) => { e.stopPropagation(); handleDeleteComplex(complex.id, complex.name); }} title="Delete Complex"><Trash2 size={18} /></button>
                                            <div className="expand-icn">
                                                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="courts-expansion">
                                        <div className="expansion-header">
                                            <h4>Individual Courts</h4>
                                            <Button 
                                                title="Add Court" 
                                                variant="secondary" 
                                                onPress={() => {
                                                    setSelectedComplexId(complex.id);
                                                    setEditingCourt(null);
                                                    setCourtForm({ name: '', type: 'Badminton', price: '' });
                                                    setShowCourtModal(true);
                                                }} 
                                                icon={<Plus size={14} />}
                                                style={{ paddingVertical: 4, paddingHorizontal: 12 }}
                                                textStyle={{ fontSize: 11 }}
                                            />
                                        </div>

                                        <div className="web-courts-table">
                                            <div className="table-header">
                                                <span className="col-name">Court Name</span>
                                                <span className="col-type">Sport Type</span>
                                                <span className="col-price">Rate / Hr</span>
                                                <span className="col-actions">Actions</span>
                                            </div>
                                            {complexCourts.length > 0 ? (
                                                complexCourts.map(court => (
                                                    <div key={court.id} className="table-row">
                                                        <span className="col-name">{court.name}</span>
                                                        <span className="col-type"><span className="type-badge">{court.type}</span></span>
                                                        <span className="col-price">₹{court.price}</span>
                                                        <span className="col-actions">
                                                            <button className="row-action" title="Quick Reserve"><CalendarRange size={16} /></button>
                                                            <button className="row-action" title="Edit" onClick={() => {
                                                                setEditingCourt(court);
                                                                setCourtForm({ name: court.name, type: court.type, price: String(court.price) });
                                                                setShowCourtModal(true);
                                                            }}><Edit2 size={16} /></button>
                                                            <button className="row-action delete" onClick={() => handleDeleteCourt(court.id, court.name)} title="Delete"><Trash2 size={16} /></button>
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="empty-courts">No courts added yet.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <Building2 size={64} />
                        <p>No complexes added to your account yet.</p>
                        <Button title="Get Started: Add Complex" onPress={() => {
                            setEditingComplex(null);
                            setComplexForm({ name: '', address: '', city: '', state: '', landmark: '' });
                            setShowComplexModal(true);
                        }} style={{ marginTop: 24 }} />
                    </div>
                )}
            </div>

            {/* Modal for Complex */}
            {showComplexModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingComplex ? 'Edit Complex' : 'Add New Complex'}</h2>
                        <div className="form-group">
                            <label>Center Name</label>
                            <input value={complexForm.name} onChange={e => setComplexForm({...complexForm, name: e.target.value})} placeholder="e.g. Smash Badminton Academy" />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input value={complexForm.address} onChange={e => setComplexForm({...complexForm, address: e.target.value})} placeholder="Street, Area" />
                        </div>
                        <div className="form-group">
                            <label>Landmark (Optional)</label>
                            <input value={complexForm.landmark} onChange={e => setComplexForm({...complexForm, landmark: e.target.value})} placeholder="e.g. Near Star Mall" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>State</label>
                                <select 
                                    value={complexForm.state} 
                                    onChange={e => {
                                        const newState = e.target.value;
                                        const cities = getCitiesByState(newState);
                                        setComplexForm({
                                            ...complexForm, 
                                            state: newState,
                                            city: cities.includes(complexForm.city) ? complexForm.city : (cities[0] || '')
                                        });
                                    }}
                                >
                                    <option value="">Select State</option>
                                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <select 
                                    value={complexForm.city} 
                                    onChange={e => setComplexForm({...complexForm, city: e.target.value})}
                                    disabled={!complexForm.state}
                                >
                                    <option value="">Select City</option>
                                    {complexForm.state && getCitiesByState(complexForm.state).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <Button title="Cancel" variant="outline" onPress={() => setShowComplexModal(false)} />
                            <Button title={editingComplex ? 'Update' : 'Add'} onPress={handleSaveComplex} />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Court */}
            {showCourtModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingCourt ? 'Edit Court' : 'Add New Court'}</h2>
                        <div className="form-group">
                            <label>Court/Table Name</label>
                            <input value={courtForm.name} onChange={e => setCourtForm({...courtForm, name: e.target.value})} placeholder="e.g. Court 1" />
                        </div>
                        <div className="form-group">
                            <label>Sport Type</label>
                            <select value={courtForm.type} onChange={e => setCourtForm({...courtForm, type: e.target.value})}>
                                {COURT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Price per Hour (₹)</label>
                            <input type="number" value={courtForm.price} onChange={e => setCourtForm({...courtForm, price: e.target.value})} placeholder="e.g. 500" />
                        </div>
                        <div className="modal-actions">
                            <Button title="Cancel" variant="outline" onPress={() => setShowCourtModal(false)} />
                            <Button title={editingCourt ? 'Update' : 'Add'} onPress={handleSaveCourt} />
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .manage-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }

                .page-header h1 {
                    font-size: 32px;
                    font-weight: 800;
                    margin-bottom: 8px;
                }

                .page-header p {
                    color: ${Colors.muted};
                }

                .complexes-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                :global(.complex-card-web) {
                    padding: 0 !important;
                    overflow: hidden;
                }

                .complex-main-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .complex-main-row:hover {
                    background-color: ${Colors.background};
                }

                .complex-info-web {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .icon-box {
                    width: 48px;
                    height: 48px;
                    background-color: ${Colors.primary}15;
                    color: ${Colors.primary};
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .info-text h3 {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0 0 4px 0;
                }

                .location {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: ${Colors.muted};
                }

                .complex-meta {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                }

                .court-count {
                    font-size: 14px;
                    font-weight: 700;
                    color: ${Colors.secondary};
                    background-color: ${Colors.secondary}08;
                    padding: 4px 12px;
                    border-radius: 20px;
                }

                .actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .action-icn {
                    background: none;
                    border: none;
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    color: ${Colors.muted};
                    transition: all 0.2s;
                }

                .action-icn:hover {
                    background-color: ${Colors.background};
                    color: ${Colors.secondary};
                }

                .action-icn.delete:hover {
                    background-color: ${Colors.error}10;
                    color: ${Colors.error};
                }

                .expand-icn {
                    color: ${Colors.muted};
                    margin-left: 8px;
                }

                .courts-expansion {
                    background-color: #fafbfc;
                    border-top: 1px solid ${Colors.border};
                    padding: 24px;
                }

                .expansion-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .expansion-header h4 {
                    font-size: 14px;
                    font-weight: 700;
                    color: ${Colors.muted};
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .web-courts-table {
                    background-color: ${Colors.surface};
                    border: 1px solid ${Colors.border};
                    border-radius: 12px;
                    overflow: hidden;
                }

                .table-header {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    padding: 12px 20px;
                    background-color: #f8fafc;
                    border-bottom: 1px solid ${Colors.border};
                    font-size: 12px;
                    font-weight: 700;
                    color: ${Colors.muted};
                    text-transform: uppercase;
                }

                .table-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    padding: 16px 20px;
                    align-items: center;
                    border-bottom: 1px solid ${Colors.border};
                    font-size: 14px;
                }

                .table-row:last-child {
                    border-bottom: none;
                }

                .col-name {
                    font-weight: 700;
                }

                .type-badge {
                    background-color: ${Colors.primary}10;
                    color: ${Colors.primary};
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                }

                .col-price {
                    font-weight: 700;
                    color: ${Colors.secondary};
                }

                .col-actions {
                    display: flex;
                    gap: 12px;
                }

                .row-action {
                    background: none;
                    border: none;
                    padding: 6px;
                    border-radius: 6px;
                    cursor: pointer;
                    color: ${Colors.primary};
                    transition: background 0.2s;
                }

                .row-action:hover {
                    background-color: ${Colors.primary}10;
                }

                .row-action.delete {
                    color: ${Colors.error};
                }

                .row-action.delete:hover {
                    background-color: ${Colors.error}10;
                }

                .empty-courts {
                    padding: 32px;
                    text-align: center;
                    color: ${Colors.muted};
                    font-style: italic;
                }

                .empty-state {
                    text-align: center;
                    padding: 80px 0;
                    color: ${Colors.border};
                }

                .empty-state p {
                    margin-top: 16px;
                    color: ${Colors.muted};
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(15, 23, 42, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    backdrop-filter: blur(4px);
                }

                .modal-content {
                    background-color: ${Colors.surface};
                    width: 100%;
                    max-width: 500px;
                    border-radius: 24px;
                    padding: 32px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .modal-content h2 {
                    font-size: 24px;
                    font-weight: 800;
                    margin-bottom: 24px;
                    color: ${Colors.secondary};
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: ${Colors.secondary};
                    margin-bottom: 8px;
                }

                .form-group input, .form-group select {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1px solid ${Colors.border};
                    font-size: 16px;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .form-group input:focus, .form-group select:focus {
                    border-color: ${Colors.primary};
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid ${Colors.border};
                }
            `}</style>
        </div>
    );
}
