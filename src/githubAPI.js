const isGithubUserOrOrg = require('is-github-user-or-org')
const Promise = require('bluebird')
const Octokat = require('octokat')
const { flatten, sortBy } = require('lodash')
const config = require('../data.json')

const opts = {
  token: config.token || process.env.MAINTAINER_DASHBOARD,
  endpoint: config.rootURL, // For gh-get deps
  rootURL: config.rootURL // For Octokat
}

const github = new Octokat(opts)

const ORGS = config.orgs || []
const INDIVIDUAL_REPOS = config.individualRepos || []

// TODO Map files better
var README, LICENSE, CONTRIBUTING
const files = [
  {
    'name': 'readme',
    'filenames': ['README.md', 'README.rst']
  },
  {
    'name': 'license',
    'filenames': ['LICENSE', 'LICENSE.md']
  },
  {
    'name': 'contributing',
    'filenames': ['CONTRIBUTING.md']
  }
]

// TODO Get PR Counts
// function getPRCounts (repo) {
//   // Throttled at 30 per minute. TODO Implement a good throttler here.
//   // Promise.resolve github.search.issues.fetch({q: 'type:pr is:open repo:' + repo.fullName})
//   //   .then (openPRs) =>
//   repo.openPRsCount = 'TODO' // openPRs.totalCount
//   return repo
// }

function loadStats () {
  return github.rateLimit.fetch()
}

// recursively fetch all "pages" (groups of up to 100 repos) from Github API
function thisAndFollowingPages (thisPage) {
  if (thisPage.nextPageUrl == null) {
    return Promise.resolve(thisPage.items)
  }
  return thisPage
    .nextPage.fetch()
    .then(nextPage => thisAndFollowingPages(nextPage))
    .then(followingPages => {
      const repos = thisPage.items
      repos.push(...Array.from(followingPages || []))
      return repos
    })
}

function getFiles (repos) {
  repos = sortBy(repos, 'fullName')
  return Promise.map(repos, repo => {
    repo.files = {}
    return Promise.map(files, file => {
      // TODO Get README using GitHub API for that
      // TODO Look into a package for this, if not, extract
      if (file.name === 'readme') {
        // console.log('Above the README getter', repo.files[file.name.toUpperCase()])
        return github.repos(repo.fullName).readme.fetch()
          .then(res => res.readBinary())
          .then(res => (repo.files[file.name.toUpperCase()] = res))
          .catch(err => {
            if (err) {
              // console.log('Error getting README', err)
              // DO NOT LOG.  It will show up in the dashboard.
            }
          })
      } else if (file.name === 'license') {
        return github.fromUrl(`/repos/${repo.fullName}/license`).fetch()
          .then(res => res.readBinary())
          .then(res => (repo.files[file.name.toUpperCase()] = res))
          .catch(err => {
            if (err) {
              // console.log('Error getting license', err)
              // DO NOT LOG. It will show up in the dashboard.
            }
          })
      } else {
        return Promise.map(file.filenames, filename => {
          return github.repos(repo.fullName).contents(filename).readBinary()
          .then(res => (repo.files[file.name.toUpperCase()] = res))
          .catch(err => {
            if (err) {
              // DO NOT LOG
            }
          })
        })
      }
    })
  }).then((res) => {
    return repos
  })
}

function loadRepos () {
  return Promise.map(ORGS, org => {
    return isGithubUserOrOrg(org, opts).then(res => {
      if (res === 'Organization') {
        return github
          .orgs(org)
          .repos.fetch({ per_page: 100 })
          .then(firstPage => thisAndFollowingPages(firstPage))
          // .then(repos => {
          //   return Promise.map(repos, repo => {
          //     return getPRCounts(repo)
          //   })
          // })
      } else {
        return github
          .users(org)
          .repos.fetch({ per_page: 100 })
          .then(firstPage => thisAndFollowingPages(firstPage))
          // .then(repos => {
          //   return Promise.map(repos, repo => {
          //     return getPRCounts(repo)
          //   })
          // })
      }
    })
  })
    .then(repos => flatten(repos))
    .then(allRepos => {
      return Promise.map(INDIVIDUAL_REPOS, repoName => {
        return github.repos.apply(null, repoName.split('/')).fetch().then(repo => {
          return repo // getPRCounts(repo)
        })
      }).then(individualRepos => {
        return allRepos.concat(individualRepos)
      })
    })
}

module.exports = {
  loadStats,
  thisAndFollowingPages,
  getFiles,
  loadRepos
}
