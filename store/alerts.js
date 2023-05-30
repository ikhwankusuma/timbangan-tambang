export const state = () => {
  return {
    alerts: [],
  }
}

export const getters = {
  alerts(state) {
    return state.alerts
  },
}

let id = 0

export const mutations = {
  PUSH(state, alert) {
    state.alerts.push({
      ...alert,
      id: id++,
    })
  },
  DELETE(state, id) {
    state.alerts = state.alerts.filter((a) => a.id !== id)
  },
}

export const actions = {
  add({ commit }, alert) {
    commit('PUSH', alert)
  },
  remove({ commit }, id) {
    commit('DELETE', id)
  },
}