// 获取DOM元素
const imageInput = document.getElementById('imageInput');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
const uploadArea = document.getElementById('uploadArea');
const editArea = document.getElementById('editArea');
const watermarkText = document.getElementById('watermarkText');
const watermarkSize = document.getElementById('watermarkSize');
const watermarkOpacity = document.getElementById('watermarkOpacity');
const watermarkXSlider = document.getElementById('watermarkX');
const watermarkYSlider = document.getElementById('watermarkY');
const downloadBtn = document.getElementById('downloadBtn');

// 获取所有带有range-value的滑块
const rangeInputs = document.querySelectorAll('input[type="range"]');
rangeInputs.forEach(input => {
    const valueDisplay = input.nextElementSibling;
    if (valueDisplay && valueDisplay.classList.contains('range-value')) {
        input.addEventListener('input', () => {
            // 为水印大小添加 px 单位，其他保持百分比
            const unit = input.id === 'watermarkSize' ? 'px' : '%';
            valueDisplay.textContent = `${input.value}${unit}`;
        });
    }
});

let originalImage = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let watermarkX = 0;
let watermarkY = 0;

// 监听图片上传
imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                originalImage = img;
                // 设置canvas尺寸为图片实际尺寸
                imageCanvas.width = img.width;
                imageCanvas.height = img.height;
                // 初始化水印位置
                updateWatermarkPosition();
                // 显示编辑区域
                uploadArea.style.display = 'none';
                editArea.style.display = 'block';
                // 绘制图片和水印
                drawImageAndWatermark();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// 更新水印位置
function updateWatermarkPosition() {
    if (!originalImage) return;
    watermarkX = (watermarkXSlider.value / 100) * originalImage.width;
    watermarkY = (watermarkYSlider.value / 100) * originalImage.height;
}

// 监听所有控件变化
watermarkText.addEventListener('input', drawImageAndWatermark);
watermarkSize.addEventListener('input', drawImageAndWatermark);
watermarkOpacity.addEventListener('input', drawImageAndWatermark);
watermarkXSlider.addEventListener('input', function() {
    updateWatermarkPosition();
    drawImageAndWatermark();
});
watermarkYSlider.addEventListener('input', function() {
    updateWatermarkPosition();
    drawImageAndWatermark();
});

// 监听鼠标事件以实现拖动
imageCanvas.addEventListener('mousedown', function(e) {
    const rect = imageCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 检查是否点击在水印文字区域
    const fontSize = watermarkSize.value;
    const textWidth = ctx.measureText(watermarkText.value).width;
    if (x >= watermarkX && x <= watermarkX + textWidth &&
        y >= watermarkY - fontSize && y <= watermarkY) {
        isDragging = true;
        dragStartX = x - watermarkX;
        dragStartY = y - watermarkY;
    }
});

imageCanvas.addEventListener('mousemove', function(e) {
    if (isDragging) {
        const rect = imageCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        watermarkX = x - dragStartX;
        watermarkY = y - dragStartY;
        
        drawImageAndWatermark();
    }
});

imageCanvas.addEventListener('mouseup', function() {
    isDragging = false;
});

// 绘制图片和水印
function drawImageAndWatermark() {
    if (!originalImage) return;
    
    // 清空画布
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    
    // 绘制原图
    ctx.drawImage(originalImage, 0, 0);
    
    // 设置水印样式
    const text = watermarkText.value || '请输入水印文字';
    const fontSize = watermarkSize.value;
    const opacity = watermarkOpacity.value / 100;
    
    ctx.save(); // 保存当前状态
    
    // 移动到水印位置并旋转
    ctx.translate(watermarkX, watermarkY);
    ctx.rotate(-Math.PI / 6); // 旋转-30度
    
    // 设置水印样式
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = `rgba(128, 128, 128, ${opacity})`;
    
    // 绘制水印
    ctx.fillText(text, 0, 0);
    
    ctx.restore(); // 恢复状态
}

// 下载处理后的图片
downloadBtn.addEventListener('click', function() {
    const link = document.createElement('a');
    link.download = '带水印的图片.png';
    link.href = imageCanvas.toDataURL('image/png');
    link.click();
}); 