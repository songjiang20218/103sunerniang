// const context = cast.framework.CastReceiverContext.getInstance();
// // // Update style using javascript
// // let playerElement = document.getElementsByTagName("cast-media-player")[0];
// // playerElement.style.setProperty('--splash-image', 'url("https://picnew5.photophoto.cn/20101007/hanguowangyemobantupian-17310265_1.jpg")');

// // const playerManager = cast.framework.CastReceiverContext.getInstance().getPlayerManager();
// // const playbackConfig = (Object.assign(new cast.framework.PlaybackConfig(), playerManager.getPlaybackConfig()));
// // playbackConfig.autoResumeNumberOfSegments = 1;
// // playerManager.setPlaybackConfig(playbackConfig);
// // /// 如需为 Web 接收器实现数据流传输，请执行以下操作：
// // playerManager.addSupportedMediaCommands(cast.framework.messages.Command.STREAM_TRANSFER, true);



// const castReceiverOptions = new cast.framework.CastReceiverOptions();
// /// 禁用空闲超时 // 如果为 true，则防止接收器在活动播放停止后空闲时被关闭。此属性应仅用于非媒体应用程序。
// castReceiverOptions.disableIdleTimeout = true;  


// // 以下代码段供 Web 接收器监听来自已连接的发送者的自定义消息：
// const CUSTOM_CHANNEL = 'urn:x-cast:iospp.com.text';
// context.addCustomMessageListener(CUSTOM_CHANNEL, function(customEvent) {
//     // handle customEvent.
//     // console.log(customEvent);
//     // document.getElementById('showMsg').innerHTML = customEvent.data;

//     document.getElementById('msg').textContent = "12333";

//     /// 发送消息给发送者
//     // context.sendCustomMessage(CUSTOM_CHANNEL, customEvent.senderId, customEvent.data);
// });
// // 同样，网络接收器应用可以通过向已连接的发送器发送消息，让发送器了解网络接收器的状态。Web 接收器应用可以使用 CastReceiverContext 上的 sendCustomMessage(namespace, senderId, message) 发送消息。网络接收器可以将消息发送给单个发送者，以响应收到的消息或由于应用状态更改。除了点对点消息传递（上限为 64kb）之外，网络接收器也可以向所有连接的发送器广播消息。

// document.getElementById('msg').textContent = "customEvent.data";

// context.start(castReceiverOptions);



const context = cast.framework.CastReceiverContext.getInstance();
const CHANNEL = 'urn:x-cast:iospp.com.text';
const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = true;
options.customNamespaces = Object.assign({});
options.customNamespaces[CHANNEL] = cast.framework.system.MessageType.JSON;
// 以下代码段供 Web 接收器监听来自已连接的发送者的自定义消息：
context.addCustomMessageListener(CHANNEL, function (customEvent) {
    const data = customEvent.data;
    document.getElementById('msg').textContent = data.msg;
    const objToSender = { type: 'status', message: 'Playing'};
    context.sendCustomMessage(CHANNEL, undefined ,JSON.stringify(objToSender));
});
context.start(options);




