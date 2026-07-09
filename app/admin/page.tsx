'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getCountFromServer } from 'firebase/firestore';
import { firestore } from '../../lib/firebase';

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ posts: number; users: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      const [posts, users] = await Promise.all([
        getCountFromServer(collection(firestore, 'posts')),
        getCountFromServer(collection(firestore, 'userProfiles')),
      ]);
      setStats({ posts: posts.data().count, users: users.data().count });
    };
    load().catch(() => setStats({ posts: 0, users: 0 }));
  }, []);

  return (
    <div className="admin">
      <header className="admin-header">
        <h1>📊 Dashboard</h1>
        <Link href="/app/feed" className="back-link">
          🏠 앱으로
        </Link>
      </header>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">👥 Users</div>
          <div className="stat-value">{stats ? stats.users : '⏳'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📝 Posts</div>
          <div className="stat-value">{stats ? stats.posts : '⏳'}</div>
        </div>
      </div>
      <style jsx>{`
        .admin {
          max-width: 720px;
          margin: 0 auto;
          padding: 32px 20px;
          display: grid;
          gap: 24px;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .admin-header h1 {
          margin: 0;
          font-size: 28px;
        }
        .admin-header :global(.back-link) {
          text-decoration: none;
          background: #f4f4fb;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 14px;
          color: #333;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .stat-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.07);
        }
        .stat-label {
          font-size: 14px;
          color: #7a7a8c;
          font-weight: 600;
        }
        .stat-value {
          font-size: 40px;
          font-weight: 800;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
