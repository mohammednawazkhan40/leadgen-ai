import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { exchangeLinkedInCode, fetchLinkedInProfile, storeLinkedInConnection } from '../services/linkedin';
import { useAuth } from '../context/AuthContext';

export default function LinkedInCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to LinkedIn...');

  useEffect(() => {
    let params = new URLSearchParams(window.location.search);
    if (!params.has('code') && !params.has('error') && window.location.hash) {
      const hashContent = window.location.hash.substring(1);
      const qIndex = hashContent.indexOf('?');
      if (qIndex !== -1) {
        params = new URLSearchParams(hashContent.substring(qIndex + 1));
      }
    }
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      setStatus('error');
      setMessage(params.get('error_description') || 'LinkedIn authorization was denied.');
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received from LinkedIn.');
      return;
    }

    async function handleCallback() {
      try {
        setMessage('Exchanging authorization code...');

        const tokenResult = await exchangeLinkedInCode(code!);
        if (tokenResult.error) {
          throw new Error(tokenResult.error);
        }

        setMessage('Fetching your LinkedIn profile...');
        const { profile, error: profileError } = await fetchLinkedInProfile(tokenResult.access_token!);
        if (profileError || !profile) {
          throw new Error(profileError || 'Failed to fetch profile');
        }

        if (user) {
          setMessage('Saving connection...');
          await storeLinkedInConnection(user.id, profile);
        }

        localStorage.setItem('linkedin_profile', JSON.stringify(profile));
        localStorage.setItem('linkedin_connected', 'true');

        setStatus('success');
        setMessage(`Connected as ${profile.firstName} ${profile.lastName}!`);

        setTimeout(() => navigate('/app/integrations'), 2000);
      } catch (e) {
        setStatus('error');
        setMessage((e as Error).message || 'Failed to connect to LinkedIn.');
      }
    }

    handleCallback();
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Connecting to LinkedIn</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Connected!</h2>
            <p className="text-gray-400">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to Integrations...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Connection Failed</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <button
              onClick={() => navigate('/app/integrations')}
              className="btn-primary px-6 py-2 rounded-lg"
            >
              Back to Integrations
            </button>
          </>
        )}
      </div>
    </div>
  );
}
