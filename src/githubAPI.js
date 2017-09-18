const isGithubUserOrOrg = require('is-github-user-or-org')
const Promise = require('bluebird')
const Octokat = require('octokat')
const { flatten, sortBy } = require('lodash')
const config = require('../data.json')

const opts = {
  token: config.token || process.env.MAINTAINER_DASHBOARD,
  endpoint: config.rootURL
}

const github = new Octokat(opts)

const ORGS = config.orgs || []
const INDIVIDUAL_REPOS = config.individualRepos || []

// TODO Map files better
var README, LICENSE, CONTRIBUTE
const files = [
  {
    'name': 'readme',
    'filenames': ['README.md']
  },
  {
    'name': 'license',
    'filenames': ['LICENSE']
  },
  {
    'name': 'contribute',
    'filenames': ['CONTRIBUTE.md']
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
  if (thisPage.nextPage == null) {
    return Promise.resolve(thisPage)
  }
  return thisPage
    .nextPage()
    .then(nextPage => {
      return thisAndFollowingPages(nextPage)
    })
    .then(followingPages => {
      const repos = thisPage
      repos.push(...Array.from(followingPages || []))
      return repos
    })
}

function getFiles (repos) {
  repos = sortBy(repos, 'fullName')
  return Promise.map(repos, repo => {
    repo.files = {}
    return Promise.map(files, file => {
      // TODO Loop over possible filenames
      // TODO Get README using GitHub API for that
      // TODO Look into a package for this, if not, extract
      return github.repos(repo.fullName).contents(file.filenames[0]).readBinary()
        .then(res => {
          return (repo.files[file.name.toUpperCase()] = res)
        })
        .catch(err => {
          if (err) {
            // DO NOT LOG
          }
        })
    })
  }).then(() => repos)
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
    .then(allRepos => {
      return Promise.map(INDIVIDUAL_REPOS, repoName => {
        return github.repos.apply(null, repoName.split('/')).fetch().then(repo => {
          return repo // getPRCounts(repo)
        })
      }).then(individualRepos => allRepos.concat(individualRepos))
    })
    .then(repos => flatten(repos))
}

module.exports = {
  loadStats,
  thisAndFollowingPages,
  getFiles,
  loadRepos
}
