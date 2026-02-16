import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { ThemeProvider } from 'next-themes';
import Layout from '@/components/Layout';

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      storageKey='finsystem-theme'
    >
      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </ThemeProvider>
  );
};

export default App;
