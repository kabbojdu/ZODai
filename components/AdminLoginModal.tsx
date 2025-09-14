
import React, { useState, useRef, useEffect } from 'react';

interface AdminLoginModalProps {
  onClose: () => void;
  onLogin: (password: string) => boolean;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      // Success, modal will be closed by parent
    } else {
      setError('Incorrect password.');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={onClose}>
        <div 
            className="bg-gray-900/50 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
        >
            <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-semibold text-center text-white mb-4">Admin Access</h2>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                </label>
                <input
                    ref={inputRef}
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                    }}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-shadow"
                />
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                <div className="flex justify-end gap-3 mt-6">
                     <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!password.trim()}
                        className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        Login
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default AdminLoginModal;