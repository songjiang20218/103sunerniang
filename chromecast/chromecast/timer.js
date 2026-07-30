let seconds = 0;
let interval = null;

// 定义计时器函数
function timer() {
    seconds++;
    document.getElementById('timer').textContent = formatTime(seconds);
}

// 格式化时间显示
function formatTime(sec) {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec - (hours * 3600)) / 60);
    const seconds = sec - (hours * 3600) - (minutes * 60);

    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
}

// 开始计时器
function startTimer() {
    if (interval === null) {
        interval = setInterval(timer, 1000);
    }
}

// 停止计时器
function stopTimer() {
    if (interval !== null) {
        clearInterval(interval);
        interval = null;
    }
}

// 重置计时器
function resetTimer() {
    stopTimer();
    seconds = 0;
    document.getElementById('timer').textContent = "00:00:00";
}

// 页面加载完毕后自动开始计时
window.onload = function() {
    startTimer();
}