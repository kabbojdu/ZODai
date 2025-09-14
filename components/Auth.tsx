
import React, { useState, FormEvent } from 'react';

interface AuthProps {
  onLogin: (email: string, password: string) => { success: boolean, message: string };
  onSignup: (email: string, password: string) => { success: boolean, message: string };
}

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const TelegramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M21.926 3.116a2.35 2.35 0 0 0-2.32-2.32c-.37.008-.733.125-1.049.33L3.48 8.196a2.35 2.35 0 0 0 .28 4.417l4.545 1.515 1.516 4.545a2.35 2.35 0 0 0 4.416.281l7.07-15.076a2.35 2.35 0 0 0-.332-2.762Zm-4.99 2.529-6.28 5.656-3.23-1.076 9.51-7.095ZM9.89 17.618l-1.077-3.23L14.47 8.73l-7.096 9.51Z"/>
    </svg>
);

const Auth: React.FC<AuthProps> = ({ onLogin, onSignup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const action = isLogin ? onLogin : onSignup;
    const result = action(email, password);

    setTimeout(() => { // Simulate network delay
        if (!result.success) {
            setError(result.message);
        }
        setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
                <CameraIcon />
            </div>
          <h1 className="text-2xl font-bold text-white">Welcome to AI Creative Suite</h1>
          <p className="text-gray-400">{isLogin ? 'Sign in to continue' : 'Create an account to start'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-600"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium text-cyan-400 hover:text-cyan-300 ml-1">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        <div className="mt-8 text-center">
            <a 
                href="https://t.me/kabbo343434" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-3 px-4 py-2 bg-sky-500/10 text-sky-300 font-semibold rounded-lg hover:bg-sky-500/20 transition-all text-sm"
            >
                <TelegramIcon />
                <span>Contact Admin</span>
            </a>
        </div>

      </div>
    </div>
  );
};

export default Auth;