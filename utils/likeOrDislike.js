const likeOrDislike = async (space, user, l1, l2, action) => {
  if (!l1.includes(user._id)) {
    // increment likes or dislikes based on action
    if (action === 'like') {
      space.likes += 1
    } else if (action === 'dislike') {
      space.dislikes += 1
    }
    // add user id to first list
    l1.push(user._id)

    // get the index of the user in the second list (l2)
    const idx = l2.indexOf(user._id)
    if (idx !== -1) {
      l2.splice(idx, 1)
      // decrement likes or dislikes by 1 based on action
      if (action === 'like') {
        space.dislikes -= 1
      } else if (action === 'dislike') {
        space.likes -= 1
      }
    }

    // save changes
    await space.save()
  }
}

module.exports = likeOrDislike
