#!/usr/bin/env node
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

// const { json, log, p, pjson } = require('lightsaber')
const request = require('request')
const browserSync = require('browser-sync').create()

const IPFS = 'http://localhost:8080'

const devServer = () => checkProxiedServer(startBrowserSync)

var checkProxiedServer = callback => {
  const url = `${IPFS}/`
  return request(url, (error, response, body) => {
    if (error) {
      console.warn(`WARNING: Could not connect to IPFS at ${url} -- \
if IPFS is desired, make sure the server is running`)
    }
    // process.exit 1
    return callback()
  })
}

var startBrowserSync = () =>
  browserSync.init({
    startPath: 'public',
    files: 'public/*',
    server: {
      baseDir: './',
      middleware: proxyIpfsCalls
    },
    logLevel: 'debug'
  })

var proxyIpfsCalls = (req, res, next) => {
  const pattern = new RegExp(`^/(ipfs|api)/.+$`)
  if (req.url.match(pattern)) {
    const proxyPath = req.url.match(pattern)[0]
    const proxyUrl = `${IPFS}${proxyPath}`
    // log "Attemptimng to proxy to URL: #{proxyUrl}..."
    const proxyRequest = request[req.method.toLowerCase()](proxyUrl)
    return req.pipe(proxyRequest).pipe(res)
  } else {
    return next()
  }
}

devServer()
