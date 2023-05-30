import cookieparser from 'cookieparser'
import Cookies from 'js-cookie'

export const state = () => {
  return {
    mode: 'desktop',
    config: null
  }
}

export const getters = {
  mode(state) {
    return state.mode
  },
  config(state) {
    return state.config
  }
}

export const mutations = {
  CHANGE_MODE(state, mode) {
    state.mode = mode === 'mobile' ? 'mobile' : 'desktop'
  },
  SET_CONFIG(state, config) {
    state.config = config
  }
}

export const actions = {
  async nuxtServerInit({ dispatch, commit }, { req }) {
    try {
      const { $axios, $config } = this
      const { data } = await $axios.get(`${$config.apiURL}/admin/config`)
      if (data.message !== 'SUCCESS') throw new Error(data.message)
      commit('SET_CONFIG', data.config)
      if (req.headers.cookie) {
        const { token } = cookieparser.parse(req.headers.cookie)
        if (token) {
          const { data } = await $axios.post(
            `${$config.apiURL}/users/refresh-token`,
            {
              token,
            }
          )
          if (data.message !== 'SUCCESS') dispatch('user/logout')
          const { token: newToken, role, username, name } = data
          commit('user/SET_TOKEN', newToken)
          commit('user/SET_NAME', name)
          commit('user/SET_ROLE', role)
          commit('user/SET_USERNAME', username)
          Cookies.set('token', token)
        }
      }
      return { message: 'SUCCESS' }
    } catch (e) {
      if (!req.headers.cookie)
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
    }
  },
  async createConfig({ dispatch, commit }, payload) {
    try {
      const { $axios, $config } = this
      const { data } = await $axios.post(
        `${$config.apiURL}/admin/create-config`,
        payload
      )
      if (data.message !== 'SUCCESS') throw new Error(data.message)
      const {
        data: { config },
      } = await $axios.get(`${$config.apiURL}/admin/config`)
      commit('SET_CONFIG', config)
      return { message: 'SUCCESS', code: data.code }
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
  async activateApp({ dispatch, commit }, payload) {
    try {
      const { $axios, $config } = this
      const { data } = await $axios.post(
        `${$config.apiURL}/admin/activate`,
        payload
      )
      if (data.message !== 'SUCCESS') throw new Error(data.message)
      const {
        data: { config },
      } = await $axios.get(`${$config.apiURL}/admin/config`)
      commit('SET_CONFIG', config)
      return { message: 'SUCCESS', code: data.code }
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
  async editConfig({ dispatch, commit }, payload) {
    try {
      const { $axios, $config } = this
      const { data } = await $axios.put(
        `${$config.apiURL}/admin/edit-config`,
        payload
      )
      if (data.message !== 'SUCCESS') throw new Error(data.message)
      const {
        data: { config },
      } = await $axios.get(`${$config.apiURL}/admin/config`)
      commit('SET_CONFIG', config)
      dispatch(
        'alerts/add',
        {
          type: 'success',
          message: 'Informasi perusahaan berhasil diubah!',
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
  changeMode({ commit }, mode) {
    commit('CHANGE_MODE', mode)
  }
}