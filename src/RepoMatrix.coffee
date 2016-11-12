Promise = require 'bluebird'
Octokat = require 'octokat'
request = require 'request-promise'
{log} = require 'lightsaber'
{flatten, merge, round, sample, size, sortBy} = require 'lodash'
Wave = require 'loading-wave'
$ = require 'jquery'
require('datatables.net')()
require('datatables.net-fixedheader')()
{
  a
  div
  img
  raw
  render
  renderable
  span
  table
  tbody
  td
  th
  thead
  tr
} = require 'teacup'

$.fn.center = ->
  @css 'position', 'absolute'
  @css 'top', Math.max(0, ($(window).height() - $(this).outerHeight()) / 2 + $(window).scrollTop()) + 'px'
  @css 'left', Math.max(0, ($(window).width() - $(this).outerWidth()) / 2 + $(window).scrollLeft()) + 'px'
  @

class RepoMatrix
  ORGS = [
    'ipfs'
    'ipld'
    'libp2p'
    'multiformats'
  ]

  INDIVIDUAL_REPOS = [
    'haadcode/orbit',
    'haadcode/orbit-core',
    'haadcode/orbit-textui',
    'haadcode/orbit-crypto',
    'haadcode/orbit-db',
    'haadcode/orbit-db-store',
    'haadcode/orbit-db-kvstore',
    'haadcode/orbit-db-eventstore',
    'haadcode/orbit-db-feedstore',
    'haadcode/orbit-db-counterstore',
    'haadcode/orbit-db-pubsub',
    'haadcode/crdts',
    'haadcode/ipfs-post',
    'haadcode/go-ipfs-log',
    'haadcode/ipfs-log'
  ]

  RAW_GITHUB_SOURCES = [
    (repoFullName, path) -> "https://raw.githubusercontent.com/#{repoFullName}/master/#{path}"
    # (repoFullName, path) -> "https://rawgit.com/#{repoFullName}/master/#{path}"
    # (repoFullName, path) -> "https://raw.githack.com/#{repoFullName}/master/#{path}"  # funky error messages on 404
  ]

  README_BADGES =
    'Travis': (repoFullName) -> "(https://travis-ci.org/#{repoFullName})"
    'Circle': (repoFullName) -> "(https://circleci.com/gh/#{repoFullName})"
    'Made By': -> '[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)'
    'Project': -> '[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)'
    'IRC':     -> '[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)'

  README_SECTIONS =
    'ToC': -> 'Table of Contents'
    'Install': -> '## Install'
    'Usage': -> '## Usage'
    'Contribute': -> '## Contribute'
    'License': -> '## License'

  README_OTHER =
    'Banner': -> '![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)'

  README_ITEMS = merge README_SECTIONS, README_OTHER

  FILES = [
    README = 'README.md'
    LICENSE = 'LICENSE'
    PATENTS = 'PATENTS'
    CONTRIBUTE = 'CONTRIBUTE.md'
  ]

  github = new Octokat

  @start: ->
    @wave = @loadingWave()
    @loadRepos()
    .catch (err) =>
      @killLoadingWave @wave
      errMsg = 'Unable to access GitHub. <a href="https://twitter.com/githubstatus">Is it down?</a>'
      $(document.body).append(errMsg)
      throw err
    .then (repos) => @getFiles repos
    .then (@repos) => @killLoadingWave @wave
    .then => @showMatrix @repos
    .then => @loadStats()

  @loadingWave: ->
    wave = Wave
      width: 162
      height: 62
      n: 7
      color: '#959'
    $(wave.el).center()
    document.body.appendChild wave.el
    wave.start()
    wave

  @killLoadingWave: (wave) ->
    wave.stop()
    $(wave.el).hide()

  @loadRepos: ->
    Promise.map ORGS, (org) =>
      github.orgs(org).repos.fetch(per_page: 100)
      .then (firstPage) =>
        reposThisOrg = @thisAndFollowingPages(firstPage)
    .then (allRepos) =>
      Promise.map INDIVIDUAL_REPOS, (repoName) =>
        github.repos.apply(null, repoName.split('/')).fetch()
      .then (individualRepos) =>
        allRepos.concat individualRepos
    .then (reposAllOrgs) =>
      allRepos = flatten reposAllOrgs
      allRepos

  # recursively fetch all "pages" (groups of up to 100 repos) from Github API
  @thisAndFollowingPages = (thisPage) ->
    unless thisPage.nextPage?
      return Promise.resolve thisPage
    thisPage.nextPage()
    .then (nextPage) =>
      @thisAndFollowingPages nextPage
    .then (followingPages) =>
      repos = thisPage
      repos.push followingPages...
      repos

  @showMatrix: (repos) ->
    $('#matrix').append @matrix repos
    $('table').DataTable
      paging: false
      searching: false
      fixedHeader: true

  @getFiles: (repos) ->
    repos = sortBy repos, 'fullName'
    Promise.map repos, (repo) ->
      repo.files = {}
      Promise.map FILES, (fileName) ->
        source = sample RAW_GITHUB_SOURCES
        request uri: source repo.fullName, fileName
        .then (fileContents) ->
          repo.files[fileName] = fileContents
        .catch (err) -> # console.error err
    .then -> repos

  @matrix: renderable (repos) =>
    table class: 'stripe order-column compact cell-border', =>
      thead =>
        tr =>
          th =>
          th class: 'left', colspan: 2, => "Builds"
          th class: 'left', colspan: 2, => "README.md"
          th class: 'left', colspan: 3, => "Files"
          th class: 'left', colspan: size(README_ITEMS), => "Sections"
          th class: 'left', colspan: size(README_BADGES), => "Badges"
          th class: 'left', colspan: 2, => "Github"
        tr =>
          th class: 'left', => "Repo"       # Name
          th class: 'left', => "Travis CI"  # Builds
          th class: 'left', => "Circle CI"  # Builds
          th => "exists"                    # README.md
          th => "> 500 chars"               # README.md
          th => "license"                   # Files
          th => "patents"                   # Files
          th => "contribute"                # Files
          for name of README_ITEMS          # Sections
            th => name
          for name of README_BADGES         # Badges
            th => name
          th => 'Stars'                     # Github
          th => 'Open Issues'               # Github
      tbody =>
        for repo in repos
          tr =>
            td class: 'left', => a href: "https://github.com/#{repo.fullName}", => repo.fullName     # Name
            td class: 'left', => @travis repo.fullName                                               # Builds
            td class: 'left', => @circle repo.fullName                                               # Builds
            td class: 'no-padding', => @check repo.files[README]                                     # README.md
            td class: 'no-padding', => @check(repo.files[README]?.length > 500)                      # README.md
            td class: 'no-padding', => @check repo.files[LICENSE]                                    # Files
            td class: 'no-padding', => @check repo.files[PATENTS]                                    # Files
            td class: 'no-padding', => @check repo.files[CONTRIBUTE]                                 # Files
            for name, template of README_ITEMS                                                       # Badges
              expectedMarkdown = template repo.fullName
              td class: 'no-padding', => @check(repo.files[README]?.indexOf(expectedMarkdown) >= 0)
            for name, template of README_BADGES
              expectedMarkdown = template repo.fullName
              td class: 'no-padding', => @check(repo.files[README]?.indexOf(expectedMarkdown) >= 0)
            td => repo.stargazersCount.toString()
            td => repo.openIssuesCount.toString()

  @check: renderable (success) ->
    if success
      div class: 'success', -> '✓'
    else
      div class: 'failure', -> '✗'

  @travis: renderable (repoFullName) ->
    a href: "https://travis-ci.org/#{repoFullName}", ->
      img src: "https://travis-ci.org/#{repoFullName}.svg?branch=master"

  @circle: renderable (repoFullName) ->
    a href: "https://circleci.com/gh/#{repoFullName}", ->
      img src: "https://circleci.com/gh/#{repoFullName}.svg?style=svg", onError: "this.parentElement.href = 'https://circleci.com/add-projects'; this.src = 'images/circle-ci-no-builds.svg'"

  @loadStats: ->
    github.rateLimit.fetch()
    .then (info) => $('#stats').append @stats info

  @stats: renderable (info) ->
    {resources: {core: {limit, remaining, reset}}} = info
    div class: 'stats', ->
      now = (new Date).getTime() / 1000  # seconds
      minutesUntilReset = (reset - now) / 60  # minutes
      "Github API calls: #{remaining} remaining of #{limit} limit per hour; clean slate in: #{round minutesUntilReset, 1} minutes"

module.exports = RepoMatrix
