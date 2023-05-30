import Cookies from 'js-cookie'

export default ({ $axios, $config, store }) => {
  $axios.setBaseURL($config.apiURL)
  $axios.onRequest((config) => {
    config.validateStatus = (status) => status >= 200 && status < 500
    const token = Cookies.get('token')
    if (token) $axios.setToken(token, 'Bearer')
    else $axios.setToken(null, 'Bearer')
  })
  $axios.onResponse(async (response) => {
    const { config } = response
    if (config.status === 401 && !config._retry) {
      config._retry = true
      const token = Cookies.get('token')
      if (token) {
        const { data } = await $axios.post(
          `${$config.apiURL}/users/refresh-token`,
          {
            token,
          }
        )
        if (data.token) {
          store.commit('users/SET_TOKEN', data.token)
          store.commit('users/SET_ROLE', data.role)
          store.commit('users/SET_USERNAME', data.username)
          Cookies.set('token')
          $axios.setToken(token, 'Bearer')
          config.headers.Authorization = `Bearer ${token}`
          return $axios(config)
        }
      }
    }
    return Promise.resolve(response)
  })
}
