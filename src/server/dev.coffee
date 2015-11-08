#!/usr/bin/env coffee

{ json, log, p, pjson } = require 'lightsaber'
request = require 'request'
browserSync = require('browser-sync').create()

IPFS = 'http://localhost:8080'

devServer = ->
  checkProxiedServer startBrowserSync

checkProxiedServer = (callback) ->
  url = "#{IPFS}/"
  request url, (error, response, body) ->
    if error
      console.warn "WARNING: Could not connect to IPFS at #{url} --
        if IPFS is desired, make sure the server is running"
      # process.exit 1
    callback()

startBrowserSync = ->
  browserSync.init
    startPath: 'public'
    files: 'public/*'
    server:
      baseDir: './'
      middleware: proxyIpfsCalls

proxyIpfsCalls = (req, res, next) ->
  pattern = /// ^/(ipfs|api)/.+$ ///
  if req.url.match pattern
    proxyPath = req.url.match(pattern)[0]
    proxyUrl = "#{IPFS}#{proxyPath}"
    # log "Attemptimng to proxy to URL: #{proxyUrl}..."
    proxyRequest = request[req.method.toLowerCase()](proxyUrl)
    req.pipe(proxyRequest).pipe res
  else
    next()

devServer()
