# project-repos

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Project health metrics

This is a status board for the github repositories within the IPFS organization.
It displays build health, and other measures that we care about internally.

Check out the latest here: <http://project-repos.ipfs.io/>.

Hosted on IPFS!

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Local development](#local-development)
- [Deploy](#deploy)
- [Contribute](#contribute)
- [License](#license)

## Install

Simply clone this repo.

## Usage

### Local development

To recompile continuously, and start a development server with hot reloading:

    npm run dev

To build minified javascript for production:

    npm run build

## Deploy

To deploy this, after merging any new PRs, follow these steps:

1. Have an ipfs daemon running: `ipfs daemon`
2. Kill your `npm run dev` script if you happen to have it running.
3. `npm install && npm prune`
4. `npm run publish`. This should open the published page on the gateway.
5. Pin the hash: `ipfs pin add <hash>`
6. Pin the hash to the gateways, on IRC: `!pin <hash> project-repos.ipfs.io`
7. Post the hash and url to https://github.com/ipfs/ops-requests/issues.

## Contribute

If you would like to contribute code to this repository, please dive in! Check out [the issues](//github.com/ipfs/project-repos/issues). Clicking the banner above will lead you to the general [IPFS community contribute guidelines](https://github.com/ipfs/community/blob/master/contributing.md), if you would like to contribute in other ways.

If you would like to have your repository listed here, please move it to the IPFS organization. If you are not part of the organization, ask someone if you can join, or fork this project and set it up for your own repositories.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
