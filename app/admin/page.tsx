
import { promises as fs } from 'fs';
import path from 'path';

async function getStats() {
  const usersDir = path.join(process.cwd(), 'app', '(users)');
  const postsDir = path.join(process.cwd(), 'app', '(posts)');

  try {
    const userFiles = await fs.readdir(usersDir);
    const postFiles = await fs.readdir(postsDir);

    const totalUsers = userFiles.filter(file => file.endsWith('.tsx')).length;
    const totalPosts = postFiles.filter(file => file.endsWith('.tsx')).length;

    return { totalUsers, totalPosts };
  } catch (error) {
    console.error("Error reading directories:", error);
    return { totalUsers: 0, totalPosts: 0 };
  }
}

export default async function AdminDashboard() {
  const { totalUsers, totalPosts } = await getStats();

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Users</h3>
          <p className="text-4xl font-bold mt-2">{totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Posts</h3>
          <p className="text-4xl font-bold mt-2">{totalPosts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Weekly Active Users</h3>
          <p className="text-4xl font-bold mt-2">1,234</p>  // Placeholder
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Server Health</h3>
          <p className="text-4xl font-bold mt-2 text-green-500">Good</p> // Placeholder
        </div>
      </div>
    </div>
  );
}
