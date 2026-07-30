const remoteVideo = document.getElementById('remoteVideo');
remoteVideo.muted = true;
let ws = null;
let pc = null;
let dataChannel = null;
let interval = null;    // 计时器

function setupWebSocket() {
    if (ws) {
        ws.close();  // 确保关闭现有连接
    }
    ws = new WebSocket('ws://192.168.3.38:8080');
    // 监听连接开启事件
    ws.onopen = () => console.log('WebSocket 连接已开启');
    // 监听错误事件
    ws.onerror = error => console.error('WebSocket 发生错误', error);
    // 监听连接关闭事件
    ws.onclose = event => console.log('WebSocket 连接已关闭', event);
    // 监听接收到消息事件
    ws.onmessage = handleWebSocketMessage;
}

async function handleWebSocketMessage(message) {
    const blobData = new Blob([message.data]);
    blobData.text().then(async (text) => {
        const jsonData = JSON.parse(text);
        if (jsonData.type == "pc_action") {
            handleWebSocketCommand(jsonData.cmd);
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
}

function handleWebSocketCommand(command) {
    switch (command) {
        case "play":
            console.log(pc);
            // console.log(pc.iceConnectionState);
            if (pc == null) {
                setupPeerConnection();
            } else {

            }
            break;
        case "pause":
            remoteVideo.pause();
            break;
        case "hangup":
            console.log("对方挂断");
            pc.close();
            remoteVideo.srcObject = null;
            pc = null;
            break;
        default:
            console.log("未知命令");
    }
}

function handleIceCandidate(candidateData) {
    if (!candidateData) return;
    const candidate = new RTCIceCandidate({
        candidate: candidateData.sdp,
        sdpMid: candidateData.sdpMid,
        sdpMLineIndex: candidateData.sdpMLineIndex
    });
    pc.addIceCandidate(candidate);
}

async function handleOffer(payload) {
    if (pc == null) {
        setupPeerConnection();
    }
    await pc.setRemoteDescription(new RTCSessionDescription(payload));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    const answerJson = { "tag": "web", 'payload': answer, 'type': "SessionDescription" };
    const answerJsonString = JSON.stringify(answerJson);
    const buffer = new Blob([answerJsonString], { type: 'application/json' });
    ws.send(buffer);
}

async function handleAnswer(payload) {

}

function setupPeerConnection() {
    if (pc != null) {
        pc.close();
        remoteVideo.srcObject = null;
        pc = null;
    }

    const configuration = {}; // 这里可以根据需要配置STUN/TURN服务器
    pc = new RTCPeerConnection(configuration);
    dataChannel = pc.createDataChannel("channel");
    dataChannel.onmessage = function (event) {
        const blobData = new Blob([event.data]);
        blobData.text().then((msg) => {
            if (msg === "play") {
                remoteVideo.play().catch(error => {
                    console.error("播放视频失败:", error);
                });
            } else if (msg === "pause") {
                remoteVideo.pause();
            } else if (msg === "hangup") {
                console.log("对方挂断");
                pc.close();
                remoteVideo.srcObject = null;
                pc = null;
            } else {
                console.log("未知消息");
            }
        });
    };

    // 监听ICE候选项事件
    pc.onicecandidate = event => {
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
                tag: "web"
            };
            const candidateJsonStringBuff = JSON.stringify(candidate);
            const buffer = new Blob([candidateJsonStringBuff], { type: 'application/json' });
            ws.send(buffer);
        }
    };

    // 监听远程流的到达
    pc.addEventListener("track", (e) => {
        if (remoteVideo.srcObject !== e.streams[0]) {
            remoteVideo.srcObject = e.streams[0];
            console.log("pc2 received remote stream");
            setTimeout(() => {
                pc.getStats(null).then((stats) => console.log(stats));
            }, 2000);
        }
    });

    // 监听ICE连接状态变化事件
    pc.oniceconnectionstatechange = function (event) {
        console.log("连接状态：", pc.connectionState);
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            console.log('ICE 连接成功！');
        } else if (pc.iceConnectionState === 'disconnected') {
            console.log('ICE 连接断开！');
        } else if (pc.iceConnectionState === 'closed') {
            console.log('ICE 连接关闭！');
        } else if (pc.iceConnectionState === 'checking') {
            console.log('ICE 连接检查中！');
        } else if (pc.iceConnectionState === 'new') {
            console.log('ICE 连接新建！');
        } else if (pc.iceConnectionState === 'completed') {
            console.log('ICE 连接完成！');
        } else if (pc.iceConnectionState === 'failed') {
            // 重启ICE
            restartIce();
            console.log('ICE 连接失败！');
        } else {
            console.log('ICE 连接状态：', pc.iceConnectionState);
        }
    };
}

function restartIce() {
    pc.createOffer({ iceRestart: true }).then(function (offer) {
        return pc.setLocalDescription(offer);
    }).then(function () {
        // 将新的offer发送给对方
        ws.send(JSON.stringify({ type: "offer", payload: pc.localDescription }));
    }).catch(function (error) {
        console.error('重启ICE失败：', error);
    });
}

// 初始化
setupWebSocket();
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
    if (ws.readyState === WebSocket.OPEN) {
        console.log("WebSocket is connected and ready to use.");
        console.log(pc);
    } else {
        console.log("WebSocket is not connected.");
        setupWebSocket();
        setupPeerConnection();
    }
}

// 页面加载完毕后自动开始计时
window.onload = function () {
    startTimer();
}