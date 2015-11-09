Octokat = require 'octokat'
{p, log} = require 'lightsaber'
{
  img
  raw
  render
  renderable
  table
  td
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
    for repoName in names
      tr ->
        td repoName
        td -> travis repoName
        td -> circle repoName

travis = renderable (repoName) ->
  img src: "https://travis-ci.org/ipfs/#{repoName}.svg?branch=master"

circle = renderable (repoName) ->
  img src: "https://circleci.com/gh/ipfs/#{repoName}.svg?style=svg"

show = (html) ->
  content = document.getElementById 'content'
  content.innerHTML = html

main()
