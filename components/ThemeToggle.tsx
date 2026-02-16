'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type='button'
        aria-label='Toggle theme'
        className='p-2 rounded-md border border-border bg-card text-foreground'
      >
        <Sun className='h-4 w-4' />
      </button>
    );
  }

  return (
    <button
      type='button'
      aria-label={
        theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
      }
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className='p-2 rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors'
    >
      {theme === 'dark' ? (
        <Sun className='h-4 w-4' />
      ) : (
        <Moon className='h-4 w-4' />
      )}
    </button>
  );
};

export default ThemeToggle;
