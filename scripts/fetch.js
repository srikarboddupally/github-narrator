// scripts/fetch.js
const { graphql } = require("@octokit/graphql");
const mysql = require('mysql2/promise');

// --- Configuration ---
const {
  GITHUB_TOKEN,
  TIDB_HOST,
  TIDB_USER,
  TIDB_PASSWORD,
  TIDB_DATABASE,
  GITHUB_USERNAME
} = process.env;

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${GITHUB_TOKEN}`,
  },
});

// --- Main Logic ---
async function main() {
  console.log(`Starting data collection for user: ${GITHUB_USERNAME}`);

  // 1. Connect to the Memory (TiDB)
  const db = await mysql.createConnection({
    host: TIDB_HOST,
    user: TIDB_USER,
    password: TIDB_PASSWORD,
    database: TIDB_DATABASE,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  });
  console.log('Successfully connected to the database.');

  // 2. Query the GitHub API for events
  // Note: This is a simplified query. Real-world use would involve pagination.
  const { user } = await graphqlWithAuth(`
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
              primaryLanguage { name }
            }
            contributions(first: 100) {
              nodes {
                occurredAt
                commitCount
                commit {
                  oid
                  additions
                  deletions
                }
              }
            }
          }
        }
      }
    }
  `, { username: GITHUB_USERNAME });

  console.log('Successfully fetched data from GitHub API.');

  // 3. Process and Insert data into TiDB
  const events = [];
  const contributions = user.contributionsCollection.commitContributionsByRepository;

  for (const repo of contributions) {
    for (const contribution of repo.contributions.nodes) {
        const commit = contribution.commit;
        events.push([
            commit.oid, // id
            GITHUB_USERNAME, // user_login
            'PushEvent', // event_type
            new Date(contribution.occurredAt), // event_created_at
            repo.repository.nameWithOwner, // repo_name
            repo.repository.primaryLanguage?.name, // language
            commit.additions, // additions
            commit.deletions  // deletions
        ]);
    }
  }

  if (events.length > 0) {
    // Using INSERT IGNORE to avoid errors on duplicate primary keys.
    // A more robust solution might use ON DUPLICATE KEY UPDATE.
    const sql = `
        INSERT IGNORE INTO events (id, user_login, event_type, event_created_at, repo_name, language, additions, deletions)
        VALUES ?
    `;
    const [result] = await db.query(sql, [events]);
    console.log(`Inserted or ignored ${result.affectedRows} events into the database.`);
  } else {
    console.log('No new events to insert.');
  }

  await db.end();
  console.log('Process complete. Connection closed.');
}

main().catch(err => {
  console.error('An error occurred:', err);
  process.exit(1);
});