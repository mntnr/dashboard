const { merge } = require('lodash')

function checkVitality (files, fullName, stargazersCount, openIssuesCount) {
  files = files || {}
  var vitality
  // TODO Reenable badges
  var README_BADGES = {
    // Travis (repoFullName) {
    //   return `(https://travis-ci.org/${repoFullName})`
    // },
    // Circle (repoFullName) {
    //   return `(https://circleci.com/gh/${repoFullName})`
    // },
    // 'Made By' () {
    //   return '[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)'
    // },
    // Project () {
    //   return '[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)'
    // },
    // IRC () {
    //   return '[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)'
    // }
  }

  var README_SECTIONS = {
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

  var README_OTHER = {
    TODO () {
      return 'TODO'
    }
    // Retained as an example
    // Banner () {
    //   return '![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)'
    // }
  }

  function checkCodeSections (name) {
    if (this.content) {
      if (!this.content.match('This repository is (only for documents|a \\*\\*work in progress\\*\\*)\\.')) {
        return (this.content.indexOf(this.items[name]()) >= 0)
      }
    }
    return 'na'
  }

  vitality = {
    readme: {
      content: files.README,
      charLength: function () {
        return (this.content) ? (this.content.length > 500) : 'na'
      },
      sections: README_SECTIONS,
      other: README_OTHER,
      badges: README_BADGES,
      items: merge(README_SECTIONS, README_OTHER),
      toc: function toc () {
        if (this.content && !(this.content.split('\n').length) < 100) {
          return (this.content.indexOf(this.items['ToC']())) >= 0
        }
        return 'na'
      },
      checkCodeSections: checkCodeSections,
      noTODOs: function noTODOs () {
        // TODO Return the TODO count ironically
        return (this.content) ? (this.content.indexOf(this.items['TODO']()) === -1) : 'na'
      },
      section: function section (name) {
        return (this.content) ? (this.content.indexOf(this.items[name]()) >= 0) : 'na'
      }
    },
    license: files.LICENSE,
    contribute: files.CONTRIBUTE
  }

  return vitality
}

module.exports = checkVitality
