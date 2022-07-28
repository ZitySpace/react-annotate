module.exports = {
  branches: 'master',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          {
            type: 'style',
            release: 'patch',
          },
          {
            type: 'docs',
            release: 'patch',
          },
          {
            type: 'refactor',
            release: 'patch',
          },
        ],
      },
    ],

    '@semantic-release/release-notes-generator',

    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],

    // '@semantic-release/npm',

    '@semantic-release/github',

    // [
    //   '@semantic-release/git',
    //   {
    //     assets: ['CHANGELOG.md', 'package.json'],
    //     message:
    //       'chore(release): set `package.json` to ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    //   },
    // ],
  ],
};
