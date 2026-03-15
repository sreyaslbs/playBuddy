import React, { useState, useMemo } from 'react';
import { Search, MapPin, Building2, Navigation, Heart } from 'lucide-react';
import { useAuth, useData } from '@playbuddy/shared';
import { Colors, Button, Card } from '@playbuddy/ui';

export default function WebBook() {
    const { metadata, updateUserData } = useAuth();
    const { complexes, courts, loading } = useData();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredComplexes = useMemo(() => {
        if (!searchQuery) return complexes;
        const query = searchQuery.toLowerCase();
        return complexes.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.city.toLowerCase().includes(query) ||
            c.address.toLowerCase().includes(query)
        );
    }, [complexes, searchQuery]);

    const toggleFavorite = async (complexId: string) => {
        const currentFavorites = (metadata as any)?.favorites || [];
        const isFav = currentFavorites.includes(complexId);
        const newFavorites = isFav 
            ? currentFavorites.filter((id: string) => id !== complexId)
            : [...currentFavorites, complexId];
        
        try {
            await updateUserData({ favorites: newFavorites });
        } catch (error) {
            alert('Failed to update favorites');
        }
    };

    if (loading) return <div>Loading Venues...</div>;

    return (
        <div className="book-container">
            <header className="page-header">
                <h1>Find Your Next Game</h1>
                <p>Discover the best sports hubs in your vicinity.</p>
                
                <div className="search-box-web">
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by city, center name or address..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="complex-list-web">
                {filteredComplexes.length > 0 ? (
                    filteredComplexes.map(complex => {
                        const complexCourts = courts.filter(c => c.complexId === complex.id);
                        const types = Array.from(new Set(complexCourts.map(c => c.type)));
                        const isFav = (metadata as any)?.favorites?.includes(complex.id);

                        return (
                            <Card key={complex.id} style={{ padding: 0, overflow: 'hidden' }}>
                                <div className="venue-card-inner">
                                    <div className="venue-image-placeholder">
                                        <Building2 size={40} color={Colors.primary} />
                                        {isFav && <div className="fav-pill"><Heart size={14} fill={Colors.error} color={Colors.error} /></div>}
                                    </div>
                                    
                                    <div className="venue-info">
                                        <div className="venue-header">
                                            <h3>{complex.name}</h3>
                                            <button className={`fav-btn ${isFav ? 'active' : ''}`} onClick={() => toggleFavorite(complex.id)}>
                                                <Heart size={18} fill={isFav ? Colors.error : 'transparent'} />
                                            </button>
                                        </div>
                                        
                                        <div className="venue-meta">
                                            <div className="meta-item">
                                                <Navigation size={14} />
                                                <span>{complex.address}</span>
                                            </div>
                                            <div className="meta-item">
                                                <MapPin size={14} />
                                                <span>{complex.city} {complex.landmark ? `• ${complex.landmark}` : ''}</span>
                                            </div>
                                        </div>

                                        <div className="sports-tags">
                                            {types.length > 0 ? (
                                                types.map(t => <span key={t} className="sport-tag">{t}</span>)
                                            ) : (
                                                <span className="no-sports">No sports defined yet</span>
                                            )}
                                        </div>

                                        <div className="venue-footer">
                                            <Button 
                                                title="View Availability" 
                                                variant="secondary" 
                                                style={{ width: '100%' as any }} 
                                                onPress={() => alert(`Opening availability for ${complex.name}... (Booking flow integration coming next!)`)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <div className="empty-search-state">
                        <Search size={48} color={Colors.border} />
                        <h3>No Venues Found</h3>
                        <p>We couldn't find any centers matching "{searchQuery}". Try a different city or center name.</p>
                        <Button title="Clear Search" variant="outline" onPress={() => setSearchQuery('')} style={{ marginTop: 16 }} />
                    </div>
                )}
            </div>

            <style jsx>{`
                .book-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 48px;
                    text-align: center;
                }

                .page-header h1 {
                    font-size: 36px;
                    font-weight: 800;
                    margin-bottom: 12px;
                }

                .page-header p {
                    color: ${Colors.muted};
                    font-size: 18px;
                    margin-bottom: 32px;
                }

                .search-box-web {
                    max-width: 600px;
                    margin: 0 auto;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-icon {
                    position: absolute;
                    left: 20px;
                    color: ${Colors.muted};
                }

                .search-box-web input {
                    width: 100%;
                    padding: 16px 20px 16px 56px;
                    border-radius: 16px;
                    border: 1px solid ${Colors.border};
                    font-size: 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    outline: none;
                    transition: all 0.2s;
                }

                .search-box-web input:focus {
                    border-color: ${Colors.primary};
                    box-shadow: 0 4px 20px ${Colors.primary}30;
                }

                .complex-list-web {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 32px;
                }

                .venue-card-inner {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .venue-image-placeholder {
                    height: 160px;
                    background-color: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .fav-pill {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background-color: white;
                    padding: 6px;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    display: flex;
                }

                .venue-info {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .venue-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }

                .venue-header h3 {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0;
                }

                .fav-btn {
                    background: none;
                    border: none;
                    color: ${Colors.muted};
                    cursor: pointer;
                    padding: 0;
                    transition: transform 0.2s;
                }

                .fav-btn:hover {
                    transform: scale(1.1);
                }

                .fav-btn.active {
                    color: ${Colors.error};
                }

                .venue-meta {
                    margin-bottom: 16px;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: ${Colors.muted};
                    margin-bottom: 4px;
                }

                .sports-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 24px;
                    flex: 1;
                }

                .sport-tag {
                    background-color: ${Colors.secondary}08;
                    color: ${Colors.secondary};
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    border: 1px solid ${Colors.secondary}20;
                }

                .venue-footer {
                    border-top: 1px solid ${Colors.border};
                    padding-top: 16px;
                }

                .empty-search-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 80px 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: ${Colors.muted};
                }

                .empty-search-state h3 {
                    margin: 16px 0 8px;
                    color: ${Colors.secondary};
                }

                .no-sports {
                    font-size: 12px;
                    color: ${Colors.muted};
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}
