'use client';

import { useState, useEffect } from 'react';
import { FeedCard, FeedCardData } from '../components/FeedCard';
import { firestore } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const FeedPage = () => {
  const [posts, setPosts] = useState<FeedCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(firestore, 'posts'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<FeedCardData, 'id'>),
      }));
      setPosts(postsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="feed-page">
      <header className="page-header">
        <h1>Feed</h1>
      </header>
      
      {isLoading ? (
        <div className="loading-state">Loading posts... ✨</div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <FeedCard key={post.id} data={post} />
          ))}
        </div>
      )}

      <style jsx>{`
        .feed-page {
          display: grid;
          gap: 20px;
        }
        .page-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
        }
        .posts-grid {
          display: grid;
          gap: 16px;
        }
        .loading-state {
            text-align: center;
            padding: 40px;
            font-size: 16px;
            color: #666;
        }
      `}</style>
    </div>
  );
};

export default FeedPage;
