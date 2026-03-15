import { AuthProvider, DataProvider } from '@playbuddy/shared';
import React from 'react';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <DataProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </DataProvider>
    </AuthProvider>
  );
}

export default MyApp;
