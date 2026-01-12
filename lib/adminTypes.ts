export type AdminRole = 'super_admin' | 'staff';

export type AdminUser = {
  identity_type: 'uid' | 'email' | 'domain' | 'manual';
  identity_value: string;
  role: AdminRole;
  scopes: string[];
  created_at?: unknown;
  created_by?: string;
};

export type AdminSettings = {
  auth_mode: 'uid' | 'email' | 'domain' | 'manual';
  available_scopes: string[];
};

export type LocalIdentity = {
  uid: string;
  email: string;
  domain: string;
};
