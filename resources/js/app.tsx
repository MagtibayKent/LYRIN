import '../css/index.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

// Export types for use in components
export interface User {
  name: string;
  email: string;
  isGuest?: boolean;
}

export interface QuizHistory {
  id: number | string;
  language: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export interface DictionaryHistory {
  id: number | string;
  word: string;
  language: string;
  date: string;
}

const appName = import.meta.env.VITE_APP_NAME || 'Lyrin';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#2563eb',
    },
});

