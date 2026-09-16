'use client';

import { useState } from 'react';

export default function VipClient({ initialName, initialHandle }: { initialName: string, initialHandle: string }) {
  const [name, setName] = useState(initialName);
  const [handle, setHandle] = useState(initialHandle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/vip/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, x_handle: handle }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={saveProfile} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Satoshi Nakamoto"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">X (Twitter) Handle</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace('@', ''))}
            placeholder="username"
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-9 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>
      
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">Saved successfully! Your billboard will update soon.</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#0D9488] hover:bg-[#0f766e] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
