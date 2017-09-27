/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const { round, size, split } = require('lodash')
const $ = require('jquery')
const lib = require('./lib/')
const githubAPI = require('./githubAPI.js')
const checkVitality = require('./checks.js')

require('datatables.net')()
require('datatables.net-fixedheader')()
const { a, div, p, i, span, renderable, table, tbody, td, text, th, thead, tr } = require('teacup')

$.fn.center = function () {
  this.css('position', 'absolute')
  this.css('top', `${Math.max(0, ($(window).height() - $(this).outerHeight()) / 2 + $(window).scrollTop())}px`)
  this.css('left', `${Math.max(0, ($(window).width() - $(this).outerWidth()) / 2 + $(window).scrollLeft())}px`)
  return this
}

let RepoMatrix = (() => {
  var RepoMatrix = class RepoMatrix {
    static initClass () {
      this.matrix = renderable(repos => {
        return table({ class: 'stripe order-column compact cell-border' }, () => {
          var vitality = checkVitality()
          let name
          thead(() => {
            tr(() => {
              th({ class: 'begin' }, () => 'Repository')
              th({ class: 'left readme', colspan: 2, style: 'background-color:green' }, () => 'README.md')
              th({ class: 'left files', colspan: 2, style: 'background-color:blue' }, () => 'Files')
              th({ class: 'left sections', colspan: size(vitality.readme.items), style: 'background-color:orange' }, () => 'Sections')
              // th({ class: 'left badges', colspan: size(vitality.readme.badges) }, () => 'Badges')
              return th({ class: 'left', colspan: 3, style: 'background-color:black' }, () => 'Github')
            })
            return tr(() => {
              th({ class: 'left repo' }, () => 'Repo') // Name
              th(() => 'README') // README.md
              th(() => '> 500 chars') // README.md
              th(() => 'LICENSE') // Files
              th(() => 'CONTRIBUTING') // Files
              for (name in vitality.readme.sections) {
                th(() => name) // Sections
              }
              // for (name in vitality.readme.badges) {
              //   th(() => name) // Badges
              // }
              th(() => 'Stars') // Github
              return th(() => 'Open Issues')
            })
          }) // Github
          // th => 'Open PRs'                  # Github
          return tbody(() => {
            return Array.from(repos).filter(repo => !repo.private).map(({ fullName, files, stargazersCount, openIssuesCount }) =>
              tr(() => {
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

                vitality = checkVitality(files, fullName, stargazersCount, openIssuesCount)

                td({ class: 'no-padding' }, () => this.renderCheck(vitality.readme.content)) // README.md
                td({ class: 'no-padding' }, () => this.renderCheck(vitality.readme.charLength())) // README.md
                td({ class: 'no-padding' }, () => this.renderCheck(vitality.license)) // Files
                td({ class: 'no-padding' }, () => this.renderCheck(vitality.contribute)) // Files
                for (name in vitality.readme.items) {
                  if (name === 'ToC') {
                    td({ class: 'no-padding' }, () => this.renderCheck(vitality.readme.toc()))
                  } else if (name === 'Usage' || name === 'Install') {
                    td({ class: 'no-padding' }, () => this.renderCheck(vitality.readme.checkCodeSections(name)))
                  } else if (name === 'TODO') {
                    td({ class: 'no-padding' }, () => this.renderCheck(vitality.readme.noTODOs()))
                  } else {
                    td({ class: 'no-padding' }, () => this.renderCheck(vitality.readme.section(name)))
                  }
                }

                // TODO Reenable badges
                // for (name in vitality.readme.badges) {
                //   expectedMarkdown = vitality.readme.items[fullName]
                //   td({ class: 'no-padding' }, () => this.renderCheck((files.README != null ? files.README.indexOf(expectedMarkdown) : undefined) >= 0))
                // }

                td(() => (stargazersCount ? text(stargazersCount) : ' '))
                td(() => (openIssuesCount ? text(openIssuesCount) : ' '))
              })
            )
          })
        })
      })
      // td => (repo.openIssuesCount-repo.openPRsCount).toString()
      // td => repo.openPRsCount.toString()

      this.renderCheck = renderable(success => {
        if (success === 'na') {
          return div({ class: 'na' }, () => {
            i({ class: 'mdi' }, () => ' ')
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

      this.stats = renderable(info => {
        if (info.err === 'Rate limiting is not enabled.') {
          return div({ class: 'stats' }, () => {
            return p(() => text(`Github API rate limiting is not enabled`))
          })
        }
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
        // This catch // then feels wrong, because I'm putting logic in two places.
        .catch(err => {
          if (err.message.toString().indexOf('Rate limiting is not enabled.') !== -1) {
            $('#stats').append(this.stats({err: 'Rate limiting is not enabled.'}))
          }
        })
        .then(info => {
          if (info) {
            $('#stats').append(this.stats(info))
          }
        })
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
