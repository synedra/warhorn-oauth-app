# GitHub OAuth React App

A React application that demonstrates GitHub OAuth authentication with GraphQL API integration, designed to work seamlessly with Netlify.

## 🚀 Features

- GitHub OAuth authentication flow
- GraphQL API integration with GitHub
- Modern, responsive UI with Tailwind CSS
- User profile display with repositories
- Repository statistics (stars, forks, languages)
- Secure token handling (requires backend setup)

## 📁 Project Structure

```
github-oauth-app/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── netlify.toml
└── README.md
```

## 🛠️ Setup Instructions

### 1. Create GitHub OAuth App

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Your app name
   - **Homepage URL**: Your Netlify domain (e.g., `https://your-app.netlify.app`)
   - **Authorization callback URL**: Same as homepage URL
4. Save the **Client ID** (you'll need this)
5. Generate a **Client Secret** (keep this secure!)

### 2. Configure the App

1. Open `src/App.js`
2. Replace `your_github_client_id` with your actual GitHub Client ID:
   ```javascript
   const CLIENT_ID = 'your_actual_client_id_here';
   ```

### 3. Deploy to Netlify

#### Option A: Deploy from Git
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Netlify will automatically build and deploy

#### Option B: Manual Deploy
1. Run `npm run build` locally
2. Drag and drop the `build` folder to Netlify

### 4. Set up Backend (Required for Production)

The OAuth flow requires a backend to securely exchange the authorization code for an access token. Here's a simple Node.js example:

```javascript
// server.js (example backend)
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/oauth/github', async (req, res) => {
  const { code } = req.body;
  
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });
    
    const data = await tokenResponse.json();
    res.json({ access_token: data.access_token });
  } catch (error) {
    res.status(500).json({ error: 'OAuth exchange failed' });
  }
});

app.listen(3001);
```

## 🔧 Environment Variables

For the backend, set these environment variables:
- `GITHUB_CLIENT_ID`: Your GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth app client secret

## 📱 Usage

1. Visit your deployed app
2. Click "Authenticate with GitHub"
3. Authorize the app on GitHub
4. View your profile data and repositories

## 🔒 Security Notes

- Never expose your GitHub client secret in frontend code
- Always use HTTPS in production
- The current demo shows how to structure the OAuth flow but requires backend implementation for security
- Consider implementing rate limiting and error handling in your backend

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 📚 API Usage

The app uses GitHub's GraphQL API v4 to fetch:
- User profile information
- Repository data with statistics
- Follower/following counts

## 🎨 Customization

- Modify the Tailwind classes in components for different styling
- Add more GraphQL queries in the `fetchUserData` function
- Extend the UI with additional GitHub data
- Add error boundaries and loading states

## 🚀 Deployment

The app is configured for automatic deployment on Netlify with:
- Build command: `npm run build`
- Publish directory: `build`
- Node.js version: 18
- SPA redirect rules for React Router (if added later)

## 📄 License

MIT License - feel free to use this code for your projects!
# warhorn-oauth-app
