/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const { merge, round, size, split } = require('lodash')
const lib = require('./lib/')
const githubAPI = require('./githubAPI.js')
const $ = require('jquery')
require('datatables.net')()
require('datatables.net-fixedheader')()
const { a, div, p, i, img, span, renderable, table, tbody, td, text, th, thead, tr } = require('teacup')

$.fn.center = function () {
  this.css('position', 'absolute')
  this.css('top', `${Math.max(0, ($(window).height() - $(this).outerHeight()) / 2 + $(window).scrollTop())}px`)
  this.css('left', `${Math.max(0, ($(window).width() - $(this).outerWidth()) / 2 + $(window).scrollLeft())}px`)
  return this
}

// TODO Remove these three definitions
let LICENSE
let CONTRIBUTE
let README

let README_BADGES
let README_SECTIONS
let README_OTHER
let README_ITEMS

let RepoMatrix = (() => {
  var RepoMatrix = class RepoMatrix {
    static initClass () {
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
        }
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
        }
      }

      README_OTHER = {
        TODO () {
          return 'TODO'
        },
        Banner () {
          return '![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)'
        }
      }

      README_ITEMS = merge(README_SECTIONS, README_OTHER)

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
                let nameArray = split(fullName, '/')

                td({ class: 'left repo-name' }, () => {
                  a({
                    class: 'name-org',
                    href: `https://github.com/${nameArray[0]}`,
                    target: '_name'
                  }, () => nameArray[0])
                  span({class: 'separator'}, () => '/')
                  a({
                    class: 'name-repo',
                    href: `https://github.com/${nameArray[0]}/${nameArray[1]}`,
                    target: '_name'
                  }, () => nameArray[1])
                })
                console.log(files)
                td({ class: 'left' }, () => this.travis(fullName)) // Builds
                td({ class: 'left' }, () => this.circle(fullName)) // Builds
                td({ class: 'no-padding' }, () => this.check(files.README)) // README.md
                td({ class: 'no-padding' }, () => this.check((files.README != null ? files.README.length : undefined) > 500)) // README.md
                td({ class: 'no-padding' }, () => this.check(files.LICENSE)) // Files
                td({ class: 'no-padding' }, () => this.check(files.CONTRIBUTE)) // Files
                for (name in README_ITEMS) {
                  // Badges
                  template = README_ITEMS[name]
                  expectedMarkdown = template(fullName)
                  if (name === 'ToC') {
                    if ((files.README != null ? files.README.split('\n').length : undefined) < 100) {
                      td({ class: 'no-padding' }, () => this.check('na'))
                    } else {
                      td({ class: 'no-padding' }, () => this.check((files.README != null ? files.README.indexOf(expectedMarkdown) : undefined) >= 0))
                    }
                  } else if (name === 'Install' || name === 'Usage') {
                    if (files.README != null ? files.README.match('This repository is (only for documents|a \\*\\*work in progress\\*\\*)\\.') : undefined) {
                      td({ class: 'no-padding' }, () => this.check('na'))
                    } else {
                      td({ class: 'no-padding' }, () => this.check((files.README != null ? files.README.indexOf(expectedMarkdown) : undefined) >= 0))
                    }
                  } else if (name === 'TODO') {
                    td({ class: 'no-padding' }, () => this.check((files.README != null ? files.README.indexOf(expectedMarkdown) : undefined) === -1))
                  } else {
                    td({ class: 'no-padding' }, () => this.check((files.README != null ? files.README.indexOf(expectedMarkdown) : undefined) >= 0))
                  }
                }
                for (name in README_BADGES) {
                  template = README_BADGES[name]
                  expectedMarkdown = template(fullName)
                  td({ class: 'no-padding' }, () => this.check((files.README != null ? files.README.indexOf(expectedMarkdown) : undefined) >= 0))
                }
                td(() => (stargazersCount ? text(stargazersCount) : '-'))
                return td(() => (openIssuesCount ? text(openIssuesCount) : '-'))
              })
            )
          })
        })
      })
      // td => (repo.openIssuesCount-repo.openPRsCount).toString()
      // td => repo.openPRsCount.toString()

      this.check = renderable(success => {
        if (success === 'na') {
          return div({ class: 'na' }, () => {
            i({ class: 'mdi mdi-minus' }, () => '-')
          })
        } else if (success) {
          return div({ class: 'success' }, () => {
            i({ class: 'mdi mdi-checkbox-blank-circle-outline' }, () => '✓')
          })
        } else {
          return div({ class: 'failure' }, () => {
            i({ class: 'mdi mdi-checkbox-blank-circle' }, () => '✗')
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
              src: `https://circleci.com/gh/${repoFullName}.svg?style=svg`,
              onError: "this.parentElement.href = 'https://circleci.com/add-projects'; this.src = 'images/circle-ci-no-builds.svg'"
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
      this.wave = lib.wave.loadingWave()
      return githubAPI.loadRepos()
        .catch(err => {
          lib.wave.killLoadingWave(this.wave)
          const errMsg = `Unable to access GitHub. <a href="https://status.github.com/">Is it down?</a>${err}`
          $(document.body).append(errMsg)
          throw err
        })
        .then(repos => githubAPI.getFiles(repos))
        .then(repos => {
          lib.wave.killLoadingWave(this.wave)
          return this.showMatrix(repos)
        })
        .then(() => githubAPI.loadStats())
        .then(info => $('#stats').append(this.stats(info)))
    }

    static showMatrix (repos) {
      $('#matrix').append(this.matrix(repos))
      return $('table').DataTable({
        paging: false,
        searching: false,
        fixedHeader: true
      })
    }
  }
  RepoMatrix.initClass()
  return RepoMatrix
})()

module.exports = RepoMatrix
