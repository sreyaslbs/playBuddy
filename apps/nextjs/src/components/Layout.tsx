import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, MapPin, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@playbuddy/shared';
import { Colors } from '@playbuddy/ui';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

import styles from '../styles/layout.module.css';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'PlayBuddy Manager' }: LayoutProps) {
  const { user, role, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const isLoginPage = router.pathname === '/login';

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/' },
    { name: 'Find Venues', icon: <MapPin size={20} />, href: '/book', customerOnly: true },
    { name: 'Manage Courts', icon: <MapPin size={20} />, href: '/courts', managerOnly: true },
    { name: 'Profile', icon: <UserCircle size={20} />, href: '/profile' },
  ];

  if (isLoginPage) {
    return (
      <div className="auth-container">
        <Head><title>{title}</title></Head>
        {children}
      </div>
    );
  }

  return (
    <div className={styles.layoutRoot}>
      <Head><title>{title}</title></Head>

      {/* Sidebar for Desktop */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logoText}>PlayBuddy</h1>
          <button className={styles.mobileClose} onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            if (item.managerOnly && role !== 'manager') return null;
            if (item.customerOnly && role !== 'customer') return null;
            const isActive = router.pathname === item.href;
            
            return (
              <Link key={item.name} href={item.href} className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navText}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={() => logout()}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainWrapper}>
        <header className={styles.topHeader}>
          <button className={styles.mobileMenuBtn} onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className={styles.headerUser}>
            <span className={styles.userName}>{user?.displayName || 'Welcome'}</span>
            <div className={styles.roleBadge}>{role || 'Quest'}</div>
          </div>
        </header>

        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}
