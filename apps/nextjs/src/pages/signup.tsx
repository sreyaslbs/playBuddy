import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@playbuddy/shared';
import { Colors, Button, Card, Input } from '@playbuddy/ui';
import Link from 'next/link';

export default function WebSignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { user, signUpWithEmail } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.emailVerified) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await signUpWithEmail(email, password, displayName);
      setSuccess(true);
    } catch (err: any) {
      console.error('Sign up failed:', err);
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-content">
          <Card style={styles.card}>
            <div className="success-icon">
               <Mail size={48} color={Colors.primary} />
            </div>
            <h2 className="card-heading">Check your email</h2>
            <p className="card-subheading">
              We've sent a verification link to <strong>{email}</strong>. 
              Please verify your email to continue.
            </p>
            <Button
              title="Back to Login"
              onPress={() => router.push('/login')}
              variant="primary"
              style={{ width: '100%' }}
            />
          </Card>
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
          .success-icon {
            margin-bottom: 24px;
            display: flex;
            justify-content: center;
          }
          .card-heading {
            font-size: 24px;
            font-weight: 700;
            color: ${Colors.secondary};
            margin-bottom: 12px;
          }
          .card-subheading {
            font-size: 14px;
            color: ${Colors.muted};
            margin-bottom: 32px;
            line-height: 1.5;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-content">
        <header className="login-header">
          <div className="logo-box">
             <Trophy size={48} color={Colors.primary} />
          </div>
          <h1 className="title">playBuddy</h1>
          <p className="subtitle">Create your account</p>
        </header>

        <div className="auth-card-wrapper">
          <Card style={styles.card}>
             <form onSubmit={handleSignUp}>
               <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  icon={<User size={18} color={Colors.muted} />}
                />
               <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon={<Mail size={18} color={Colors.muted} />}
                />
               <Input
                  label="Password"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon={<Lock size={18} color={Colors.muted} />}
                />

               {error ? <p className="error-message">{error}</p> : null}

               <Button
                  title={loading ? 'Creating account...' : 'Sign Up'}
                  onPress={handleSignUp as any}
                  loading={loading}
                  variant="primary"
                  style={styles.submitButton}
                />
             </form>

             <div className="footer-links">
                <p className="footer-text">
                  Already have an account? <Link href="/login" className="link">Sign In</Link>
                </p>
             </div>
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
          margin-bottom: 32px;
        }

        .logo-box {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: ${Colors.surface};
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 8px 16px ${Colors.primary}30;
        }

        .title {
          font-size: 32px;
          font-weight: 800;
          color: ${Colors.secondary};
          margin: 0;
        }

        .subtitle {
          font-size: 14px;
          color: ${Colors.muted};
          margin-top: 4px;
        }

        .error-message {
          color: ${Colors.error};
          font-size: 12px;
          margin-bottom: 16px;
          text-align: left;
        }

        .footer-links {
          margin-top: 24px;
        }

        .footer-text {
          font-size: 14px;
          color: ${Colors.muted};
        }

        .link {
          color: ${Colors.primary};
          font-weight: 600;
          text-decoration: none;
        }

        .link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

const styles = {
  card: {
    padding: 32,
    backgroundColor: Colors.surface,
    borderRadius: 24,
  },
  submitButton: {
    width: '100%' as any,
    marginTop: 8,
  }
};
