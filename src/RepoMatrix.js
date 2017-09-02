/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Promise = require('bluebird')
const Octokat = require('octokat')
const isGithubUserOrOrg = require('is-github-user-or-org')
const { flatten, merge, round, size, sortBy } = require('lodash')
const Wave = require('loading-wave')
const $ = require('jquery')
require('datatables.net')()
require('datatables.net-fixedheader')()
const { a, div, p, i, img, renderable, table, tbody, td, text, th, thead, tr } = require('teacup')

$.fn.center = function () {
  this.css('position', 'absolute')
  this.css('top', `${Math.max(0, ($(window).height() - $(this).outerHeight()) / 2 + $(window).scrollTop())}px`)
  this.css('left', `${Math.max(0, ($(window).width() - $(this).outerWidth()) / 2 + $(window).scrollLeft())}px`)
  return this
}

let RepoMatrix = (() => {
  let config
  let ORGS
  let INDIVIDUAL_REPOS
  let README_BADGES
  let README_SECTIONS
  let README_OTHER
  let README_ITEMS
  let FILES
  let github
  var RepoMatrix = class RepoMatrix {
    static initClass () {
      let LICENSE
      let CONTRIBUTE
      let README
      config = require('../data.json')
      ORGS = config.orgs
      INDIVIDUAL_REPOS = config.individualRepos

      README_BADGES = {
        Travis (repoFullName) {
          return `(https://travis-ci.org/${repoFullName})`
        },
        Circle (repoFullName) {
          return `(https://circleci.com/gh/${repoFullName})`
        },
        'Made By' () {
          return '[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)'
        },
        Project () {
          return '[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)'
        },
        IRC () {
          return '[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)'
        },
      }

      README_SECTIONS = {
        ToC () {
          return 'Table of Contents'
        },
        Install () {
          return '## Install'
        },
        Usage () {
          return '## Usage'
        },
        Contribute () {
          return '## Contribute'
        },
        License () {
          return '## License'
        },
      }

      README_OTHER = {
        TODO () {
          return 'TODO'
        },
        Banner () {
          return '![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)'
        },
      }

      README_ITEMS = merge(README_SECTIONS, README_OTHER)

      FILES = [(README = 'README.md'), (LICENSE = 'LICENSE'), (CONTRIBUTE = 'CONTRIBUTE')]

      github = new Octokat({
        token  : process.env.MAINTAINER_DASHBOARD,
        rootURL: config.rootURL,
      })

      this.matrix = renderable(repos => {
        return table({ class: 'stripe order-column compact cell-border' }, () => {
          let name
          thead(() => {
            tr(() => {
              th({ class: 'begin' }, () => {})
              th({ class: 'left builds', colspan: 2 }, () => 'Builds')
              th({ class: 'left readme', colspan: 2 }, () => 'README.md')
              th({ class: 'left files', colspan: 3 }, () => 'Files')
              th({ class: 'left sections', colspan: size(README_ITEMS) }, () => 'Sections')
              th({ class: 'left badges', colspan: size(README_BADGES) }, () => 'Badges')
              return th({ class: 'left', colspan: 3 }, () => 'Github')
            })
            return tr(() => {
              th({ class: 'left repo' }, () => 'Repo') // Name
              th({ class: 'left' }, () => 'Travis CI') // Builds
              th({ class: 'left' }, () => 'Circle CI') // Builds
              th(() => 'exists') // README.md
              th(() => '> 500 chars') // README.md
              th(() => 'license') // Files
              th(() => 'contribute') // Files
              for (name in README_ITEMS) {
                // Sections
                th(() => name)
              }
              for (name in README_BADGES) {
                // Badges
                th(() => name)
              }
              th(() => 'Stars') // Github
              return th(() => 'Open Issues')
            })
          }) // Github
          // th => 'Open PRs'                  # Github
          return tbody(() => {
            return Array.from(repos).map(({ fullName, files, stargazersCount, openIssuesCount }) =>
              tr(() => {
                let expectedMarkdown
                let template
                td({ class: 'left' }, () => a({ href: `https://github.com/${fullName}` }, () => fullName)) // Name
                td({ class: 'left' }, () => this.travis(fullName)) // Builds
                td({ class: 'left' }, () => this.circle(fullName)) // Builds
                td({ class: 'no-padding' }, () => this.check(files[README])) // README.md
                td({ class: 'no-padding' }, () => this.check((files[README] != null ? files[README].length : undefined) > 500)) // README.md
                td({ class: 'no-padding' }, () => this.check(files[LICENSE])) // Files
                td({ class: 'no-padding' }, () => this.check(files[CONTRIBUTE])) // Files
                for (name in README_ITEMS) {
                  // Badges
                  template = README_ITEMS[name]
                  expectedMarkdown = template(fullName)
                  if (name === 'ToC') {
                    if ((files[README] != null ? files[README].split('\n').length : undefined) < 100) {
                      td({ class: 'no-padding' }, () => this.check('na'))
                    } else {
                      td({ class: 'no-padding' }, () => this.check((files[README] != null ? files[README].indexOf(expectedMarkdown) : undefined) >= 0))
                    }
                  } else if (name === 'Install' || name === 'Usage') {
                    if (files[README] != null ? files[README].match('This repository is (only for documents|a \\*\\*work in progress\\*\\*)\\.') : undefined) {
                      td({ class: 'no-padding' }, () => this.check('na'))
                    } else {
                      td({ class: 'no-padding' }, () => this.check((files[README] != null ? files[README].indexOf(expectedMarkdown) : undefined) >= 0))
                    }
                  } else if (name === 'TODO') {
                    td({ class: 'no-padding' }, () => this.check((files[README] != null ? files[README].indexOf(expectedMarkdown) : undefined) === -1))
                  } else {
                    td({ class: 'no-padding' }, () => this.check((files[README] != null ? files[README].indexOf(expectedMarkdown) : undefined) >= 0))
                  }
                }
                for (name in README_BADGES) {
                  template = README_BADGES[name]
                  expectedMarkdown = template(fullName)
                  td({ class: 'no-padding' }, () => this.check((files[README] != null ? files[README].indexOf(expectedMarkdown) : undefined) >= 0))
                }
                td(() => (stargazersCount ? text(stargazersCount) : '?'))
                return td(() => (openIssuesCount ? text(openIssuesCount) : '?'))
              })
            )
          })
        })
      })
      // td => (repo.openIssuesCount-repo.openPRsCount).toString()
      // td => repo.openPRsCount.toString()

      this.check = renderable(success => {
        if (success === 'na') {
          return div({ class: '' }, () => {
          // return div({ class: 'na' }, () => {
            i({ class: '' }, () => {})
          })
        } else if (success) {
          return div({ class: 'success' }, () => {
            // i({ class: 'mdi mdi-check' }, () => {})
            i({ class: 'mdi mdi-checkbox-blank-circle-outline' }, () => {})
          })
        } else {
          return div({ class: 'failure' }, () => {
            // i({ class: 'mdi mdi-close' }, () => {})
            i({ class: 'mdi mdi-checkbox-blank-circle' }, () => {})
          })
        }
      })

      this.travis = renderable(repoFullName => 
        div({ class: 'flex-wrapper' }, () => {
          a({ href: `https://travis-ci.org/${repoFullName}` }, () => 
            img({ 
              src: `https://travis-ci.org/${repoFullName}.svg?branch=master`, 
              class: 'travis-badge-render-fix' 
            })
          )
        })
      )

      this.circle = renderable(repoFullName =>
        div({ class: 'flex-wrapper' }, () => {
          a({ href: `https://circleci.com/gh/${repoFullName}` }, () =>
            img({
              src    : `https://circleci.com/gh/${repoFullName}.svg?style=svg`,
              onError: "this.parentElement.href = 'https://circleci.com/add-projects'; this.src = 'images/circle-ci-no-builds.svg'",
            })
          )
        })
      )

      this.stats = renderable(info => {
        const { resources: { core: { limit, remaining, reset } } } = info
        return div({ class: 'stats' }, () => {
          const now = new Date().getTime() / 1000 // seconds
          const minutesUntilReset = (reset - now) / 60 // minutes
          return p(() => {
            text(`Github API calls: ${remaining} remaining of ${limit} limit per hour; clean slate in: ${round(minutesUntilReset, 1)} minutes. `)
            a({ href: 'https://status.github.com/' }, () => 'GitHub status.')
          })
        })
      })
    }

    static start () {
      this.wave = this.loadingWave()
      return this.loadRepos()
        .catch(err => {
          this.killLoadingWave(this.wave)
          const errMsg = `Unable to access GitHub. <a href="https://status.github.com/">Is it down?</a>${err}`
          $(document.body).append(errMsg)
          throw err
        })
        .then(repos => this.getFiles(repos))
        .then(repos => {
          this.repos = repos
          return this.killLoadingWave(this.wave)
        })
        .then(() => this.showMatrix(this.repos))
        .then(() => this.loadStats())
    }

    static loadingWave () {
      const wave = Wave({
        width : 162,
        height: 62,
        n     : 7,
        color : '#959',
      })
      $(wave.el).center()
      document.body.appendChild(wave.el)
      wave.start()
      return wave
    }

    static killLoadingWave (wave) {
      wave.stop()
      return $(wave.el).hide()
    }

    static getPRCounts (repo) {
      // Throttled at 30 per minute. TODO Implement a good throttler here.
      // Promise.resolve github.search.issues.fetch({q: 'type:pr is:open repo:' + repo.fullName})
      //   .then (openPRs) =>
      repo.openPRsCount = 'TODO' // openPRs.totalCount
      return repo
    }

    // TODO Allow users as well as orgs
    static loadRepos () {
      return Promise.map(ORGS, org => {
        return isGithubUserOrOrg(org).then(res => {
          if (res === 'Organization') {
            return github
              .orgs(org)
              .repos.fetch({ per_page: 100 })
              .then(firstPage => this.thisAndFollowingPages(firstPage))
              .then(repos => {
                return Promise.map(repos, repo => {
                  return this.getPRCounts(repo)
                })
              })
          } else {
            return github
              .users(org)
              .repos.fetch({ per_page: 100 })
              .then(firstPage => this.thisAndFollowingPages(firstPage))
              .then(repos => {
                return Promise.map(repos, repo => {
                  return this.getPRCounts(repo)
                })
              })
          }
        })
      })
        .then(allRepos => {
          return Promise.map(INDIVIDUAL_REPOS, repoName => {
            return github.repos.apply(null, repoName.split('/')).fetch().then(repo => {
              return this.getPRCounts(repo)
            })
          }).then(individualRepos => {
            return allRepos.concat(individualRepos)
          })
        })
        .then(reposAllOrgs => {
          const allRepos = flatten(reposAllOrgs)
          return allRepos
        })
    }

    // recursively fetch all "pages" (groups of up to 100 repos) from Github API
    static thisAndFollowingPages (thisPage) {
      if (thisPage.nextPage == null) {
        return Promise.resolve(thisPage)
      }
      return thisPage
        .nextPage()
        .then(nextPage => {
          return this.thisAndFollowingPages(nextPage)
        })
        .then(followingPages => {
          const repos = thisPage
          repos.push(...Array.from(followingPages || []))
          return repos
        })
    }

    static showMatrix (repos) {
      $('#matrix').append(this.matrix(repos))
      return $('table').DataTable({
        paging     : false,
        searching  : false,
        fixedHeader: true,
      })
    }

    static getFiles (repos) {
      repos = sortBy(repos, 'fullName')
      return Promise.map(repos, repo => {
        repo.files = {}
        return Promise.map(FILES, fileName => {
          return github.repos(repo.fullName).contents(fileName).readBinary()
            .then(res => (repo.files[fileName] = res))
            .catch(err => console.log(err))
        })
      }).then(() => repos)
    }

    static loadStats () {
      return github.rateLimit.fetch().then(info => $('#stats').append(this.stats(info)))
    }
  }
  RepoMatrix.initClass()
  return RepoMatrix
})()

module.exports = RepoMatrix
