import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { User, ShieldCheck } from 'lucide-react';
import { useAuth } from '@playbuddy/shared';
import { Colors, Button, Card } from '@playbuddy/ui';

export default function WebSelectRole() {
    const { setAccountRole, user, role } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // If role is already set, redirect to dashboard
    React.useEffect(() => {
        if (role) {
            router.push('/');
        }
    }, [role, router]);

    const handleSelectRole = async (selectedRole: 'manager' | 'customer') => {
        setLoading(true);
        try {
            await setAccountRole(selectedRole);
            router.push('/');
        } catch (error) {
            alert('Failed to set role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="role-page">
            <div className="role-content">
                <h1>Welcome, {user.displayName}!</h1>
                <p className="description">Please select how you would like to use PlayBuddy.</p>

                <div className="role-grid">
                    <div className="role-card-wrapper" onClick={() => handleSelectRole('customer')}>
                        <Card style={styles.roleCard}>
                            <div className="role-icon customer"><User size={40} /></div>
                            <h3>I'm a Player</h3>
                            <p>Discover venues, check availability, and book slots instantly.</p>
                            <Button 
                                title="Continue as Player" 
                                variant="secondary" 
                                onPress={() => handleSelectRole('customer')}
                                loading={loading}
                                style={{ width: '100%' as any, marginTop: 20 }}
                            />
                        </Card>
                    </div>

                    <div className="role-card-wrapper" onClick={() => handleSelectRole('manager')}>
                        <Card style={styles.roleCard}>
                            <div className="role-icon manager"><ShieldCheck size={40} /></div>
                            <h3>I'm a Manager</h3>
                            <p>List your sports complex, manage courts, and track your bookings.</p>
                            <Button 
                                title="Continue as Manager" 
                                onPress={() => handleSelectRole('manager')}
                                loading={loading}
                                style={{ width: '100%' as any, marginTop: 20 }}
                            />
                        </Card>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .role-page {
                    min-height: 100vh;
                    background-color: ${Colors.background};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .role-content {
                    max-width: 800px;
                    text-align: center;
                }

                h1 {
                    font-size: 32px;
                    font-weight: 800;
                    margin-bottom: 12px;
                }

                .description {
                    color: ${Colors.muted};
                    margin-bottom: 48px;
                    font-size: 18px;
                }

                .role-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                }

                .role-card-wrapper {
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .role-card-wrapper:hover {
                    transform: translateY(-8px);
                }

                .role-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                }

                .role-icon.customer {
                    background-color: ${Colors.accent}15;
                    color: ${Colors.accent};
                }

                .role-icon.manager {
                    background-color: ${Colors.primary}15;
                    color: ${Colors.primary};
                }

                h3 {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 12px;
                }

                p {
                    color: ${Colors.muted};
                    font-size: 14px;
                    line-height: 1.6;
                }

                @media (max-width: 600px) {
                    .role-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

const styles = {
    roleCard: {
        padding: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    } as any
};
