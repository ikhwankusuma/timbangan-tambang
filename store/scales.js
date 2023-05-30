export const state = () => {
  return {
    datas: [],
    limit: false,
    skip: 0,
    query: '',
    status: '',
    type: '',
    startDate: 0,
    endDate: 0,
    customers: [],
    suppliers: [],
    materials: [],
    summary: {},
  }
}

export const getters = {
  datas(state) {
    return state.datas
  },
  limit(state) {
    return state.limit
  },
  skip(state) {
    return state.skip
  },
  query(state) {
    return state.query
  },
  status(state) {
    return state.status
  },
  type(state) {
    return state.type
  },
  startDate(state) {
    return state.startDate
  },
  endDate(state) {
    return state.endDate
  },
  customers(state) {
    return state.customers
  },
  suppliers(state) {
    return state.suppliers
  },
  materials(state) {
    return state.materials
  },
  summary(state) {
    return state.summary
  }
}

export const mutations = {
  SET_DATAS(state, datas) {
    state.datas = datas
  },
  UNSHIFT_DATA(state, data) {
    state.datas.unshift(data)
  },
  EDIT_DATA(state, data) {
    const index = state.datas.findIndex((a) => a._id === data._id)
    if (index > -1) {
      state.datas[index] = data
      state.datas = JSON.parse(JSON.stringify(state.datas))
    }
  },
  SET_LIMIT(state, limit) {
    state.limit = limit
  },
  SET_QUERIES(state, { skip, status, type, query, startDate, endDate }) {
    if (skip !== undefined) state.skip = skip
    if (status !== undefined) state.status = status
    if (type !== undefined) state.type = type
    if (query !== undefined) state.query = query
    if (startDate !== undefined) state.startDate = startDate
    if (endDate !== undefined) state.endDate = endDate
  },
  SET_CUSTOMERS(state, customers) {
    state.customers = customers
  },
  SET_SUPPLIERS(state, suppliers) {
    state.suppliers = suppliers
  },
  SET_MATERIALS(state, materials) {
    state.materials = materials
  },
  PUSH_DATAS(state, datas) {
    state.datas.push(...datas)
  },
  SET_SUMMARY(state, summary) {
    state.summary = summary
  }
}

export const actions = {
  setQueries({ commit }, queries) {
    commit('SET_QUERIES', queries)
    commit('SET_LIMIT', false)
  },
  async load({ commit, getters }) {
    try {
      const { $axios, $config } = this
      const {
        skip,
        query,
        status,
        type,
        startDate,
        endDate,
      } = getters
      const queryString = `?limit=${6
        }${skip ? `&skip=${skip}` : ''
        }${query ? `&material=${query}` : ''
        }${query ? `&supplier=${query}` : ''
        }${query ? `&customer=${query}` : ''
        }${query ? `&material=${query}` : ''
        }${query ? `&license=${query}` : ''
        }${status ? `&status=${status}` : ''
        }${typeof type === 'number' && type > -1 ? `&type=${type}` : ''
        }${startDate ? `&start_date=${startDate}` : ''
        }${endDate ? `&end_date=${endDate}` : ''
        }
      `
      const result = await $axios.get(`${$config.apiURL}/scales${queryString}`)
      if (result.status >= 400) throw new Error(result.data)
      const { data } = result
      if (data.scales.length < 6) commit('SET_LIMIT', true)
      else commit('SET_QUERIES', { skip: skip + 6 })
      if (skip === 0) commit('SET_DATAS', data.scales)
      else commit('PUSH_DATAS', data.scales)
      commit('SET_CUSTOMERS', data.customers)
      commit('SET_SUPPLIERS', data.suppliers)
      commit('SET_MATERIALS', data.materials)
      return { message: 'SUCCESS' }
    } catch (e) {
      return { message: e.message }
    }
  },
  async loadSummary({ commit, getters }) {
    try {
      const { $axios, $config } = this
      const {
        query,
        status,
        type,
        startDate,
        endDate,
      } = getters
      const queryString = `?${query ? `&material=${query}` : ''
        }${query ? `&supplier=${query}` : ''
        }${query ? `&customer=${query}` : ''
        }${query ? `&material=${query}` : ''
        }${query ? `&license=${query}` : ''
        }${status ? `&status=${status}` : ''
        }${typeof type === 'number' && type > -1 ? `&type=${type}` : ''
        }${startDate ? `&start_date=${startDate}` : ''
        }${endDate ? `&end_date=${endDate}` : ''
        }
      `
      const result = await $axios.get(`${$config.apiURL}/scales/summary${queryString}`)
      const { data } = result
      if (result.status >= 400) throw new Error(result.data)
      commit('SET_SUMMARY', data)
      commit('SET_CUSTOMERS', data.customers)
      commit('SET_SUPPLIERS', data.suppliers)
      commit('SET_MATERIALS', data.materials)
      return { message: 'SUCCESS' }
    } catch (e) {
      return { message: e.message }
    }
  },
  async uploadScale({ getters, commit, dispatch }, {
    images,
    weight,
    ...payload
  }) {
    try {
      const { $axios, $config } = this
      const result = await $axios.post(`${$config.apiURL}/scales/`, { weight, ...payload })
      if (result.status >= 400) throw new Error(result.data)
      if (images) {
        const payload = {
          images: images.map((a) => {
            return {
              ...a,
              label: weight ? a.label : `entry-${a.label}.jpeg`
            }
          })
        }
        $axios.put(`${$config.apiURL}/scales/upload-images/${result.data.data._id}`, payload)
      }
      commit('UNSHIFT_DATA', result.data.data)
      commit('SET_QUERIES', { skip: getters.skip + 1 })
      if (weight) dispatch('uploadScales')
      return { message: 'SUCCESS', data: result.data.data }
    } catch (e) {
      return { message: e.message }
    }
  },

  async editScale({ commit, dispatch }, { id, images, ...payload }) {
    try {
      const { $axios, $config } = this
      const result = await $axios.put(`${$config.apiURL}/scales/${id}`, payload)
      if (result.status >= 400) throw new Error(result.data)
      let uploaded = null
      if (images) {
        const payload = {
          images: images.map((a) => {
            return {
              ...a,
              label: `exit-${a.label}.jpeg`
            }
          })
        }
        const uploadResult = await $axios.put(`${$config.apiURL}/scales/upload-images/${result.data.data._id}`, payload)
        if (uploadResult.status >= 400) throw new Error(uploadResult.data)
        uploaded = uploadResult.data.data
      }
      if (uploaded)
        commit('EDIT_DATA', uploaded)
      else
        commit('EDIT_DATA', result.data.data)
      dispatch('uploadScales')
      return { message: 'SUCCESS', data: result.data.data }
    } catch (e) {
      return { message: e.message }
    }
  },
  async uploadScales({ rootGetters }) {
    try {
      const { $axios, $config } = this
      await $axios.put(`${$config.apiURL}/scales/upload-datas?url=${rootGetters.config.url}`)
    } catch (e) { }
  },
}