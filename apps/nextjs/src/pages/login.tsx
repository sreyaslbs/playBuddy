import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, LogIn } from 'lucide-react';
import { useAuth } from '@playbuddy/shared';
import { Colors, Spacing, Typography, BorderRadius, Button, Card } from '@playbuddy/ui';

export default function WebLogin() {
  const [loading, setLoading] = useState(false);
  const { user, loginWithGooglePopup, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      if (!role) {
        // Redirect to role selection if not set (or just stay on dashboard)
        router.push('/');
      } else {
        router.push('/');
      }
    }
  }, [user, role, loading, router]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGooglePopup();
    } catch (error: any) {
      console.error('Login failed:', error);
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <header className="login-header">
          <div className="logo-box">
             <Trophy size={48} color={Colors.primary} />
          </div>
          <h1 className="title">playBuddy</h1>
          <p className="subtitle">Your Ultimate Sports Partner</p>
        </header>

        <div className="auth-card-wrapper">
          <Card style={styles.card}>
             <h2 className="card-heading">Welcome</h2>
             <p className="card-subheading">Sign in to manage sports venues or book your next game.</p>
             
             <Button
                title={loading ? 'Signing in...' : 'Sign in with Google'}
                onPress={handleLogin}
                loading={loading}
                variant="outline"
                style={styles.googleButton}
                icon={<LogIn size={20} color={Colors.primary} />}
              />

             <p className="helper-text">
                By signing in, you agree to our Terms of Service and Privacy Policy.
             </p>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${Colors.background};
          padding: 20px;
        }

        .login-content {
          width: 100%;
          max-width: 440px;
          text-align: center;
        }

        .login-header {
          margin-bottom: 48px;
        }

        .logo-box {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: ${Colors.surface};
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 8px 16px ${Colors.primary}30;
        }

        .title {
          font-size: 40px;
          font-weight: 800;
          color: ${Colors.secondary};
          margin: 0;
        }

        .subtitle {
          font-size: 16px;
          color: ${Colors.muted};
          margin-top: 8px;
        }

        .card-heading {
          font-size: 24px;
          font-weight: 700;
          color: ${Colors.secondary};
          margin-bottom: 12px;
          text-align: center;
        }

        .card-subheading {
          font-size: 14px;
          color: ${Colors.muted};
          margin-bottom: 32px;
          text-align: center;
          line-height: 1.5;
        }

        .helper-text {
          font-size: 11px;
          color: ${Colors.muted};
          margin-top: 32px;
          text-align: center;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

const styles = {
  card: {
    padding: 40,
    backgroundColor: Colors.surface,
    borderRadius: 24,
  },
  googleButton: {
    width: '100%' as any,
    borderColor: Colors.border,
    paddingVertical: 12,
  }
};
