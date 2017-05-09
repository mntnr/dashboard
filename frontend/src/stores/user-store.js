import Reflux from 'reflux'
import UserActions from '../actions/user-actions'

const initialUserData = {
  id: null,
  name: 'haadcode',
  email: null,
  repos: [],
  enabledRepos: [],
}

class UserStore extends Reflux.Store {
  constructor() {
    super()
    this.state = initialUserData
    this.listenTo(UserActions.getRepos, this.onGetRepositories)
    this.listenTo(UserActions.enableRepo, this.onEnableRepository)
    this.listenTo(UserActions.disableRepo, this.onDisableRepository)
  }

  onGetRepositories () {
    console.log("fetch repos")
    fetch('http://localhost:4000/user/repos', { mode: ' no-cors' })
      .then((response) => response.json())
      .then((allRepos) => {
        console.log("1>", allRepos)
        fetch('http://localhost:4000/user/repos/enabled', { mode: ' no-cors' })
          .then((response) => response.json())
          .then((enabledRepos) => {
            console.log("2>", enabledRepos)
            this.setState({ 
              repos: allRepos.items, 
              enabledRepos: enabledRepos.items 
            })
          })
          .catch(e => console.error(e))
      })
      .catch(e => console.error(e))
  }

  onEnableRepository (repoId) {
    fetch('http://localhost:4000/user/repos/enable/' + repoId, { mode: ' no-cors' })
      .then((response) => response.json())
      .then((enabledRepos) => {
        console.log("enabled >>", enabledRepos)
        this.setState({ enabledRepos: enabledRepos.items })
      })
      .catch(e => console.error(e))
  }

  onDisableRepository (repoId) {
    fetch('http://localhost:4000/user/repos/disable/' + repoId, { mode: ' no-cors' })
      .then((response) => response.json())
      .then((enabledRepos) => {
        console.log("enabled >>>", enabledRepos)
        this.setState({ enabledRepos: enabledRepos.items })
      })
      .catch(e => console.error(e))
  }
}

export default UserStore
