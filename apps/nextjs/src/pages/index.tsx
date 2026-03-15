import { useAuth, useData } from '@playbuddy/shared';
import { Button, Card, Colors } from '@playbuddy/ui';
import {
    ArrowRight,
    Bell,
    Calendar,
    Clock,
    Info,
    MapPin,
    TrendingUp,
    Trophy,
    X
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

export default function WebDashboard() {
  const { role, user, loading: authLoading } = useAuth();
  const { bookings, courts, complexes, loading: dataLoading } = useData();
  const router = useRouter();
  
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const isManager = role === 'manager';

  // Memoized upcoming bookings logic (same as mobile)
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    
    const active = bookings.filter(b => {
      const [day, month, year] = b.date.split('/').map(Number);
      const bookingEnd = new Date(year, month - 1, day);
      const endHour = parseInt(b.endTime?.split(':')[0] || '0', 10);
      bookingEnd.setHours(endHour || 0, 0, 0, 0);
      return bookingEnd > now;
    }).sort((a, b) => {
        return a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime);
    });

    return active;
  }, [bookings]);

  const managerStats = useMemo(() => {
    if (!isManager) return null;
    
    let todayCount = 0;
    let weekRevenue = 0;
    const today = new Date().toLocaleDateString('en-GB');

    bookings.forEach(b => {
      // Skip maintenance bookings for stats and revenue
      if (b.bookingType === 'maintenance') return;

      if (b.date === today) todayCount++;
      weekRevenue += Number(b.price || 0);
    });

    return { todayCount, weekRevenue, totalCourts: courts.length };
  }, [bookings, isManager, courts]);

  if (authLoading || dataLoading) {
    return <div className="loading">Loading Dashboard...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="welcome-header">
        <h1>Welcome back, {user?.displayName}!</h1>
        <p>{isManager ? 'Manage your sports empire from here.' : 'Your next match is just a click away.'}</p>
      </div>

      {isManager ? (
        <div className="stats-grid">
           <Card className="stat-card">
              <div className="stat-icon primary"><Calendar size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">Bookings Today</span>
                <span className="stat-value">{managerStats?.todayCount}</span>
              </div>
           </Card>
           <Card className="stat-card">
              <div className="stat-icon accent"><TrendingUp size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">Weekly Revenue</span>
                <span className="stat-value">₹{managerStats?.weekRevenue}</span>
              </div>
           </Card>
           <Card className="stat-card">
              <div className="stat-icon success"><MapPin size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">Active Courts</span>
                <span className="stat-value">{managerStats?.totalCourts}</span>
              </div>
           </Card>
        </div>
      ) : (
        <div className="stats-grid">
           <Card className="stat-card">
              <div className="stat-icon primary"><Trophy size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">Total Game Sessions</span>
                <span className="stat-value">{bookings.length}</span>
              </div>
           </Card>
           <Card className="stat-card">
              <div className="stat-icon accent"><MapPin size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">Favorite Hubs</span>
                <span className="stat-value">{(user as any)?.favorites?.length || 0}</span>
              </div>
           </Card>
        </div>
      )}

      <div className="dashboard-sections">
        <section className="main-section">
          <div className="section-header">
            <h2>Upcoming Schedule</h2>
            <Button 
                title="View All" 
                variant="outline" 
                onPress={() => {}} 
                style={{ paddingVertical: 4, paddingHorizontal: 12 }} 
                textStyle={{ fontSize: 12 }}
            />
          </div>

          <div className="bookings-list">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.slice(0, 5).map(booking => (
                <Card key={booking.id} className="booking-card">
                   <div className="booking-main">
                      <div className="booking-info">
                        <h3>{booking.courtName}</h3>
                        <p>{booking.complexName || 'Sports Hub'}</p>
                      </div>
                      <div className="booking-time">
                        <div className="time-tag">
                          <Clock size={14} />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="date-tag">
                          <Calendar size={14} />
                          <span>{booking.date}</span>
                        </div>
                      </div>
                   </div>
                   <div className="booking-action">
                      <span className={`status-pill ${booking.status.toLowerCase()}`}>{booking.status}</span>
                      <Button variant="secondary" title="Details" icon={<ArrowRight size={14} />} onPress={() => setSelectedBooking(booking)} />
                   </div>
                </Card>
              ))
            ) : (
              <div className="empty-state">
                <Bell size={40} />
                <p>No upcoming bookings found at the moment.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="side-section">
           <Card className="action-card">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                {isManager ? (
                   <>
                    <Button title="Add New Complex" onPress={() => router.push('/courts')} style={styles.actionBtn} />
                    <Button title="Block Slots" onPress={() => router.push('/courts')} variant="outline" style={styles.actionBtn} />
                   </>
                ) : (
                   <>
                    <Button title="Find New Courts" onPress={() => router.push('/book')} style={styles.actionBtn} />
                    <Button title="View Past Bookings" onPress={() => {}} variant="outline" style={styles.actionBtn} />
                   </>
                )}
              </div>
           </Card>
        </aside>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Info size={20} color={Colors.primary} />
                <h2>Booking Details</h2>
              </div>
              <button className="close-btn" onClick={() => setSelectedBooking(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Court</span>
                  <span className="detail-value">{selectedBooking.courtName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Complex</span>
                  <span className="detail-value">{selectedBooking.complexName || 'Sports Hub'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{selectedBooking.date}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <div className={`status-pill ${selectedBooking.status.toLowerCase()}`}>
                    {selectedBooking.status}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Amount</span>
                  <span className="detail-value price">₹{selectedBooking.price || 0}</span>
                </div>
                
                {isManager && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">Customer</span>
                      <span className="detail-value">{selectedBooking.customerName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Booking Type</span>
                      <span className="detail-value type-tag">
                        {selectedBooking.bookingType === 'maintenance' ? '🔧 Maintenance' : 
                         selectedBooking.bookingType === 'manager_behalf' ? '👤 Walk-in' : '📱 App Booking'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <Button title="Close" variant="outline" onPress={() => setSelectedBooking(null)} />
              {selectedBooking.status === 'Pending' && (
                <Button title="Approve Booking" variant="primary" onPress={() => {}} />
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          width: 90%;
          max-width: 500px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid ${Colors.border};
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: ${Colors.muted};
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background-color: ${Colors.background};
          color: ${Colors.secondary};
        }

        .modal-body {
          padding: 24px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-size: 12px;
          color: ${Colors.muted};
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 15px;
          font-weight: 700;
          color: ${Colors.secondary};
        }

        .detail-value.price {
          color: ${Colors.primary};
          font-size: 18px;
        }

        .type-tag {
          font-size: 13px;
          color: ${Colors.muted};
          font-weight: 500;
        }

        .modal-footer {
          padding: 16px 24px;
          background-color: ${Colors.background}50;
          border-top: 1px solid ${Colors.border};
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .welcome-header {
          margin-bottom: 32px;
        }

        .welcome-header h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .welcome-header p {
          color: ${Colors.muted};
          font-size: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        :global(.stat-card) {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px !important;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.primary { background-color: ${Colors.primary}15; color: ${Colors.primary}; }
        .stat-icon.accent { background-color: ${Colors.accent}15; color: ${Colors.accent}; }
        .stat-icon.success { background-color: ${Colors.success}15; color: ${Colors.success}; }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 13px;
          color: ${Colors.muted};
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 800;
          color: ${Colors.secondary};
        }

        .dashboard-sections {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 20px;
          font-weight: 700;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        :global(.booking-card) {
          padding: 20px !important;
          transition: transform 0.2s;
        }

        :global(.booking-card:hover) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        .booking-main {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .booking-info h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .booking-info p {
          font-size: 14px;
          color: ${Colors.muted};
        }

        .booking-time {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .time-tag, .date-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: ${Colors.secondary};
          font-weight: 600;
        }

        .date-tag {
          color: ${Colors.muted};
          font-weight: 400;
        }

        .booking-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid ${Colors.border};
        }

        .status-pill {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-pill.confirmed { background-color: #DCFCE7; color: ${Colors.success}; }
        .status-pill.pending { background-color: #FEF3C7; color: ${Colors.warning}; }

        .action-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-state {
          text-align: center;
          padding: 64px 0;
          color: ${Colors.border};
        }

        .empty-state p {
          margin-top: 16px;
          color: ${Colors.muted};
        }

        @media (max-width: 1024px) {
          .dashboard-sections {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  actionBtn: {
    width: '100%' as any,
    paddingVertical: 14,
  }
};
