import { context, CHANNEL } from "./receiver.js";

const remoteVideo = document.getElementById("remoteVideo");
const logo = document.getElementById("logo");
const defaultCast = document.getElementById("defaultCast");
// const msg = document.getElementById("msg");

remoteVideo.display = "none";
let pc = null;
let dataChannel = null;
let interval = null; // 计时器

function addMsg(msg) {
  // // 获取 msg 元素
  // var msgElement = document.getElementById("msg");
  // // 每次更新内容时，将新内容添加到现有内容后面
  // msgElement.innerHTML += msg + "<br>";
}

context.addEventListener(
  cast.framework.system.EventType.SESSION_END,
  function (event) {
    console.log("Session Ended: " + event.reason);
    // 关闭应用
    // msg.innerHTML("session ended" + event.reason);
    window.close();
  }
);
// 以下代码段供 Web 接收器监听来自已连接的发送者的自定义消息：
context.addCustomMessageListener(CHANNEL, function (customEvent) {
  remoteVideo.style.opacity = 1;
  defaultCast.style.display = "none";
  const jsonData = customEvent.data;
  if (jsonData.type == "pc_action") {
    // addMsg(jsonData.cmd);
    handleCommand(jsonData.cmd);
  } else if (jsonData.type == "IceCandidate") {
    handleIceCandidate(jsonData.payload);
  } else {
    if (jsonData.payload == undefined) {
      return;
    }
    const payload = jsonData.payload;
    if (payload["type"] == "offer") {
      handleOffer(payload);
    } else if (payload["type"] == "answer") {
      handleAnswer(payload);
    } else {
    }
  }
});

// 本地connection添加ice候选项
async function handleIceCandidate(candidateData) {
  if (!candidateData) return;
  const candidate = new RTCIceCandidate({
    candidate: candidateData.sdp,
    sdpMid: candidateData.sdpMid,
    sdpMLineIndex: candidateData.sdpMLineIndex,
  });
  pc.addIceCandidate(candidate);
}

// 处理客户端发送的offer
async function handleOffer(payload) {
  if (pc == null) {
    setupPeerConnection();
  }
  await pc.setRemoteDescription(new RTCSessionDescription(payload));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  const answerJson = {
    tag: "web",
    payload: answer,
    type: "SessionDescription",
  };
  const answerJsonString = JSON.stringify(answerJson);
  // msg.innerHTML = "handleOffer == " + answerJsonString;
  context.sendCustomMessage(CHANNEL, undefined, answerJsonString);
}

// 处理客户端发送的answer
async function handleAnswer(payload) {
  if (pc == null) {
    setupPeerConnection();
  }
  // msg.innerHTML = "handleAnswer == " + JSON.stringify(payload);
  // addMsg("handleAnswer == " + "<br>" + JSON.stringify(payload));
  await pc.setRemoteDescription(new RTCSessionDescription(payload));
}

/////////
// 创建一个Offer，当客户端需要web主动发起时调用
async function webSendOffer() {
  if (pc == null) {
    setupPeerConnection();
    // addMsg("createOffer ==》 setupPeerConnection");
  }
  // addMsg("createOffer ==》 pc.createOffer()");
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const offerJson = { tag: "web", payload: offer, type: "SessionDescription" };
  const offerJsonString = JSON.stringify(offerJson);
  // addMsg(offerJsonString);
  // msg.innerHTML = "handleAnswer == " + offerJsonString;
  context.sendCustomMessage(CHANNEL, undefined, offerJsonString);
}

// 命令处理
function handleCommand(cmd) {
  if (cmd == "webSendOffer") {
    webSendOffer();
  }
  if (cmd == "play") {
    play();
  }
  if (cmd == "pause") {
    pause();
  }
  if (cmd == "hangup") {
    hangup();
  }
  if (cmd == "muted") {
    remoteVideo.muted = true;
  }
  if (cmd == "unmute") {
    remoteVideo.muted = false;
  }
}

// 播放
function play() {
  remoteVideo.play().catch((error) => {
    console.error("播放视频失败:", error);
  });
}

// 暂停
function pause() {
  remoteVideo.pause();
}

// 挂断
function hangup() {
  // 检查 pc 是否存在
  try {
    if (pc) {
      // 关闭所有流
      pc.getSenders().forEach(function (sender) {
        if (sender.track) {
          // msg.innerHTML = "获取到关闭流";
          sender.track.stop();
        }
      });
      // 关闭连接
      pc.close();

      // 清除视频元素的源
      remoteVideo.srcObject = null;
      // 重置 RTCPeerConnection 变量
      pc = null;
      // logo.style.display = "block";
      window.close();
    } else {
      pc = null;
      // logo.style.display = "block";
      window.close();
    }
    remoteVideo.style.opacity = 0;
    defaultCast.style.display = "block";
    // msg.innerHTML = "断开连接";
  } catch (error) {
    pc = null;
    remoteVideo.srcObject = null;
    window.close();
    // logo.style.display = "block";
    remoteVideo.style.opacity = 0;
    defaultCast.style.display = "block";
    // msg.innerHTML = "断开连接";
  }
}

