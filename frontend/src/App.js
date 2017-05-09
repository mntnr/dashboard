import React from 'react'
import Reflux from 'reflux'
import UserStore from './stores/user-store'
import UserActions from './actions/user-actions'
import logo from './logo.svg'
import './App.css'

let i = 0

class App extends Reflux.Component {
  constructor(props) {
    super(props)
    this.state = {
      repos: [],
      enabledRepos: [],
    }
    this.store = UserStore
  }

  componentWillMount () {
    super.componentWillMount()
    UserActions.getRepos()
  }

  onEnableRepo (repo) {
    UserActions.enableRepo(repo.id)
  }

  onDisableRepo (repo) {
    UserActions.disableRepo(repo.id)
  }

  render() {
    console.log("render", this.state.enabledRepos)
    let repoList
    let { repos, enabledRepos } = this.state
    if (repos && enabledRepos) {
      repoList = repos.map((repo, index) => {
        const isEnabled = enabledRepos.find(e => e.id === repo.id)
        return isEnabled 
          ? <div key={"repo_" + index} onClick={this.onDisableRepo.bind(this, repo)}><b>#{index + 1} {repo.htmlUrl} ENABLED</b><br/></div>
          : <div key={"repo_" + index} onClick={this.onEnableRepo.bind(this, repo)}>#{index + 1} {repo.htmlUrl}<br/></div>
      })
    }

    return (
      <div className="App">
        <div className="App-header">
          <h1>Welcome to Maintainer.io</h1>
        </div>
        <div className="">
          <h3>User Info:</h3>
          {this.state.name}<br/>
          {this.state.id}<br/>
        </div>
        <div className="">
          <h3>Repositories:</h3>
          <div className="">
            {repoList}
          </div>
        </div>
      </div>
    )
  }
}

export default App
