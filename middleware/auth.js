export default ({ redirect, store }) => {
  const { name, type, 'users/token': token } = store.getters
  if (!name || !type) {
    return redirect('/generate')
  } else if (!token) {
    return redirect('/login')
  }
}
