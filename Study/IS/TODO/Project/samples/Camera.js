function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// --- 視訊控制功能 ---

// 1. 取得 DOM 元素
const videoElement = document.getElementById('video-stream');
const startButton = document.getElementById('start-video');
const stopButton = document.getElementById('stop-video');
const snapshotButton = document.getElementById('snapshot'); // (快照按鈕)

// (新增) 取得快照的顯示區域
const snapshotGallery = document.getElementById('snapshot-gallery');

let currentStream = null; // 用來存放當前的視訊流

// 2. 開始視訊功能
async function startVideoStream() {
    try {
        if (currentStream) {
            stopVideoStream();
        }
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });
        currentStream = stream;
        videoElement.srcObject = stream;
        videoElement.play();
    } catch (err) {
        console.error("無法存取攝影機: ", err);
        alert("無法啟動視訊，請檢查攝影機權限是否已開啟。");
    }
}

// 3. 停止視訊功能
function stopVideoStream() {
    if (currentStream) {
        const tracks = currentStream.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
        currentStream = null;
    }
}

// 4. (新增) 擷取快照功能
function takeSnapshot() {
    if (!currentStream) {
        alert("請先啟動視訊。");
        return;
    }

    // 1. 建立一個 <canvas> 元素 (在記憶體中)
    const canvas = document.createElement('canvas');
    
    // 2. 設定 canvas 尺寸與視訊的實際尺寸相同
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // 3. 將目前視訊畫面 "繪製" 到 canvas 上
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // 4. 將 canvas 內容轉換為圖片的 Data URL (base64)
    const dataUrl = canvas.toDataURL('image/png');

    // 5. 建立一個 <img> 元素來顯示
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = "擷取快照";

    // 6. 將圖片加到 "資訊一" 的 gallery 中
    snapshotGallery.appendChild(img); // (搭配 CSS 的 flex-direction-reverse, appendChild 會顯示在最上方)
}

// 5. 綁定事件監聽器
startButton.addEventListener('click', startVideoStream);
stopButton.addEventListener('click', stopVideoStream);
snapshotButton.addEventListener('click', takeSnapshot); // (新增) 綁定快照按鈕
