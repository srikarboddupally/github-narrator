# GitHub Narrator 📖

> A living README generator that tells the story of a developer's journey.

## 🌟 What is GitHub Narrator?

GitHub Narrator automatically collects your GitHub activity data and stores it in a database, enabling you to generate insights, visualizations, and narratives about your coding journey.

## 🚀 Features

- **Automated Data Collection**: Daily GitHub Actions workflow fetches your commit data
- **TiDB Storage**: Scalable cloud database for storing your activity
- **GraphQL Integration**: Efficient data fetching using GitHub's GraphQL API
- **API Endpoints**: REST API to query your coding statistics
- **Future**: AI-generated narratives, visualizations, and insights

## 📋 Prerequisites

- GitHub account
- TiDB Cloud account (free tier available at https://tidbcloud.com/)
- Node.js 18+ (for local development)

## 🛠️ Setup Instructions

### 1. Fork/Clone this Repository

```bash
git clone https://github.com/srikarboddupally/github-narrator.git
cd github-narrator
npm install
```

### 2. Set Up TiDB Database

1. Create a free account at [TiDB Cloud](https://tidbcloud.com/)
2. Create a new cluster (Serverless tier is free)
3. Create a new database called `github_narrator`
4. Run the schema setup:

```sql
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(255) PRIMARY KEY,
    user_login VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_created_at DATETIME NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    language VARCHAR(50),
    additions INT DEFAULT 0,
    deletions INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_date (user_login, event_created_at),
    INDEX idx_repo (repo_name),
    INDEX idx_language (language)
);
```

### 3. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: "GitHub Narrator"
4. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
5. Generate and copy the token

### 4. Configure Repository Secrets

Go to your repository Settings → Secrets and variables → Actions, and add:

- `GH_PAT`: Your GitHub Personal Access Token
- `TIDB_HOST`: Your TiDB host (e.g., `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
- `TIDB_USER`: Your TiDB username (e.g., `3aBcDeFgHiJkLmN.root`)
- `TIDB_PASSWORD`: Your TiDB password
- `TIDB_DATABASE`: `github_narrator`
- `GITHUB_USERNAME`: Your GitHub username (e.g., `srikarboddupally`)

### 5. Test the Workflow

1. Go to Actions tab in your repository
2. Select "GitHub Data Collector" workflow
3. Click "Run workflow" → "Run workflow"
4. Monitor the execution

## 📁 Project Structure

```
github-narrator/
├── .github/
│   └── workflows/
│       └── collector.yml          # GitHub Actions workflow
├── scripts/
│   ├── fetch.js                   # Data collection script
│   ├── generate-readme.js         # README generator (coming soon)
│   └── init-db.js                 # Database initialization
├── web/
│   └── pages/
│       └── api/
│           └── stats.js           # API endpoints
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Local Development

### Run Data Collection Locally

Create a `.env` file:

```env
GITHUB_TOKEN=your_github_token
TIDB_HOST=your_tidb_host
TIDB_USER=your_tidb_user
TIDB_PASSWORD=your_tidb_password
TIDB_DATABASE=github_narrator
GITHUB_USERNAME=srikarboddupally
```

Run the collector:

```bash
node scripts/fetch.js
```

### Initialize Database

```bash
node scripts/init-db.js
```

## 📊 Usage

Once set up, the workflow runs automatically every day at midnight UTC. You can also:

- **Manual trigger**: Go to Actions → GitHub Data Collector → Run workflow
- **Query your data**: Use the API endpoints (coming soon)
- **Generate insights**: View your coding statistics and trends

## 🎯 Roadmap

- [x] Automated data collection
- [x] GitHub Actions integration
- [x] TiDB storage
- [ ] API endpoints for querying stats
- [ ] AI-generated narratives using Claude/GPT
- [ ] Interactive web dashboard
- [ ] Weekly/monthly summary emails
- [ ] Language and repository insights
- [ ] Contribution heatmaps
- [ ] Dynamic README badges

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use this project however you'd like!

## 🙏 Acknowledgments

- Built with [Octokit](https://github.com/octokit/graphql.js)
- Powered by [TiDB Cloud](https://tidbcloud.com/)
- Inspired by the idea of quantified self for developers

---

**Made with ❤️ by [Srikar Boddupally](https://github.com/srikarboddupally)**
