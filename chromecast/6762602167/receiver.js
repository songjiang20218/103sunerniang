export const context = cast.framework.CastReceiverContext.getInstance();
export const CHANNEL = "urn:x-cast:com.infrared.chromecast";

const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = true;
options.customNamespaces = Object.assign({});
options.customNamespaces[CHANNEL] = cast.framework.system.MessageType.JSON;

// // 以下代码段供 Web 接收器监听来自已连接的发送者的自定义消息：
// context.addCustomMessageListener(CHANNEL, function (customEvent) {
//     const data = customEvent.data;
//     document.getElementById('msg').textContent = data.msg;

//     const objToSender = { type: 'status', message: 'Playing'};
//     context.sendCustomMessage(CHANNEL, undefined ,JSON.stringify(objToSender));
// });
// Update style using javascript

context.start(options);
