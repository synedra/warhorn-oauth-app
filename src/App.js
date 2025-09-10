// src/App.js
import React, { useState, useEffect } from 'react';
import { LogOut, Github, Star, GitFork, Calendar } from 'lucide-react';

const GitHubOAuthApp = () => {
  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //   Warhorn OAuth configuration
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
  const REDIRECT_URI = "https://paizo.netlify.app"

  // handleOAuthCallback moved inside useEffect below

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    const handleOAuthCallback = async (code) => {
      setLoading(true);
      setError(null);

      try {
        // In a real app, you'd exchange the code for an access token via your backend
        // For demo purposes, we'll simulate this process
        console.log('OAuth code received:', code);
        const tokenResponse = await fetch('/.netlify/functions/exchange_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const tokenData = await tokenResponse.json();
        if (tokenData.access_token) {
          fetchUserData(tokenData.access_token);
        } else {
          // Show detailed error from backend if available
          setError(tokenData.error || tokenData.details || 'Failed to get access token');
        }
      } catch (err) {
        setError('Failed to authenticate with Warhorn: ' + err.message);
      } finally {
        setLoading(false);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    if (code && !user) {
      handleOAuthCallback(code);
    }
  }, [user]);

  const handleLogin = () => {
    const warhornAuthUrl = `https://warhorn.net/oauth/authorize?response_type=code&redirect_uri=${REDIRECT_URI}&scope=openid%20email%20profile&state=stateystate&client_id=${CLIENT_ID}`;
    window.location.href = warhornAuthUrl;
  };

  

  const fetchUserData = async (token) => {
    const query = `
      query {
        viewer {
          login
          name
          email
          avatarUrl
          bio
          location
          company
          createdAt
          followers {
            totalCount
          }
          following {
            totalCount
          }
          repositories(first: 6, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              name
              description
              stargazerCount
              forkCount
              primaryLanguage {
                name
                color
              }
              url
              updatedAt
            }
          }
        }
      }
    `;

    try {
      const response = await fetch('https://warhorn.net/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setUser(data.data.viewer);
      setRepositories(data.data.viewer.repositories.nodes);
    } catch (err) {
      setError(`Failed to fetch user data: ${err.message}`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRepositories([]);
    setError(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center">
        <div className="text-white text-xl">Authenticating with Warhorn...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Github className="w-10 h-10" />
            Warhorn OAuth Demo
          </h1>
          <p className="text-purple-200 text-lg">
            Authenticate with Warhorn and view your profile data via GraphQL
          </p>
        </header>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
            {error.includes('server-side') && (
              <div className="mt-4 text-sm text-red-300">
                <p><strong>Setup Instructions:</strong></p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Create a Warhorn OAuth App at warhorn.net</li>
                  <li>Set Authorization callback URL to your domain</li>
                  <li>Replace CLIENT_ID with your app's client ID</li>
                  <li>Implement server-side token exchange (required for security)</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {!user ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <Github className="w-16 h-16 text-white mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Sign in with Warhorn
                </h2>
                <button
                  onClick={handleLogin}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  Authenticate with Warhorn
                </button>
                <p className="text-purple-200 text-sm mt-4">
                  Access your Warhorn profile and data
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* User Profile Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-6">
                  <img
                    src={user.avatarUrl}
                    alt={user.name || user.login}
                    className="w-20 h-20 rounded-full border-4 border-white/30"
                  />
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {user.name || user.login}
                    </h2>
                    <p className="text-purple-200 text-lg">@{user.login}</p>
                    {user.bio && (
                      <p className="text-gray-300 mt-2">{user.bio}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{user.followers.totalCount}</div>
                  <div className="text-purple-200">Followers</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{user.following.totalCount}</div>
                  <div className="text-purple-200">Following</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{user.company || 'N/A'}</div>
                  <div className="text-purple-200">Company</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{user.location || 'N/A'}</div>
                  <div className="text-purple-200">Location</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(user.createdAt)}
                </span>
                {user.email && (
                  <span>📧 {user.email}</span>
                )}
              </div>
            </div>

            {/* Repositories */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Recent Repositories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repositories.map((repo) => (
                  <div key={repo.name} className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition duration-200">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-purple-300 transition duration-200"
                      >
                        {repo.name}
                      </a>
                    </h4>
                    {repo.description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {repo.stargazerCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          {repo.forkCount}
                        </span>
                      </div>
                      {repo.primaryLanguage && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: repo.primaryLanguage.color }}
                          ></div>
                          <span className="text-sm text-gray-300">
                            {repo.primaryLanguage.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Updated {formatDate(repo.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubOAuthApp;
