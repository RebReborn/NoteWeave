"use client";

export function ThemeScript() {
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
          try {
            const theme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (theme === 'dark' || (!theme && systemPrefersDark)) {
              document.documentElement.classList.add('dark');
            }
            
            // Set data attribute for more specific targeting if needed
            document.documentElement.setAttribute('data-theme', theme || (systemPrefersDark ? 'dark' : 'light'));
          } catch (e) {
            console.error('Theme initialization error:', e);
          }
        `,
      }}
    />
  );
}