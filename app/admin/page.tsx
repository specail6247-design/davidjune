'use client';

import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
  getAdminSettings,
  getLocalIdentity,
  listAdminUsers,
  removeAdminUser,
  setLocalAdminEmail,
  updateAdminSettings,
  upsertAdminUser,
} from '../../lib/adminClient';
import type { AdminSettings, AdminUser, LocalIdentity } from '../../lib/adminTypes';

const authModes: AdminSettings['auth_mode'][] = ['uid', 'email', 'domain', 'manual'];

const AdminPage = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [admins, setAdmins] = useState<Array<AdminUser & { id: string }>>([]);
  const [identity, setIdentity] = useState<LocalIdentity>({ uid: '', email: '', domain: '' });
  const [selectedIdentityType, setSelectedIdentityType] = useState<AdminUser['identity_type']>('uid');
  const [identityValue, setIdentityValue] = useState('');
  const [role, setRole] = useState<AdminUser['role']>('staff');
  const [scopes, setScopes] = useState<string[]>([]);
  const [newScope, setNewScope] = useState('');

  useEffect(() => {
    setIdentity(getLocalIdentity());
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        return;
      }
      setIdentity({
        uid: user.uid,
        email: user.email ?? '',
        domain: user.email?.split('@')[1] ?? '',
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const load = async () => {
      const nextSettings = await getAdminSettings();
      const nextAdmins = await listAdminUsers();
      setSettings(nextSettings);
      setAdmins(nextAdmins);
      setSelectedIdentityType(nextSettings.auth_mode);
      setScopes(nextSettings.available_scopes);
    };
    load().catch(() => {});
  }, []);

  const activeIdentityValue = useMemo(() => {
    if (!settings) {
      return '';
    }
    if (settings.auth_mode === 'email') {
      return identity.email;
    }
    if (settings.auth_mode === 'domain') {
      return identity.domain;
    }
    return identity.uid;
  }, [identity, settings]);

  const isSuperAdmin = useMemo(() => {
    if (!settings || !activeIdentityValue) {
      return false;
    }
    return admins.some(
      (admin) =>
        admin.role === 'super_admin' &&
        admin.identity_type === settings.auth_mode &&
        admin.identity_value === activeIdentityValue,
    );
  }, [admins, activeIdentityValue, settings]);

  const superAdminCount = useMemo(
    () => admins.filter((admin) => admin.role === 'super_admin').length,
    [admins],
  );

  const refreshAdmins = async () => {
    const nextAdmins = await listAdminUsers();
    setAdmins(nextAdmins);
  };

  const handleSettingsChange = async (mode: AdminSettings['auth_mode']) => {
    if (!settings) {
      return;
    }
    const updated = { ...settings, auth_mode: mode };
    setSettings(updated);
    await updateAdminSettings({ auth_mode: mode });
  };

  const handleEmailChange = (value: string) => {
    setLocalAdminEmail(value);
    setIdentity((prev) => ({
      ...prev,
      email: value,
      domain: value.includes('@') ? value.split('@')[1] : '',
    }));
  };

  const handleBootstrap = async () => {
    if (!settings) {
      return;
    }
    const value = activeIdentityValue;
    if (!value) {
      return;
    }
    await upsertAdminUser(
      {
        identity_type: settings.auth_mode,
        identity_value: value,
        role: 'super_admin',
        scopes: settings.available_scopes,
      },
      identity.uid,
    );
    await refreshAdmins();
  };

  const toggleScope = (scope: string) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((item) => item !== scope) : [...prev, scope],
    );
  };

  const handleAddScope = async () => {
    if (!settings || !newScope.trim()) {
      return;
    }
    const trimmed = newScope.trim();
    if (settings.available_scopes.includes(trimmed)) {
      setNewScope('');
      return;
    }
    const updated = {
      ...settings,
      available_scopes: [...settings.available_scopes, trimmed],
    };
    setSettings(updated);
    setNewScope('');
    await updateAdminSettings({ available_scopes: updated.available_scopes });
  };

  const handleSaveAdmin = async () => {
    if (!settings || !identityValue.trim()) {
      return;
    }
    await upsertAdminUser(
      {
        identity_type: selectedIdentityType,
        identity_value: identityValue.trim(),
        role,
        scopes,
      },
      identity.uid,
    );
    setIdentityValue('');
    await refreshAdmins();
  };

  const handleRemoveAdmin = async (docId: string) => {
    await removeAdminUser(docId);
    await refreshAdmins();
  };

  if (!settings) {
    return <div className="admin-shell">Loading...</div>;
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-title">Admin Console</div>
        <div className="admin-identity">
          <span>{identity.uid}</span>
        </div>
      </header>

      <section className="admin-card">
        <h2>Auth Mode</h2>
        <div className="admin-row">
          {authModes.map((mode) => (
            <button
              key={mode}
              className={`chip ${settings.auth_mode === mode ? 'active' : ''}`}
              onClick={() => handleSettingsChange(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="admin-row">
          <label className="label">Email</label>
          <input
            className="input"
            placeholder="name@domain.com"
            value={identity.email}
            onChange={(event) => handleEmailChange(event.target.value)}
          />
        </div>
        <div className="admin-row meta">
          <span>Active identity</span>
          <span>{activeIdentityValue || 'unset'}</span>
        </div>
        {!superAdminCount && (
          <button className="primary" onClick={handleBootstrap}>
            Bootstrap Super Admin
          </button>
        )}
      </section>

      <section className="admin-card">
        <h2>Scopes</h2>
        <div className="admin-row">
          {settings.available_scopes.map((scope) => (
            <button
              key={scope}
              className={`chip ${scopes.includes(scope) ? 'active' : ''}`}
              onClick={() => toggleScope(scope)}
            >
              {scope}
            </button>
          ))}
        </div>
        <div className="admin-row">
          <input
            className="input"
            placeholder="new_scope"
            value={newScope}
            onChange={(event) => setNewScope(event.target.value)}
          />
          <button className="secondary" onClick={handleAddScope}>
            Add Scope
          </button>
        </div>
      </section>

      <section className="admin-card">
        <h2>Admins</h2>
        {!isSuperAdmin && <div className="note">Super admin required to manage staff.</div>}
        {isSuperAdmin && (
          <>
            <div className="admin-grid">
              <select
                className="input"
                value={selectedIdentityType}
                onChange={(event) => setSelectedIdentityType(event.target.value as AdminUser['identity_type'])}
              >
                <option value="uid">uid</option>
                <option value="email">email</option>
                <option value="domain">domain</option>
                <option value="manual">manual</option>
              </select>
              <input
                className="input"
                placeholder="identity"
                value={identityValue}
                onChange={(event) => setIdentityValue(event.target.value)}
              />
              <select
                className="input"
                value={role}
                onChange={(event) => setRole(event.target.value as AdminUser['role'])}
              >
                <option value="super_admin">super_admin</option>
                <option value="staff">staff</option>
              </select>
            </div>
            <button className="primary" onClick={handleSaveAdmin}>
              Save
            </button>
          </>
        )}
        <div className="admin-list">
          {admins.map((admin) => (
            <div key={admin.id} className="admin-item">
              <div>
                <strong>{admin.identity_value}</strong>
                <div className="meta">
                  {admin.identity_type} · {admin.role}
                </div>
                <div className="meta">{admin.scopes.join(', ')}</div>
              </div>
              {isSuperAdmin && (
                <button className="ghost" onClick={() => handleRemoveAdmin(admin.id)}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .admin-shell {
          padding: 24px;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          display: grid;
          gap: 24px;
          background: #f6f6fb;
          min-height: 100vh;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .admin-title {
          font-size: 24px;
          font-weight: 700;
        }
        .admin-identity {
          font-size: 12px;
          background: #fff;
          padding: 6px 10px;
          border-radius: 999px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }
        .admin-card {
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          display: grid;
          gap: 16px;
        }
        .admin-row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }
        .label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .input {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e2e2ee;
          font-size: 14px;
        }
        .chip {
          border: none;
          padding: 8px 12px;
          border-radius: 999px;
          background: #f0f0fa;
          cursor: pointer;
          font-size: 13px;
        }
        .chip.active {
          background: #6b5bff;
          color: #fff;
        }
        .primary {
          border: none;
          background: #6b5bff;
          color: #fff;
          padding: 10px 16px;
          border-radius: 12px;
          cursor: pointer;
        }
        .secondary {
          border: none;
          background: #11121a;
          color: #fff;
          padding: 10px 16px;
          border-radius: 12px;
          cursor: pointer;
        }
        .note {
          font-size: 13px;
          color: #6b6b7a;
        }
        .meta {
          font-size: 12px;
          color: #6b6b7a;
        }
        .admin-list {
          display: grid;
          gap: 12px;
        }
        .admin-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          background: #f8f8fd;
        }
        .ghost {
          border: none;
          background: transparent;
          color: #6b5bff;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
