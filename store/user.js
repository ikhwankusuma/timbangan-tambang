import Cookies from "js-cookie"

export const state = () => {
  return {
    token: null,
    name: '',
    username: '',
    role: ''
  }
}

export const getters = {
  token(state) {
    return state.token
  },
  name(state) {
    return state.name
  },
  username(state) {
    return state.username
  },
  role(state) {
    return state.role
  }
}

export const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
  },
  SET_NAME(state, name) {
    state.name = name
  },
  SET_USERNAME(state, username) {
    state.username = username
  },
  SET_ROLE(state, role) {
    state.role = role
  }
}

export const actions = {
  async refreshToken({ commit, dispatch, getters }) {
    try {
      const { token } = getters
      const { $axios, $config } = this
      const {
        data,
      } = await $axios.post(`${$config.apiURL}/users/refresh-token`, { token })
      if (data.message !== 'SUCCESS') throw new Error(data)
      const { token: newToken, role, name, username } = data
      commit('SET_TOKEN', newToken)
      commit('SET_NAME', name)
      commit('SET_ROLE', role)
      commit('SET_USERNAME', username)
      Cookies.set('token', newToken)
      return { message: 'SUCCESS' }
    } catch (e) {
      dispatch('logout')
      dispatch(
        'alerts/add',
        {
          type: 'error',
          message: 'Logged out',
        },
        {
          root: true,
        }
      )
    }
  },
  async createAdmin({ dispatch }, payload) {
    try {
      const { $axios, $config } = this
      const { data } = await $axios.post(`${$config.apiURL}/users/register`, payload)
      if (data.message !== 'SUCCESS') throw new Error(data)
      return { message: 'SUCCESS' }
    } catch (e) {
      dispatch(
        'alerts/add',
        {
          type: 'error',
          message: e.message,
        },
        {
          root: true,
        }
      )
      return { message: e.message }
    }
  },
  async createUser({ dispatch }, payload) {
    try {
      const { $axios, $config } = this
      const { data } = await $axios.post(`${$config.apiURL}/users/register`, payload)
      if (data.message !== 'SUCCESS') throw new Error(data.message)
      dispatch(
        'alerts/add',
        {
          type: 'success',
          message: 'Pengguna berhasil ditambahkan!',
        },
        { root: true }
      )
      return { message: 'SUCCESS' }
    } catch (e) {
      dispatch(
        'alerts/add',
        {
          type: 'error',
          message: e.message,
        },
        {
          root: true,
        }
      )
      return { message: e.message }
    }
  },
  async deleteUser({ dispatch }, id) {
    try {
      const { $axios, $config } = this
      const { data } = await $axios.delete(`${$config.apiURL}/users/${id}`)
      if (data.message !== 'SUCCESS') throw new Error(data.message)
      dispatch(
        'alerts/add',
        {
          type: 'success',
          message: 'Pengguna berhasil dihapus!',
        },
        { root: true }
      )
      return { message: 'SUCCESS' }
    } catch (e) {
      dispatch(
        'alerts/add',
        {
          type: 'error',
          message: e.message,
        },
        { root: true }
      )
      return { message: e.message }
    }
  },
  async updateUserRole({ dispatch }, payload) {
    try {
      const { $axios, $config } = this
      const { data } = await $axios.put(
        `${$config.apiURL}/users/edit-role`,
        payload
      )
      if (data.message !== 'SUCCESS') throw new Error(data.message)
      dispatch(
        'alerts/add',
        {
          type: 'success',
          message: 'Role pengguna berhasil diubah!',
        },
        { root: true }
      )
      return { message: 'SUCCESS' }
    } catch (e) {
      dispatch(
        'alerts/add',
        {
          type: 'error',
          message: e.message,
        },
        {
          root: true,
        }
      )
      return { message: e.message }
    }
  },
  async edit({ dispatch }, { _id, ...payload }) {
    try {
      const { $axios, $config } = this
      const { data } = await $axios.put(`${$config.apiURL}/users/edit-user/${_id}`, payload)
      if (data.message !== 'SUCCESS') throw new Error(data.message)
      return { message: 'SUCCESS' }
    } catch (e) {

      return { message: e.message }
    }
  },
  async login({ commit, dispatch }, payload) {
    try {
      const { $axios, $config } = this
      const { data } = await $axios.post(
        `${$config.apiURL}/users/login`,
        payload
      )
      if (data.message !== 'SUCCESS') throw new Error(data.message)
      const { name, role, token, username } = data
      commit('SET_TOKEN', token)
      commit('SET_NAME', name)
      commit('SET_ROLE', role)
      commit('SET_USERNAME', username)
      Cookies.set('token', token)
      return { message: 'SUCCESS' }
    } catch (e) {
      dispatch(
        'alerts/add',
        {
          type: 'error',
          message: e.message,
        },
        {
          root: true,
        }
      )
      return { message: e.message }
    }
  },
  logout({ commit }) {
    Cookies.remove('token')
    commit('SET_TOKEN', null)
    commit('SET_NAME', '')
    commit('SET_ROLE', '')
    commit('SET_USERNAME', '')
  },
}