Promise = require 'bluebird'
Octokat = require 'octokat'
{p, log} = require 'lightsaber'
{sortBy} = require 'lodash'
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
  table class: 'stripe', ->
    thead ->
      tr ->
        th -> "Repository"
        th -> "Travis CI"
        th -> "Circle CI"
        th -> "README"
        for expectedName of EXPECTED
          th -> expectedName
    tbody ->
      for repo in repos
        tr ->
          td ->
            a href: "https://github.com/ipfs/#{repo.name}", ->
              repo.name
          td -> travis repo.name
          td -> circle repo.name
          td -> check repo.readmeText?
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
