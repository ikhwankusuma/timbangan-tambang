export const state = () => {
  return {
    cameras: [],
  }
}

export const getters = {
  cameras(state) {
    return state.cameras
  }
}

export const mutations = {
  SET_CAMERAS(state, cameras) {
    state.cameras = cameras
    localStorage.setItem('cameras', JSON.stringify(cameras))
  },
  INSERT_CAMERA(state, camera) {
    state.cameras.push(camera)
    localStorage.setItem('cameras', JSON.stringify(state.cameras))
  },
  REMOVE_CAMERA(state, ip) {
    const index = state.cameras.findIndex((a) => a.ip === ip)
    if (index > -1) {
      state.cameras.splice(index, 1)
      localStorage.setItem('cameras', JSON.stringify(state.cameras))
    }
  }
}

export const actions = {
  load({ commit }) {
    const camerasRaw = localStorage.getItem('cameras')
    if (camerasRaw) {
      const cameras = JSON.parse(camerasRaw)
      commit('SET_CAMERAS', cameras)
    }
  },
  insert({ commit }, camera) {
    commit('INSERT_CAMERA', camera)
  },
  remove({ commit }, ip) {

    commit('REMOVE_CAMERA', ip)
  }
}