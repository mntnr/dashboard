Promise = require 'bluebird'
Octokat = require 'octokat'
{p, log} = require 'lightsaber'
{size, sortBy} = require 'lodash'
$ = require 'jquery'
DataTable = require 'datatables'
{
  a
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

EXPECTED =
  'Made By': '[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)'
  'Project': '[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)'
  'IRC':     '[![](https://img.shields.io/badge/freejs-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)'

main = ->
  github = new Octokat
    # need account, otherwise api throttled :(
    username: "8DvrWa6nBCevZt"
    password: "wojY4o9yWyRKDN"
  github.orgs('ipfs').repos.fetch()
  .then (repos) -> getReadmes repos
  .then (repos) -> show matrix repos

getReadmes = (repos) ->
  repos = sortBy repos, 'name'
  Promise.map repos, (repo) ->
    repo.readme.read()
    .then (readmeText) -> repo.readmeText = readmeText
    .catch -> repo.readmeText = null
  .then -> repos

matrix = renderable (repos) ->
  table class: 'stripe order-column compact cell-border', ->
    thead ->
      tr ->
        th ->
        th colspan: 2, -> "Builds"
        th colspan: 2, -> "README"
        th colspan: size(EXPECTED), -> "Badges"
      tr ->
        th class: 'left', -> "IPFS Repo"
        th class: 'left', -> "Travis CI"
        th class: 'left', -> "Circle CI"
        th -> "exists"
        th -> "> 500 chars"
        for expectedName of EXPECTED
          th -> expectedName
    tbody ->
      for repo in repos
        tr ->
          td class: 'left', ->
            a href: "https://github.com/ipfs/#{repo.name}", -> repo.name
          td class: 'left', -> travis repo.name
          td class: 'left', -> circle repo.name
          td -> check repo.readmeText?
          td -> check(repo.readmeText? and repo.readmeText.length > 500)
          for expectedName, expectedValue of EXPECTED
            td -> check (repo.readmeText? and repo.readmeText?.indexOf(expectedValue) isnt -1)

check = renderable (success) ->
  if success
    span class: 'success', -> '✓'
  else
    span class: 'failure', -> '✗'

travis = renderable (repoName) ->
  a href: "https://travis-ci.org/ipfs/#{repoName}", ->
    img src: "https://travis-ci.org/ipfs/#{repoName}.svg?branch=master"

circle = renderable (repoName) ->
  a href: "https://circleci.com/gh/ipfs/#{repoName}", ->
    img src: "https://circleci.com/gh/ipfs/#{repoName}.svg?style=svg"

show = (html) ->
  $('#content').html(html)
  $('table').DataTable
    paging: false
    searching: false

main()
