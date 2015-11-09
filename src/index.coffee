Octokat = require 'octokat'
{p, log} = require 'lightsaber'
{
  a
  img
  raw
  render
  renderable
  table
  td
  th
  tr
} = require 'teacup'

main = ->
  github = new Octokat()
  github.orgs('ipfs').repos.fetch()
  .then (repos) -> show matrix repos

matrix = renderable (repos) ->
  names = (repo.name for repo in repos)
  names.sort()
  table ->
    tr ->
      th ->
      th -> "Travis CI"
      th -> "Circle CI"
    for repoName in names
      tr ->
        td repoName
        td -> travis repoName
        td -> circle repoName

travis = renderable (repoName) ->
  a href: "https://travis-ci.org/ipfs/#{repoName}", ->
    img src: "https://travis-ci.org/ipfs/#{repoName}.svg?branch=master"

circle = renderable (repoName) ->
  a href: "https://circleci.com/gh/ipfs/#{repoName}", ->
    img src: "https://circleci.com/gh/ipfs/#{repoName}.svg?style=svg"

show = (html) ->
  content = document.getElementById 'content'
  content.innerHTML = html

main()
