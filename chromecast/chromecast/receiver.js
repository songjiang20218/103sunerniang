window.castContext = cast.framework.CastReceiverContext.getInstance();
window.CAST_CHANNEL = "urn:x-cast:com.ultraform.Castify";

const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = true;
options.customNamespaces = {};
options.customNamespaces[window.CAST_CHANNEL] =
  cast.framework.system.MessageType.JSON;
window.castReceiverOptions = options;
window.startCastReceiver = function () {
  if (window.castReceiverStarted) {
    return;
  }
  window.castReceiverStarted = true;
  window.castContext.start(window.castReceiverOptions);
};

// // 以下代码段供 Web 接收器监听来自已连接的发送者的自定义消息：
// window.castContext.addCustomMessageListener(window.CAST_CHANNEL, function (customEvent) {
//     const data = customEvent.data;
//     document.getElementById('msg').textContent = data.msg;

//     const objToSender = { type: 'status', message: 'Playing'};
//     window.castContext.sendCustomMessage(window.CAST_CHANNEL, undefined ,JSON.stringify(objToSender));
// });
// Update style using javascript
