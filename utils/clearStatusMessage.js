const clearStatusMsg = (message, context) => {
  // add message to context
  context.message = { ...message }

  // clear the message object
  message.body = ''
  message.status = 0
}

module.exports = clearStatusMsg