// 创建PeerConnection
function setupPeerConnection() {
  // msg.innerHTML = "创建PeerConnection";
  if (pc != null) {
    hangup();
  }
  const configuration = {
    // iceServers: [
    //     // 公共STUN服务器
    //     {
    //         urls: "stun:stun.l.google.com:19302"
    //     },
    //     // 配置TURN服务器
    //     {
    //         urls: "turn:your.turn.server:3478", // 这里替换为您的TURN服务器地址
    //         username: "turn_username",         // 替换为有效的用户名
    //         credential: "turn_password"        // 替换为有效的密码
    //     }
    // ]
  }; // 这里可以根据需要配置STUN/TURN服务器
  pc = new RTCPeerConnection(configuration);
  dataChannel = pc.createDataChannel("channel");
  // 监听数据通道消息
  // msg.innerHTML = "监听数据通道消息";
  dataChannel.onmessage = function (event) {
    const blobData = new Blob([event.data]);
    blobData.text().then((msg) => {
      // msg.innerHTML = "收到消息" + msg;
      if (msg === "play") {
        play();
      } else if (msg === "pause") {
        pause();
      } else if (msg === "hangup") {
        hangup();
      } else if (msg == "muted") {
        remoteVideo.muted = true;
      } else if (msg == "unmute") {
        remoteVideo.muted = false;
      }  else if (msg == "extensionFinish") {
        // remoteVideo.muted = false;
        // msg.innerHTML = "extensionFinish 结束";
        // window.close();
      } else {
        console.log("未知消息");
      }
    });
  };

  // 监听ICE候选项事件
  pc.onicecandidate = (event) => {
    // app端发送的数据格式
    if (event.candidate) {
      const candidateJsonString = JSON.stringify(event.candidate);
      const candiateJson = JSON.parse(candidateJsonString);
      const candidate = {
        payload: {
          sdp: candiateJson.candidate,
          sdpMLineIndex: candiateJson.sdpMLineIndex,
          sdpMid: candiateJson.sdpMid,
        },
        type: "IceCandidate",
        tag: "web",
      };
      const candidateJsonStringBuff = JSON.stringify(candidate);
      context.sendCustomMessage(CHANNEL, undefined, candidateJsonStringBuff);
    }
  };

  // 监听远程流的到达
  pc.addEventListener("track", (e) => {
    // if (remoteVideo.srcObject !== e.streams[0]) {

    // }else{
    //   msg.innerHTML = "srcObject 一样"
    // }
    // msg.innerHTML = "远程流到达" + e.streams[0];
    remoteVideo.srcObject = e.streams[0];
    console.log("pc2 received remote stream");
    // logo.style.display = "none";
    setTimeout(() => {
      pc.getStats(null).then((stats) => console.log(stats));
    }, 2000);
  });

  // 监听ICE连接状态变化事件
  pc.oniceconnectionstatechange = function (event) {
    console.log("连接状态：", pc.connectionState);
    if (
      pc.iceConnectionState === "connected" ||
      pc.iceConnectionState === "completed"
    ) {
      console.log("ICE 连接成功！");
      // msg.innerHTML = "ICE 连接成功！";
    } else if (pc.iceConnectionState === "disconnected") {
      console.log("ICE 连接断开！");
      hangup();
      // msg.innerHTML = "ICE 连接断开！";
    } else if (pc.iceConnectionState === "closed") {
      console.log("ICE 连接关闭！");
      // msg.innerHTML = "ICE 连接关闭！";
    } else if (pc.iceConnectionState === "checking") {
      console.log("ICE 连接检查中！");
    } else if (pc.iceConnectionState === "new") {
      console.log("ICE 连接新建！");
    } else if (pc.iceConnectionState === "completed") {
      console.log("ICE 连接完成！");
    } else if (pc.iceConnectionState === "failed") {
      msg.innerHTML = "ICE 连接失败！尝试重启";
      // 重启ICE
      restartIce();
      console.log("ICE 连接失败！");
    } else {
      console.log("ICE 连接状态：", pc.iceConnectionState);
    }
  };
}

function restartIce() {
  pc.createOffer({ iceRestart: true })
    .then(function (offer) {
      return pc.setLocalDescription(offer);
    })
    .then(function () {
      // 将新的offer发送给对方
      var offdata = {
        tag: "web",
        type: "SessionDescription",
        payload: pc.localDescription,
      };
      context.sendCustomMessage(CHANNEL, undefined, JSON.stringify(offdata));
    })
    .catch(function (error) {
      console.error("重启ICE失败：", error);
    });
}

// 初始化
setupPeerConnection();

// 开始计时器
function startTimer() {
  if (interval === null) {
    interval = setInterval(timer, 5000);
  }
}

// 定义计时器函数
function timer() {
  console.log("执行一次");

  // document.getElementById("msg").innerText = Date.now();
  // if (ws.readyState === WebSocket.OPEN) {
  //     console.log("WebSocket is connected and ready to use.");
  //     console.log(pc);
  // } else {
  //     console.log("WebSocket is not connected.");
  //     setupWebSocket();
  //     setupPeerConnection();
  // }
}

// 页面加载完毕后自动开始计时
window.onload = function () {
  // startTimer();

};
