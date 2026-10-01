/**
 * GIFEraser – GIF Background Remover
 * Uses libgif (SuperGif) to extract frames, then gif.js to re-encode with transparency.
 */

'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
let currentFile   = null;
let superGif      = null;   // SuperGif instance (for frame extraction)
let isStaticImage = false;
let isVideoFile = false;
let staticImgObj  = null;
let frameCount    = 0;
let frameDelays   = [];
let resultBlobUrl = null;
let sourceBlobUrl = null;
let lastStaticProcessedUrl = null; // Save static transparent image for animation
let customSeeds   = [];     // Tọa độ click thủ công để xóa nền lọt thỏm

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const fileInput         = document.getElementById('fileInput');
const dropZone          = document.getElementById('dropZone');
const uploadSection     = document.getElementById('uploadSection');
const workspace         = document.getElementById('workspace');
const originalImg       = document.getElementById('originalImg');
const originalMeta      = document.getElementById('originalMeta');
const resultImg         = document.getElementById('resultImg');
const resultMeta        = document.getElementById('resultMeta');
const placeholderResult = document.getElementById('placeholderResult');
const bgColorInput      = document.getElementById('bgColor');
const colorValue        = document.getElementById('colorValue');
const toleranceSlider   = document.getElementById('toleranceSlider');
const toleranceVal      = document.getElementById('toleranceVal');
const featherSlider     = document.getElementById('featherSlider');
const featherVal        = document.getElementById('featherVal');
const speedSlider       = document.getElementById('speedSlider');
const speedVal          = document.getElementById('speedVal');
const compressSlider    = document.getElementById('compressSlider');
const compressVal       = document.getElementById('compressVal');
const compressHint      = document.getElementById('compressHint');
const removeIslandsCheck= document.getElementById('removeIslands');
const processBtn        = document.getElementById('processBtn');
const resetBtn          = document.getElementById('resetBtn');
const downloadBtn       = document.getElementById('downloadBtn');
const progressSection   = document.getElementById('progressSection');
const progressLabel     = document.getElementById('progressLabel');
const progressPct       = document.getElementById('progressPct');
const progressFill      = document.getElementById('progressFill');
const frameInfo         = document.getElementById('frameInfo');
const downloadSection   = document.getElementById('downloadSection');
const successBadgeText  = document.getElementById('successBadgeText');
const processBtnText    = document.getElementById('processBtnText');
const downloadBtnText   = document.getElementById('downloadBtnText');
const resultVideo       = document.getElementById('resultVideo');
let mutedVideoBlobUrl   = null;
const eyedropBtn        = document.getElementById('eyedropBtn');
const eyedropHint       = document.getElementById('eyedropHint');
const eyedropCanvas     = document.getElementById('eyedropCanvas');
const manualSeedHint   = document.getElementById('manualSeedHint');
const previewRow        = document.getElementById('previewRow');
const controlsPanel     = document.getElementById('controlsPanel');

// ─── Animation & Tabs DOM refs ────────────────────────────────────────────────
const tabsContainer     = document.getElementById('tabsContainer');
const tabBgRemove       = document.getElementById('tabBgRemove');
const tabFrameEditor    = document.getElementById('tabFrameEditor');
const tabAnimate        = document.getElementById('tabAnimate');

// ─── Frame Editor DOM refs ────────────────────────────────────────────────────
const frameEditorSection    = document.getElementById('frameEditorSection');
const frameEditorIndexBadge = document.getElementById('frameEditorIndexBadge');
const frameEditorDelayBadge = document.getElementById('frameEditorDelayBadge');
const frameWandControls     = document.getElementById('frameWandControls');
const frameTolerance        = document.getElementById('frameTolerance');
const frameToleranceVal     = document.getElementById('frameToleranceVal');
const frameEraserControls   = document.getElementById('frameEraserControls');
const frameBrushSize        = document.getElementById('frameBrushSize');
const frameBrushSizeVal     = document.getElementById('frameBrushSizeVal');
const frameUndoBtn          = document.getElementById('frameUndoBtn');
const frameApplyAllBtn      = document.getElementById('frameApplyAllBtn');
const frameResetBtn         = document.getElementById('frameResetBtn');
const frameEditorWrap       = document.getElementById('frameEditorWrap');
const frameEditorCanvas     = document.getElementById('frameEditorCanvas');
const framePrevBtn          = document.getElementById('framePrevBtn');
const frameNextBtn          = document.getElementById('frameNextBtn');
const frameCounterNav       = document.getElementById('frameCounterNav');
const frameFilmstrip        = document.getElementById('frameFilmstrip');
const frameFilmstripCount   = document.getElementById('frameFilmstripCount');
const frameChooseAnotherBtn = document.getElementById('frameChooseAnotherBtn');
const frameEditorExportBtn  = document.getElementById('frameEditorExportBtn');
const frameZoomOutBtn       = document.getElementById('frameZoomOutBtn');
const frameZoomInBtn        = document.getElementById('frameZoomInBtn');
const frameZoomVal          = document.getElementById('frameZoomVal');

let gifFrames = [];
let activeFrameIndex = 0;
let currentFrameTool = 'wand';
let isErasingOnFrame = false;
let lastWandPoint = null;
let lastProcessedFrames = null;
let currentZoom = 'fit'; // 'fit' or number
let zoomNumeric = 1;
let isSpacePressed = false;
let isPanning = false;
let panStartX = 0, panStartY = 0, scrollStartX = 0, scrollStartY = 0;

// ─── Image to GIF DOM refs ─────────────────────────────────────────────
const tabImgToGif       = document.getElementById('tabImgToGif');
const imgToGifControls  = document.getElementById('imgToGifControls');
const img2gifFileInput  = document.getElementById('img2gifFileInput');
const img2gifDropZone   = document.getElementById('img2gifDropZone');
const img2gifThumbList  = document.getElementById('img2gifThumbList');
const img2gifDelaySlider= document.getElementById('img2gifDelaySlider');
const img2gifDelayVal   = document.getElementById('img2gifDelayVal');
const img2gifClearBtn   = document.getElementById('img2gifClearBtn');
const img2gifConvertBtn = document.getElementById('img2gifConvertBtn');
const img2gifCanvas     = document.getElementById('img2gifCanvas');
const img2gifCustomSizeWrap = document.getElementById('img2gifCustomSizeWrap');
let img2gifImages = []; // Array of {file, dataUrl, img}

// ─── Video to GIF DOM refs ────────────────────────────────────────────────────
const tabVideoToGif       = document.getElementById('tabVideoToGif');
const videoToGifControls  = document.getElementById('videoToGifControls');
const tabMuteVideo        = document.getElementById('tabMuteVideo');
const muteVideoControls   = document.getElementById('muteVideoControls');
const videoToGifFileName  = document.getElementById('videoToGifFileName');
const videoToGifFps       = document.getElementById('videoToGifFps');
const videoToGifFpsVal    = document.getElementById('videoToGifFpsVal');
const videoToGifLoop      = document.getElementById('videoToGifLoop');
const videoToGifConvertBtn = document.getElementById('videoToGifConvertBtn');
const videoChooseAnotherBtn = document.getElementById('videoChooseAnotherBtn');
const videoToGifCanvas    = document.getElementById('videoToGifCanvas');
const videoPlayer         = document.getElementById('videoPlayer');
const originalWrap        = document.getElementById('originalWrap');
const videoToGifCustomRange = document.getElementById('videoToGifCustomRange');
const videoToGifStartTime   = document.getElementById('videoToGifStartTime');
const videoToGifEndTime     = document.getElementById('videoToGifEndTime');
const videoToGifEstimate    = document.getElementById('videoToGifEstimate');
let videoToGifFile = null;
let videoToGifUrl = null;

const bgControls        = document.getElementById('bgControls');
const animateControls   = document.getElementById('animateControls');
const animIntensitySlider = document.getElementById('animIntensitySlider');
const animIntensityVal  = document.getElementById('animIntensityVal');
const animSpeedSlider   = document.getElementById('animSpeedSlider');
const animSpeedVal      = document.getElementById('animSpeedVal');
const animResetBtn      = document.getElementById('animResetBtn');
const animateBtn        = document.getElementById('animateBtn');
const mainActions       = document.getElementById('mainActions');
let currentTab = 'bgRemove';


// ─── Tab Switching ────────────────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  [tabBgRemove, tabFrameEditor, tabAnimate, tabImgToGif, tabVideoToGif, tabMuteVideo].forEach(t => t.classList.remove('active'));
  [bgControls, animateControls, imgToGifControls, videoToGifControls, muteVideoControls].forEach(c => c.classList.add('hidden'));
  
  const isEditor = (tab === 'frameEditor');
  if (frameEditorSection) frameEditorSection.classList.toggle('hidden', !isEditor);
  if (previewRow) previewRow.style.display = isEditor ? 'none' : '';
  if (controlsPanel) controlsPanel.style.display = isEditor ? 'none' : '';
  document.querySelector('.app-wrapper')?.classList.toggle('frame-editor-mode', isEditor);

  if (tab === 'frameEditor') {
    tabFrameEditor.classList.add('active');
    uploadSection.classList.add('hidden');
    workspace.classList.remove('hidden');
    downloadSection.classList.add('hidden');
    initGifFrames();
    setTimeout(() => applyCanvasZoom(), 60);
    return;
  }

  if (manualSeedHint) {
    manualSeedHint.style.display = (tab === 'bgRemove') ? 'flex' : 'none';
  }
  if (originalWrap) {
    if (tab === 'bgRemove') {
      originalWrap.style.cursor = 'crosshair';
      originalWrap.title = 'Click vào vùng nền bị kẹt để xóa';
    } else {
      originalWrap.style.cursor = 'default';
      originalWrap.title = '';
    }
  }

  if (tab === 'muteVideo') {
    tabMuteVideo.classList.add('active');
    muteVideoControls.classList.remove('hidden');
    uploadSection.classList.add('hidden');
    workspace.classList.remove('hidden');

    if (mutedVideoBlobUrl) {
      resultVideo.src = mutedVideoBlobUrl;
      resultVideo.classList.remove('hidden');
      resultImg.classList.add('hidden');
      if (placeholderResult) placeholderResult.style.display = 'none';
      if (successBadgeText) successBadgeText.textContent = 'Xóa âm thanh thành công!';
      downloadBtnText.textContent = 'Tải xuống video không tiếng';
      downloadSection.classList.remove('hidden');
    } else {
      resultVideo.classList.add('hidden');
      resultImg.classList.add('hidden');
      if (placeholderResult) {
        placeholderResult.innerHTML = '<p>Nhấn <strong>Xóa âm thanh</strong> để xem kết quả</p>';
        placeholderResult.style.display = '';
      }
      downloadSection.classList.add('hidden');
    }
  } else if (tab === 'videoToGif') {
    tabVideoToGif.classList.add('active');
    videoToGifControls.classList.remove('hidden');
    uploadSection.classList.add('hidden');
    workspace.classList.remove('hidden');
    updateVideoToGifEstimate();

    resultVideo.classList.add('hidden');
    if (resultBlobUrl) {
      resultImg.src = resultBlobUrl;
      resultImg.classList.remove('hidden');
      if (placeholderResult) placeholderResult.style.display = 'none';
      if (successBadgeText) successBadgeText.textContent = 'Chuyển video sang GIF thành công!';
      downloadBtnText.textContent = 'Tải xuống GIF';
      downloadSection.classList.remove('hidden');
    } else {
      resultImg.classList.add('hidden');
      if (placeholderResult) {
        placeholderResult.innerHTML = '<p>Nhấn <strong>Chuyển video sang GIF</strong> để xem kết quả</p>';
        placeholderResult.style.display = '';
      }
      downloadSection.classList.add('hidden');
    }
  } else {
    resultVideo.classList.add('hidden');
    if (tab === 'bgRemove') {
      tabBgRemove.classList.add('active');
      bgControls.classList.remove('hidden');
      if (placeholderResult) placeholderResult.innerHTML = '<p>Nhấn <strong>Xóa nền</strong> để xem kết quả</p>';
    } else if (tab === 'animate') {
      tabAnimate.classList.add('active');
      animateControls.classList.remove('hidden');
      if (placeholderResult) placeholderResult.innerHTML = '<p>Nhấn <strong>Tạo GIF chuyển động</strong> để xem kết quả</p>';
    } else if (tab === 'imgToGif') {
      tabImgToGif.classList.add('active');
      imgToGifControls.classList.remove('hidden');
      if (placeholderResult) placeholderResult.innerHTML = '<p>Nhấn <strong>Chuyển sang GIF</strong> để xem kết quả</p>';
    }

    if (resultBlobUrl) {
      resultImg.src = resultBlobUrl;
      resultImg.classList.remove('hidden');
      if (placeholderResult) placeholderResult.style.display = 'none';
      downloadSection.classList.remove('hidden');
    } else {
      resultImg.classList.add('hidden');
      if (placeholderResult) placeholderResult.style.display = '';
      downloadSection.classList.add('hidden');
    }
  }
}

function configureTabsForFile(fileType) {
  const isVideo = fileType === 'video';
  const isGif = fileType === 'gif';
  tabBgRemove.style.display = isVideo ? 'none' : '';
  tabFrameEditor.style.display = isGif ? '' : 'none';
  tabAnimate.style.display = (!isVideo && !isGif) ? '' : 'none';
  tabImgToGif.style.display = (!isVideo && !isGif) ? '' : 'none';
  tabVideoToGif.style.display = isVideo ? '' : 'none';
  tabMuteVideo.style.display = isVideo ? '' : 'none';
}
tabBgRemove.addEventListener('click', () => switchTab('bgRemove'));
tabFrameEditor.addEventListener('click', () => switchTab('frameEditor'));
tabAnimate.addEventListener('click', () => switchTab('animate'));
tabImgToGif.addEventListener('click', () => switchTab('imgToGif'));
tabVideoToGif.addEventListener('click', () => switchTab('videoToGif'));
tabMuteVideo.addEventListener('click', () => switchTab('muteVideo'));
videoChooseAnotherBtn.addEventListener('click', resetAll);
if (frameChooseAnotherBtn) frameChooseAnotherBtn.addEventListener('click', resetAll);

// ─── Drag & Drop ──────────────────────────────────────────────────────────────
['dragenter','dragover'].forEach(evt =>
  dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.add('drag-over'); })
);
['dragleave','drop'].forEach(evt =>
  dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.remove('drag-over'); })
);
dropZone.addEventListener('drop', e => {
  const file = e.dataTransfer.files[0];
  if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) loadFile(file);
  else showToast('Vui lòng chọn file Ảnh, GIF hoặc video!', 'error');
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadFile(fileInput.files[0]);
});

// ─── Controls ─────────────────────────────────────────────────────────────────
bgColorInput.addEventListener('input', () => { colorValue.textContent = bgColorInput.value; });
toleranceSlider.addEventListener('input', () => { toleranceVal.textContent = toleranceSlider.value; });
featherSlider.addEventListener('input', () => { featherVal.textContent = featherSlider.value; });
speedSlider.addEventListener('input', () => { speedVal.textContent = parseFloat(speedSlider.value).toFixed(2); });
img2gifDelaySlider.addEventListener('input', () => { img2gifDelayVal.textContent = img2gifDelaySlider.value; });
function updateVideoToGifEstimate() {
  if (!videoPlayer || !Number.isFinite(videoPlayer.duration) || videoPlayer.duration <= 0) return;
  const fps = Number(videoToGifFps.value) || 10;
  let start = 0;
  let end = videoPlayer.duration;
  
  const mode = document.querySelector('input[name="videoToGifDurationMode"]:checked')?.value || 'all';
  if (mode === '3') {
    end = Math.min(videoPlayer.duration, 3);
  } else if (mode === '5') {
    end = Math.min(videoPlayer.duration, 5);
  } else if (mode === 'custom') {
    start = Math.max(0, parseFloat(videoToGifStartTime.value) || 0);
    end = Math.min(videoPlayer.duration, parseFloat(videoToGifEndTime.value) || videoPlayer.duration);
    if (end <= start) end = Math.min(videoPlayer.duration, start + 1);
  }
  
  const dur = Math.max(0.1, end - start);
  const frames = Math.ceil(dur * fps);
  
  const sizeVal = document.querySelector('input[name="videoToGifSize"]:checked')?.value || '0.5';
  let scale = 0.5;
  if (sizeVal === 'original') scale = 1;
  else if (sizeVal === '0.3') scale = 0.3;
  
  const w = Math.round(videoPlayer.videoWidth * scale);
  const h = Math.round(videoPlayer.videoHeight * scale);
  
  // Approximate GIF size: ~0.4 bytes per pixel per frame on average
  const estBytes = frames * (w * h * 0.42);
  
  if (videoToGifEstimate) {
    videoToGifEstimate.textContent = `⚡ Dự kiến: ~${frames} khung hình (${w}×${h}px · ~${formatBytes(estBytes)})`;
  }
}

videoToGifFps.addEventListener('input', () => {
  videoToGifFpsVal.textContent = videoToGifFps.value;
  updateVideoToGifEstimate();
});
document.querySelectorAll('input[name="videoToGifSize"]').forEach(r => {
  r.addEventListener('change', updateVideoToGifEstimate);
});
document.querySelectorAll('input[name="videoToGifDurationMode"]').forEach(r => {
  r.addEventListener('change', e => {
    if (e.target.value === 'custom') {
      videoToGifCustomRange.style.display = 'flex';
    } else {
      videoToGifCustomRange.style.display = 'none';
    }
    updateVideoToGifEstimate();
  });
});
videoToGifStartTime.addEventListener('input', () => {
  const t = parseFloat(videoToGifStartTime.value) || 0;
  if (videoPlayer && Number.isFinite(videoPlayer.duration)) {
    videoPlayer.currentTime = Math.min(videoPlayer.duration, t);
  }
  updateVideoToGifEstimate();
});
videoToGifEndTime.addEventListener('input', () => {
  const t = parseFloat(videoToGifEndTime.value) || 0;
  if (videoPlayer && Number.isFinite(videoPlayer.duration)) {
    videoPlayer.currentTime = Math.min(videoPlayer.duration, t);
  }
  updateVideoToGifEstimate();
});

const COMPRESS_LABELS = [
  ['Không nén',  '100% kích thước · Chất lượng tối đa'],
  ['Nhẹ',        '100% kích thước · Màu được nén nhẹ · ~70–80% dung lượng'],
  ['Trung bình', 'Thu nhỏ 75% · Chất lượng tốt · ~40–50% dung lượng'],
  ['Mạnh',       'Thu nhỏ 50% · Bỏ 1/2 frame · ~15–25% dung lượng'],
  ['Tối đa',     'Thu nhỏ 50% · Bỏ 2/3 frame · Nhỏ nhất có thể'],
];
compressSlider.addEventListener('input', () => {
  const lv = parseInt(compressSlider.value);
  compressVal.textContent = COMPRESS_LABELS[lv][0];
  compressHint.textContent = COMPRESS_LABELS[lv][1];
});

processBtn.addEventListener('click', () => {
  if (isStaticImage) processStaticImage();
  else processGif();
});
resetBtn.addEventListener('click', resetAll);
downloadBtn.addEventListener('click', downloadResult);

// ─── Eyedropper ───────────────────────────────────────────────────────────────
let eyedropActive = false;

eyedropBtn.addEventListener('click', () => {
  if (window.EyeDropper) {
    new EyeDropper().open().then(r => {
      bgColorInput.value = r.sRGBHex;
      colorValue.textContent = r.sRGBHex;
    }).catch(() => {});
    return;
  }
  if (!superGif && !isStaticImage) { showToast('Hãy tải file ảnh/GIF trước!', 'error'); return; }
  eyedropActive = !eyedropActive;
  eyedropBtn.classList.toggle('active', eyedropActive);
  document.body.classList.toggle('eyedrop-mode', eyedropActive);
  eyedropHint.style.display = eyedropActive ? 'block' : 'none';
});

originalImg.addEventListener('click', e => {
  if (!superGif && !isStaticImage) return;

  const rect = originalImg.getBoundingClientRect();
  const W = isStaticImage ? staticImgObj.naturalWidth : superGif.get_canvas().width;
  const H = isStaticImage ? staticImgObj.naturalHeight : superGif.get_canvas().height;
  const scaleX = W  / rect.width;
  const scaleY = H / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top)  * scaleY);

  eyedropCanvas.width  = W;
  eyedropCanvas.height = H;
  const ctx = eyedropCanvas.getContext('2d');
  
  if (isStaticImage) {
    ctx.drawImage(staticImgObj, 0, 0);
  } else {
    ctx.drawImage(superGif.get_canvas(), 0, 0);
  }
  const px = ctx.getImageData(x, y, 1, 1).data;

  if (!eyedropActive) {
    // Thêm điểm seed thủ công kèm theo màu tại vị trí click
    customSeeds.push({x, y, color: [px[0], px[1], px[2]]});
    showToast('Đã chấm thêm vùng xóa!', 'success');
    if (isStaticImage) processStaticImage();
    else processGif();
    return;
  }

  const hex = '#' + [px[0], px[1], px[2]].map(v => v.toString(16).padStart(2,'0')).join('');

  bgColorInput.value = hex;
  colorValue.textContent = hex;
  eyedropActive = false;
  eyedropBtn.classList.remove('active');
  document.body.classList.remove('eyedrop-mode');
  eyedropHint.style.display = 'none';
  showToast(`Đã chọn màu ${hex}`, 'success');
});

// ─── Load File ────────────────────────────────────────────────────────────────
function loadFile(file) {
  currentFile = file;
  superGif    = null;
  isStaticImage = false;
  isVideoFile = false;
  staticImgObj  = null;
  frameCount  = 0;
  frameDelays = [];
  customSeeds = [];
  if (sourceBlobUrl) { URL.revokeObjectURL(sourceBlobUrl); sourceBlobUrl = null; }
  if (resultBlobUrl) { URL.revokeObjectURL(resultBlobUrl); resultBlobUrl = null; }
  if (lastStaticProcessedUrl) { URL.revokeObjectURL(lastStaticProcessedUrl); lastStaticProcessedUrl = null; }
  if (videoToGifUrl) { URL.revokeObjectURL(videoToGifUrl); videoToGifUrl = null; }

  // Show workspace first
  uploadSection.classList.add('hidden');
  workspace.classList.remove('hidden');
  tabsContainer.style.display = 'none';
  downloadSection.classList.add('hidden');
  progressSection.classList.add('hidden');
  resultImg.classList.add('hidden');
  placeholderResult.style.display = '';
  resultMeta.textContent = '';
  processBtn.disabled = true;

  const objectUrl = URL.createObjectURL(file);
  sourceBlobUrl = objectUrl;
  
  switchTab('bgRemove');
  if (file.type.startsWith('video/')) {
    URL.revokeObjectURL(sourceBlobUrl);
    sourceBlobUrl = null;
    originalImg.src = '';
    originalImg.classList.add('hidden');
    videoPlayer.src = videoToGifUrl;
    videoPlayer.controls = true;
    videoPlayer.muted = true;
    videoPlayer.loop = true;
    videoPlayer.style.display = 'block';
    videoPlayer.style.width = '100%';
    videoPlayer.style.height = '100%';
    videoPlayer.style.objectFit = 'contain';
    originalWrap.appendChild(videoPlayer);
    videoPlayer.play().catch(() => {});
    isVideoFile = true;
    configureTabsForFile('video');
    tabsContainer.style.display = 'flex';
    videoToGifFile = file;
    currentFile = file;
    setVideoToGifFile(file);
    switchTab('videoToGif');
    mainActions.classList.remove('hidden');
    processBtn.classList.add('hidden');
    processBtn.disabled = true;
    return;
  }

  tabsContainer.style.display = 'flex';
  mainActions.classList.remove('hidden');
  processBtn.classList.remove('hidden');
  originalImg.classList.remove('hidden');
  configureTabsForFile(file.type === 'image/gif' ? 'gif' : 'image');
  if (file.type !== 'image/gif') {
    isStaticImage = true;
    processBtnText.textContent = 'Xóa nền Ảnh';
    processBtn.disabled = false;
    animateBtn.disabled = false;
    downloadBtnText.textContent = 'Tải xuống Ảnh';
    loadStaticImage(file, objectUrl);
    return;
  }

  processBtnText.textContent = 'Xóa nền GIF';
  downloadBtnText.textContent = 'Tải xuống GIF';

  // Use a hidden <img> for SuperGif to parse
  const helperImg = document.createElement('img');
  helperImg.setAttribute('rel:animated_src', objectUrl);
  helperImg.setAttribute('rel:auto_play', '0');
  helperImg.style.display = 'none';
  document.body.appendChild(helperImg);

  originalImg.src = objectUrl;
  originalMeta.textContent = `${file.name} · ${formatBytes(file.size)} · đang đọc...`;
  updateProgress(0, 'Đang đọc file GIF...');
  progressSection.classList.remove('hidden');

  try {
    superGif = new SuperGif({ gif: helperImg, auto_play: false });
    superGif.load(() => {
      frameCount = superGif.get_length();
      // Collect frame delays (libgif stores them internally)
      frameDelays = [];
      try {
        const frames = superGif.frames || superGif._frames || superGif.get_frames?.() || [];
        frames.forEach(f => frameDelays.push((f.delay || f.centisecs || 10) * 10));
      } catch(_) {}
      if (!frameDelays.length) {
        for (let i = 0; i < frameCount; i++) frameDelays.push(100);
      }

      // Auto-detect bg color from frame 0
      superGif.move_to(0);
      autoDetectBgColor(superGif.get_canvas());

      originalMeta.textContent = `${file.name} · ${formatBytes(file.size)} · ${frameCount} frames`;
      progressSection.classList.add('hidden');
      processBtn.disabled = false;
      showToast(`Đã tải ${frameCount} frames!`, 'success');
    });
  } catch (err) {
    console.error('SuperGif error:', err);
    progressSection.classList.add('hidden');
    showToast('Lỗi đọc GIF: ' + err.message, 'error');
    processBtn.disabled = false;
  }
}

function loadStaticImage(file, objectUrl) {
  const img = new Image();
  img.onload = () => {
    staticImgObj = img;
    originalImg.src = objectUrl;
    originalMeta.textContent = `${file.name} · ${formatBytes(file.size)} · ${img.naturalWidth}x${img.naturalHeight}`;
    
    // Auto detect bg color
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    autoDetectBgColor(canvas);

    progressSection.classList.add('hidden');
    processBtn.disabled = false;
    showToast('Đã tải ảnh thành công!', 'success');
  };
  img.onerror = () => {
    showToast('Lỗi đọc ảnh!', 'error');
    progressSection.classList.add('hidden');
  };
  img.src = objectUrl;
}

function autoDetectBgColor(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const counts = {};

  // Sample entire perimeter at ~40 evenly-spaced points per edge
  const step = Math.max(1, Math.floor(Math.min(w, h) / 40));
  const pts = [];
  for (let x = 0; x < w; x += step) { pts.push([x, 0]); pts.push([x, h - 1]); }
  for (let y = step; y < h - step; y += step) { pts.push([0, y]); pts.push([w - 1, y]); }

  for (const [x, y] of pts) {
    const px = ctx.getImageData(x, y, 1, 1).data;
    if (px[3] > 127) {
      // Quantize to nearest-8 per channel for colour clustering
      const r = Math.min(255, Math.round(px[0] / 8) * 8);
      const g = Math.min(255, Math.round(px[1] / 8) * 8);
      const b = Math.min(255, Math.round(px[2] / 8) * 8);
      const key = rgbToHex(r, g, b);
      counts[key] = (counts[key] || 0) + 1;
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length) {
    bgColorInput.value = sorted[0][0];
    colorValue.textContent = sorted[0][0];
  }
}

// ─── Process Static Image ─────────────────────────────────────────────────────
async function processStaticImage() {
  if (!staticImgObj) return;

  const tolerance = parseInt(toleranceSlider.value);
  const feather   = parseInt(featherSlider.value);
  const [r0, g0, b0] = hexToRgb(bgColorInput.value);
  const removeIslands = removeIslandsCheck.checked;

  processBtn.disabled = true;
  downloadSection.classList.add('hidden');
  progressSection.classList.remove('hidden');
  updateProgress(50, 'Đang xử lý ảnh...');

  // Dùng setTimeout để UI kịp update
  setTimeout(() => {
    const W = staticImgObj.naturalWidth;
    const H = staticImgObj.naturalHeight;
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = W;
    tmpCanvas.height = H;
    const ctx = tmpCanvas.getContext('2d', { willReadFrequently: true });
    
    ctx.drawImage(staticImgObj, 0, 0);
    const imgData = ctx.getImageData(0, 0, W, H);
    
    removeBackground(imgData.data, r0, g0, b0, tolerance, feather, W, H, removeIslands, customSeeds);
    
    ctx.putImageData(imgData, 0, 0);
    
    tmpCanvas.toBlob(blob => {
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
      resultBlobUrl = URL.createObjectURL(blob);
      resultImg.src = resultBlobUrl;
      
      placeholderResult.style.display = 'none';
      resultImg.classList.remove('hidden');
      resultMeta.textContent = `Kết quả · ${formatBytes(blob.size)}`;
      
      progressSection.classList.add('hidden');
      if (successBadgeText) successBadgeText.textContent = 'Xóa nền thành công!';
      downloadBtnText.textContent = 'Tải xuống Ảnh';
      downloadSection.classList.remove('hidden');
      processBtn.disabled = false;
      showToast('Đã xóa nền xong!', 'success');
    }, 'image/png');
  }, 50);
}

// ─── Animation Generator ──────────────────────────────────────────────────────
animIntensitySlider.addEventListener('input', e => animIntensityVal.textContent = e.target.value);
animSpeedSlider.addEventListener('input', e => animSpeedVal.textContent = e.target.value);
animResetBtn.addEventListener('click', resetAll);

animateBtn.addEventListener('click', async () => {
  if (!isStaticImage) {
    showToast('Tính năng Tạo hiệu ứng chỉ hỗ trợ Ảnh tĩnh, không hỗ trợ GIF!', 'error');
    return;
  }
  
  const effectType = document.querySelector('input[name="effectType"]:checked').value;
  const intensity = parseInt(animIntensitySlider.value);
  const speed = parseFloat(animSpeedSlider.value);
  
  // Use processed transparent image if available, otherwise original
  const baseImgSrc = lastStaticProcessedUrl || originalImg.src;
  
  const img = new Image();
  img.src = baseImgSrc;
  await new Promise(r => img.onload = r);
  
  animateBtn.disabled = true;
  progressSection.classList.remove('hidden');
  downloadSection.classList.add('hidden');
  
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const totalFrames = 24; 
  const delay = Math.round(100 / speed);
  
  // Fetch worker script → Blob URL để tránh CORS
  let workerBlobUrl = null;
  try {
    const resp = await fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
    const blob = await resp.blob();
    workerBlobUrl = URL.createObjectURL(blob);
  } catch (e) {
    console.warn('Không tải được worker script:', e);
  }
  
  const gifOpts = {
    workers: workerBlobUrl ? 4 : 0,
    quality: 10,
    width: W,
    height: H,
    transparent: 0xFF00FF // magenta = màu key trong suốt
  };
  if (workerBlobUrl) gifOpts.workerScript = workerBlobUrl;
  const gif = new window.GIF(gifOpts);
  
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = W;
  tmpCanvas.height = H;
  const ctx = tmpCanvas.getContext('2d');
  
  for (let i = 0; i < totalFrames; i++) {
    updateProgress(Math.round((i / totalFrames) * 50), 'Đang tạo frame...');
    
    // Xóa nền hoàn toàn (trong suốt)
    ctx.clearRect(0, 0, W, H);
    
    ctx.save();
    const t = i / totalFrames;
    const rad = t * Math.PI * 2;
    
    ctx.translate(W / 2, H / 2);
    
    if (effectType === 'wobble') {
       const angle = Math.sin(rad) * (intensity / 100) * 0.3;
       ctx.rotate(angle);
    } 
    else if (effectType === 'pulse') {
       const scale = 1.0 + Math.sin(rad) * (intensity / 100) * 0.2;
       ctx.scale(scale, scale);
    }
    else if (effectType === 'bounce') {
       const yOffset = -Math.abs(Math.sin(rad * 0.5)) * (intensity / 100) * (H * 0.3);
       ctx.translate(0, yOffset);
    }
    else if (effectType === 'spin') {
       ctx.rotate(rad);
       const fitScale = 0.5 + (1 - (intensity / 100)) * 0.5;
       ctx.scale(fitScale, fitScale);
    }
    else if (effectType === 'float') {
       const xOff = Math.sin(rad) * (intensity / 100) * (W * 0.15);
       const yOff = Math.sin(rad * 2) * (intensity / 100) * (H * 0.1);
       ctx.translate(xOff, yOff);
    }
    
    ctx.drawImage(img, -W / 2, -H / 2, W, H);
    ctx.restore();
    
    // Xử lý alpha 1-bit cho GIF: biến vùng trong suốt thành Magenta
    const imgData = ctx.getImageData(0, 0, W, H);
    const data = imgData.data;
    for (let p = 0; p < data.length; p += 4) {
       if (data[p + 3] < 128) {
          // Thay vùng trong suốt bằng màu Magenta
          data[p] = 255; data[p + 1] = 0; data[p + 2] = 255; data[p + 3] = 255; 
       } else {
          // Nếu phần ảnh thật vô tình trùng màu Magenta, ta lệch màu đi 1 xíu để tránh bị đục lỗ
          if (data[p] === 255 && data[p + 1] === 0 && data[p + 2] === 255) {
             data[p + 1] = 1;
          }
          data[p + 3] = 255; // Đảm bảo pixel thật hoàn toàn đục
       }
    }
    ctx.putImageData(imgData, 0, 0);
    
    gif.addFrame(ctx, { copy: true, delay: delay });
    await sleep(10);
  }
  
  gif.on('progress', p => updateProgress(50 + Math.round(p * 50), 'Đang ghép file GIF...'));
  
  gif.on('finished', blob => {
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    resultBlobUrl = URL.createObjectURL(blob);
    
    resultImg.src = resultBlobUrl;
    resultImg.classList.remove('hidden');
    placeholderResult.style.display = 'none';
    
    resultMeta.textContent = `GIF Hoạt hình · ${formatBytes(blob.size)}`;
    updateProgress(100, 'Hoàn tất!');
    if (successBadgeText) successBadgeText.textContent = 'Tạo GIF chuyển động thành công!';
    downloadSection.classList.remove('hidden');
    animateBtn.disabled = false;
    
    // Set to false temporarily so the download uses .gif extension
    // (It will be handled inside downloadResult correctly)
    downloadBtnText.textContent = 'Tải xuống GIF';
  });
  
  gif.render();
});

// ─── Image to GIF Feature ───────────────────────────────────────────────────

// Img2gif: Drag & drop on the mini drop zone
['dragenter','dragover'].forEach(evt =>
  img2gifDropZone.addEventListener(evt, e => { e.preventDefault(); img2gifDropZone.classList.add('drag-over'); })
);
['dragleave','drop'].forEach(evt =>
  img2gifDropZone.addEventListener(evt, e => { e.preventDefault(); img2gifDropZone.classList.remove('drag-over'); })
);
img2gifDropZone.addEventListener('drop', e => {
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (files.length) addImg2gifFiles(files);
  else showToast('Vui lòng thả file ảnh!', 'error');
});
img2gifFileInput.addEventListener('change', () => {
  const files = Array.from(img2gifFileInput.files);
  if (files.length) addImg2gifFiles(files);
  img2gifFileInput.value = '';
});

// Size radio toggle
document.querySelectorAll('input[name="img2gifSize"]').forEach(r => {
  r.addEventListener('change', () => {
    img2gifCustomSizeWrap.style.display = r.value === 'custom' ? 'flex' : 'none';
  });
});

function addImg2gifFiles(files) {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const img = new Image();
      img.onload = () => {
        img2gifImages.push({ file, dataUrl, img });
        renderImg2gifThumbs();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function renderImg2gifThumbs() {
  img2gifThumbList.innerHTML = '';
  if (img2gifImages.length === 0) return;
  
  img2gifImages.forEach((item, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'img2gif-thumb';
    wrap.draggable = true;
    wrap.dataset.idx = idx;
    wrap.innerHTML = `
      <img src="${item.dataUrl}" alt="frame ${idx+1}" />
      <span class="img2gif-thumb-num">${idx + 1}</span>
      <button class="img2gif-thumb-del" data-idx="${idx}" title="Xóa">×</button>
    `;
    // Drag-to-reorder
    wrap.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', idx); wrap.classList.add('dragging'); });
    wrap.addEventListener('dragend', () => wrap.classList.remove('dragging'));
    wrap.addEventListener('dragover', e => e.preventDefault());
    wrap.addEventListener('drop', e => {
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
      if (fromIdx !== idx) {
        const moved = img2gifImages.splice(fromIdx, 1)[0];
        img2gifImages.splice(idx, 0, moved);
        renderImg2gifThumbs();
      }
    });
    img2gifThumbList.appendChild(wrap);
  });
  
  // Delete buttons
  img2gifThumbList.querySelectorAll('.img2gif-thumb-del').forEach(btn => {
    btn.addEventListener('click', () => {
      img2gifImages.splice(parseInt(btn.dataset.idx), 1);
      renderImg2gifThumbs();
    });
  });
  
  // Show count badge
  img2gifDropZone.querySelector('p:first-of-type').textContent =
    `${img2gifImages.length} ảnh đã chọn — kéo để sắp xếp lại`;
}

img2gifClearBtn.addEventListener('click', () => {
  img2gifImages = [];
  renderImg2gifThumbs();
  img2gifDropZone.querySelector('p:first-of-type').textContent = 'Kéo thả nhiều ảnh vào đây';
});

img2gifConvertBtn.addEventListener('click', async () => {
  if (img2gifImages.length < 2) {
    showToast('Vui lòng thêm ít nhất 2 ảnh!', 'error');
    return;
  }
  
  const delay = parseInt(img2gifDelaySlider.value);
  const sizeOpt = document.querySelector('input[name="img2gifSize"]:checked').value;
  const quality = parseInt(document.querySelector('input[name="img2gifQuality"]:checked').value);
  const loop = document.getElementById('img2gifLoop').checked ? 0 : -1;
  
  // Determine output dimensions
  const firstImg = img2gifImages[0].img;
  let outW, outH;
  if (sizeOpt === 'original') {
    outW = firstImg.naturalWidth;
    outH = firstImg.naturalHeight;
  } else if (sizeOpt === 'custom') {
    outW = parseInt(document.getElementById('img2gifCustomW').value) || firstImg.naturalWidth;
    outH = parseInt(document.getElementById('img2gifCustomH').value) || firstImg.naturalHeight;
  } else {
    const scale = parseFloat(sizeOpt);
    outW = Math.round(firstImg.naturalWidth * scale);
    outH = Math.round(firstImg.naturalHeight * scale);
  }
  
  img2gifConvertBtn.disabled = true;
  progressSection.classList.remove('hidden');
  downloadSection.classList.add('hidden');
  updateProgress(0, 'Đang chuẩn bị...');
  
  let workerBlobUrl = null;
  try {
    const resp = await fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
    const wBlob = await resp.blob();
    workerBlobUrl = URL.createObjectURL(wBlob);
  } catch (e) {
    console.warn('Không tải được worker:', e);
  }
  
  const gifOpts = {
    workers: workerBlobUrl ? 4 : 0,
    quality,
    width: outW,
    height: outH,
    repeat: loop
  };
  if (workerBlobUrl) gifOpts.workerScript = workerBlobUrl;
  const gif = new window.GIF(gifOpts);
  
  img2gifCanvas.width = outW;
  img2gifCanvas.height = outH;
  const ctx = img2gifCanvas.getContext('2d');
  
  for (let i = 0; i < img2gifImages.length; i++) {
    updateProgress(Math.round((i / img2gifImages.length) * 70), `Đang xử lý ảnh ${i+1}/${img2gifImages.length}`);
    ctx.clearRect(0, 0, outW, outH);
    ctx.drawImage(img2gifImages[i].img, 0, 0, outW, outH);
    gif.addFrame(ctx, { copy: true, delay });
    await sleep(5);
  }
  
  gif.on('progress', p => updateProgress(70 + Math.round(p * 29), 'Đang mã hóa GIF...'));
  
  gif.on('finished', blob => {
    if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    resultBlobUrl = URL.createObjectURL(blob);
    
    // Show in the main result area
    resultImg.src = resultBlobUrl;
    resultImg.classList.remove('hidden');
    placeholderResult.style.display = 'none';
    resultMeta.textContent = `GIF · ${img2gifImages.length} ảnh · ${formatBytes(blob.size)}`;
    
    updateProgress(100, 'Hoàn tất!');
    progressSection.classList.add('hidden');
    if (successBadgeText) successBadgeText.textContent = 'Tạo GIF thành công!';
    downloadSection.classList.remove('hidden');
    downloadBtnText.textContent = 'Tải xuống GIF';
  img2gifConvertBtn.disabled = false;
  showToast('Tạo GIF thành công! 🎉', 'success');
  });
  
  gif.on('error', err => {
    console.error(err);
    if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }
    progressSection.classList.add('hidden');
    img2gifConvertBtn.disabled = false;
    showToast('Lỗi tạo GIF: ' + (err?.message || err), 'error');
  });
  
  gif.render();
});

// ─── Video to GIF Feature ────────────────────────────────────────────────────
async function getGifWorkerUrl() {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
    if (!response.ok) throw new Error('Không tải được GIF worker');
    return URL.createObjectURL(await response.blob());
  } catch (error) {
    console.warn('Không tải được GIF worker:', error);
    return null;
  }
}

function setVideoToGifFile(file) {
  if (!file) return;
  if (!file.type.startsWith('video/')) {
    showToast('Vui lòng chọn một tệp video!', 'error');
    return;
  }
  if (videoToGifUrl) URL.revokeObjectURL(videoToGifUrl);
  videoToGifFile = file;
  currentFile = file;
  videoToGifUrl = URL.createObjectURL(file);
  videoPlayer.src = videoToGifUrl;
  videoToGifFileName.textContent = `${file.name} · đang đọc video...`;
  videoToGifConvertBtn.disabled = true;
  videoPlayer.onloadedmetadata = () => {
    videoToGifFileName.textContent = `${file.name} · ${videoPlayer.videoWidth}×${videoPlayer.videoHeight} · ${videoPlayer.duration.toFixed(1)} giây`;
    originalMeta.textContent = `${file.name} · ${formatBytes(file.size)} · ${videoPlayer.videoWidth}×${videoPlayer.videoHeight} · ${videoPlayer.duration.toFixed(1)} giây`;
    if (videoToGifStartTime) videoToGifStartTime.value = '0';
    if (videoToGifEndTime) {
      videoToGifEndTime.value = Math.min(videoPlayer.duration, 3).toFixed(1);
      videoToGifEndTime.max = videoPlayer.duration.toFixed(1);
    }
    videoToGifConvertBtn.disabled = false;
    updateMuteTab();
    updateVideoToGifEstimate();
    showToast('Đã tải video thành công!', 'success');
  };
  videoPlayer.onerror = () => {
    videoToGifFileName.textContent = 'Không thể đọc video này';
    videoToGifConvertBtn.disabled = true;
    showToast('Trình duyệt không hỗ trợ định dạng video này.', 'error');
  };
}

function waitForVideoEvent(eventName) {
  return new Promise((resolve, reject) => {
    const done = () => { videoPlayer.removeEventListener(eventName, done); videoPlayer.removeEventListener('error', fail); resolve(); };
    const fail = () => { videoPlayer.removeEventListener(eventName, done); reject(new Error('Không thể đọc khung hình video.')); };
    videoPlayer.addEventListener(eventName, done, { once: true });
    videoPlayer.addEventListener('error', fail, { once: true });
  });
}

function seekVideo(time) {
  if (Math.abs(videoPlayer.currentTime - time) < 0.001) return Promise.resolve();
  videoPlayer.currentTime = time;
  return waitForVideoEvent('seeked');
}

videoToGifConvertBtn.addEventListener('click', async () => {
  if (!videoToGifFile || !Number.isFinite(videoPlayer.duration)) {
    showToast('Hãy chọn video trước!', 'error');
    return;
  }
  const fps = Number(videoToGifFps.value) || 10;

  // Calculate start, end, and duration
  let startTime = 0;
  let endTime = videoPlayer.duration;
  const durationMode = document.querySelector('input[name="videoToGifDurationMode"]:checked')?.value || 'all';
  if (durationMode === '3') {
    endTime = Math.min(videoPlayer.duration, 3);
  } else if (durationMode === '5') {
    endTime = Math.min(videoPlayer.duration, 5);
  } else if (durationMode === 'custom') {
    startTime = Math.max(0, parseFloat(videoToGifStartTime?.value) || 0);
    endTime = Math.min(videoPlayer.duration, parseFloat(videoToGifEndTime?.value) || videoPlayer.duration);
    if (endTime <= startTime) endTime = Math.min(videoPlayer.duration, startTime + 1);
  }

  const duration = Math.max(0.1, endTime - startTime);
  const frameCount = Math.ceil(duration * fps);
  if (frameCount > 1200 && !confirm(`Video này sẽ tạo ${frameCount} khung hình và có thể mất nhiều thời gian. Bạn vẫn muốn tiếp tục?`)) return;

  const sizeChoice = document.querySelector('input[name="videoToGifSize"]:checked')?.value || '0.5';
  let scale = 0.5;
  if (sizeChoice === '0.3') scale = 0.3;
  else if (sizeChoice === 'original') scale = 1;

  const width = Math.max(1, Math.round(videoPlayer.videoWidth * scale));
  const height = Math.max(1, Math.round(videoPlayer.videoHeight * scale));
  const quality = Number(document.querySelector('input[name="videoToGifQuality"]:checked').value);
  const workerUrl = await getGifWorkerUrl();
  const opts = { workers: workerUrl ? 2 : 0, quality, width, height, repeat: videoToGifLoop.checked ? 0 : -1 };
  if (workerUrl) opts.workerScript = workerUrl;
  const gif = new window.GIF(opts);
  const ctx = videoToGifCanvas.getContext('2d', { alpha: false });
  videoToGifCanvas.width = width;
  videoToGifCanvas.height = height;

  videoToGifConvertBtn.disabled = true;
  progressSection.classList.remove('hidden');
  downloadSection.classList.add('hidden');
  try {
    for (let i = 0; i < frameCount; i++) {
      const targetTime = Math.min(startTime + (i / fps), Math.max(startTime, endTime - 0.001));
      await seekVideo(targetTime);
      ctx.drawImage(videoPlayer, 0, 0, width, height);
      gif.addFrame(ctx, { copy: true, delay: Math.round(1000 / fps) });
      updateProgress(Math.round(((i + 1) / frameCount) * 70), `Đang lấy khung hình ${i + 1}/${frameCount}`);
    }
    gif.on('progress', p => updateProgress(70 + Math.round(p * 30), 'Đang mã hóa GIF...'));
    gif.on('finished', blob => {
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
      resultBlobUrl = URL.createObjectURL(blob);
      resultVideo.classList.add('hidden');
      resultImg.src = resultBlobUrl;
      resultImg.classList.remove('hidden');
      placeholderResult.style.display = 'none';
      resultMeta.textContent = `GIF · ${frameCount} khung hình · ${width}×${height} · ${formatBytes(blob.size)}`;
      downloadBtnText.textContent = 'Tải xuống GIF';
      if (successBadgeText) successBadgeText.textContent = 'Chuyển video sang GIF thành công!';
      downloadSection.classList.remove('hidden');
      progressSection.classList.add('hidden');
      videoToGifConvertBtn.disabled = false;
      if (workerUrl) URL.revokeObjectURL(workerUrl);
      showToast('Chuyển video sang GIF thành công! 🎉', 'success');
    });
    gif.on('error', err => { throw err; });
    gif.render();
  } catch (err) {
    console.error(err);
    progressSection.classList.add('hidden');
    videoToGifConvertBtn.disabled = false;
    if (workerUrl) URL.revokeObjectURL(workerUrl);
    showToast('Lỗi chuyển video: ' + (err.message || err), 'error');
  }
});

// ─── Mute Video Tab ───────────────────────────────────────────────────────────
const muteVideoBtn       = document.getElementById('muteVideoBtn');
const muteVideoStatus    = document.getElementById('muteVideoStatus');
const muteVideoFileName  = document.getElementById('muteVideoFileName');
const muteChooseAnotherBtn = document.getElementById('muteChooseAnotherBtn');

let ffmpegInstance = null;
let ffmpegLoaded   = false;
let ffmpegLoading  = false;

// "Chọn file khác" in mute tab → same as videoChooseAnotherBtn (resets everything)
muteChooseAnotherBtn.addEventListener('click', resetAll);

// Called from setVideoToGifFile when video metadata is loaded
function updateMuteTab() {
  if (videoToGifFile && Number.isFinite(videoPlayer.duration) && videoPlayer.duration > 0) {
    muteVideoBtn.disabled = false;
    muteVideoFileName.textContent = `${videoToGifFile.name} · ${formatBytes(videoToGifFile.size)} · ${videoPlayer.videoWidth}×${videoPlayer.videoHeight} · ${videoPlayer.duration.toFixed(1)} giây`;
    muteVideoStatus.textContent = '';
  } else {
    muteVideoBtn.disabled = true;
    muteVideoFileName.textContent = '';
    muteVideoStatus.textContent = '';
  }
}

async function loadFFmpeg() {
  if (ffmpegLoaded) return ffmpegInstance;
  if (ffmpegLoading) {
    await new Promise(resolve => {
      const check = setInterval(() => { if (!ffmpegLoading) { clearInterval(check); resolve(); } }, 100);
    });
    return ffmpegInstance;
  }
  ffmpegLoading = true;
  muteVideoBtn.disabled = true;

  try {
    const { FFmpeg } = window.FFmpegWASM || {};
    const { toBlobURL } = window.FFmpegUtil || {};
    if (!FFmpeg) throw new Error('FFmpeg.wasm chưa được tải.');
    if (!toBlobURL) throw new Error('FFmpegUtil chưa được tải');

    ffmpegInstance = new FFmpeg();
    ffmpegInstance.on('log', ({ message }) => console.log('[FFmpeg]', message));
    ffmpegInstance.on('progress', ({ progress }) => {
      if (progress > 0 && progress <= 1) {
        const pct = Math.round(progress * 100);
        updateProgress(pct, `Đang xử lý... ${pct}%`);
      }
    });

    await ffmpegInstance.load({
      coreURL: await toBlobURL('ffmpeg/ffmpeg-core.js',   'text/javascript'),
      wasmURL: await toBlobURL('ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
    });

    ffmpegLoaded = true;
    ffmpegLoading = false;
  } catch (err) {
    ffmpegLoading = false;
    throw err;
  }
  return ffmpegInstance;
}

muteVideoBtn.addEventListener('click', async () => {
  if (!videoToGifFile) { showToast('Hãy chọn video trước!', 'error'); return; }

  muteVideoBtn.disabled = true;
  downloadSection.classList.add('hidden');
  progressSection.classList.remove('hidden');
  updateProgress(15, 'Đang chuẩn bị file video...');

  try {
    const ffmpeg = await loadFFmpeg();
    updateProgress(35, 'Đang nạp video vào bộ nhớ...');

    const { fetchFile } = window.FFmpegUtil || {};
    if (!fetchFile) throw new Error('FFmpegUtil chưa được tải');
    const inputData = await fetchFile(videoToGifFile);

    const ext = videoToGifFile.name.split('.').pop().toLowerCase() || 'mp4';
    const inputName  = `input.${ext}`;
    const outputName = `output_no_audio.${ext}`;

    await ffmpeg.writeFile(inputName, inputData);

    updateProgress(65, 'Đang xóa âm thanh khỏi video...');
    // -c:v copy = giữ nguyên chất lượng video, -an = xóa âm thanh, không re-encode → xử lý tức thì
    await ffmpeg.exec(['-i', inputName, '-c:v', 'copy', '-an', outputName]);

    updateProgress(90, 'Đang hoàn tất đóng gói video...');
    const outputData = await ffmpeg.readFile(outputName);
    const blob = new Blob([outputData.buffer], { type: videoToGifFile.type || 'video/mp4' });

    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});

    if (mutedVideoBlobUrl) URL.revokeObjectURL(mutedVideoBlobUrl);
    mutedVideoBlobUrl = URL.createObjectURL(blob);

    // Show preview on Result Card so user can play and check audio
    resultVideo.src = mutedVideoBlobUrl;
    resultVideo.muted = false; // unmuted by default so user can test and hear that sound is gone
    resultVideo.classList.remove('hidden');
    resultImg.classList.add('hidden');
    if (placeholderResult) placeholderResult.style.display = 'none';
    resultMeta.textContent = `Video không tiếng · ${formatBytes(blob.size)}`;

    // Show download bar
    updateProgress(100, 'Hoàn tất!');
    progressSection.classList.add('hidden');
    if (successBadgeText) successBadgeText.textContent = 'Xóa âm thanh thành công!';
    downloadBtnText.textContent = 'Tải xuống video không tiếng';
    downloadSection.classList.remove('hidden');
    downloadSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    showToast('Xóa âm thanh thành công! 🎉', 'success');

  } catch (err) {
    console.error('[MuteVideo]', err);
    progressSection.classList.add('hidden');
    showToast('Lỗi xóa âm thanh: ' + (err.message || err), 'error');
  } finally {
    muteVideoBtn.disabled = false;
  }
});

// ─── Process GIF ──────────────────────────────────────────────────────────────
async function processGif() {
  if (!superGif || frameCount === 0) { showToast('File GIF chưa sẵn sàng!', 'error'); return; }

  const tolerance = parseInt(toleranceSlider.value);
  const feather   = parseInt(featherSlider.value);
  const speed     = parseFloat(speedSlider.value);
  const [r0, g0, b0] = hexToRgb(bgColorInput.value);
  const removeIslands = removeIslandsCheck.checked;

  // ── Compression preset ─────────────────────────────────────────────────────
  // scale    : resize output canvas before encoding
  // quality  : gif.js colour-quantisation quality (1 = best, 25 = fastest/smallest)
  // frameSkip: keep 1 out of every N frames
  const compressLevel = parseInt(compressSlider.value);
  const COMPRESS_PRESETS = [
    { scale: 1.00, quality:  1, frameSkip: 1 }, // 0: Không nén
    { scale: 1.00, quality:  2, frameSkip: 1 }, // 1: Nhẹ
    { scale: 0.75, quality:  3, frameSkip: 1 }, // 2: Trung bình
    { scale: 0.50, quality:  4, frameSkip: 2 }, // 3: Mạnh
    { scale: 0.40, quality:  5, frameSkip: 3 }, // 4: Tối đa (40% kích thước = ~5% dữ liệu gốc)
  ];
  const { scale: outScale, quality: gifQuality, frameSkip } = COMPRESS_PRESETS[compressLevel];

  processBtn.disabled = true;
  downloadSection.classList.add('hidden');
  progressSection.classList.remove('hidden');
  updateProgress(0, 'Đang chuẩn bị...');

  // Fetch worker script → Blob URL để tránh CORS
  let workerBlobUrl = null;
  try {
    updateProgress(2, 'Đang tải worker...');
    const resp = await fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
    const blob = await resp.blob();
    workerBlobUrl = URL.createObjectURL(blob);
  } catch (e) {
    console.warn('Không tải được worker script:', e);
  }

  const gifCanvas = superGif.get_canvas();
  const W = gifCanvas.width;
  const H = gifCanvas.height;
  const outW = Math.max(2, Math.round(W * outScale));
  const outH = Math.max(2, Math.round(H * outScale));

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width  = W;
  tmpCanvas.height = H;
  const tmpCtx = tmpCanvas.getContext('2d', { willReadFrequently: true });

  // Scaled output canvas (only created when compression reduces size)
  const needsScale  = outScale < 1;
  const scaledCanvas = needsScale ? document.createElement('canvas') : tmpCanvas;
  if (needsScale) { scaledCanvas.width = outW; scaledCanvas.height = outH; }
  const scaledCtx = needsScale ? scaledCanvas.getContext('2d') : null;

  const processedFrames = [];

  for (let i = 0; i < frameCount; i++) {
    superGif.move_to(i);
    const src = superGif.get_canvas();

    // Copy frame to temp canvas
    tmpCtx.clearRect(0, 0, W, H);
    tmpCtx.drawImage(src, 0, 0);

    // Get pixel data and remove background
    const imgData = tmpCtx.getImageData(0, 0, W, H);
    removeBackground(imgData.data, r0, g0, b0, tolerance, feather, W, H, removeIslands, customSeeds);

    const delay = Math.max(20, Math.round((frameDelays[i] || 100) / speed));
    processedFrames.push({ imgData, delay });

    // Update progress
    updateProgress(Math.round(((i + 1) / frameCount) * 60), `Xử lý frame ${i + 1} / ${frameCount}`);
    if (i % 5 === 0) await sleep(0);
  }
  lastProcessedFrames = processedFrames;

  // gif.js chỉ có alpha 1-bit và tìm màu trong suốt gần nhất trong palette.
  // Dùng magenta cố định có thể chiếm chung palette với màu đỏ/hồng của vật thể.
  // Chọn chroma key xa nhất với tất cả pixel đục trong GIF để không làm mất màu thật.
  const transparentKey = chooseGifTransparencyKey(processedFrames);
  const gifOpts = {
    workers: workerBlobUrl ? 2 : 0,
    quality: gifQuality,
    width:   outW,
    height:  outH,
    transparent: transparentKey,
  };
  if (workerBlobUrl) gifOpts.workerScript = workerBlobUrl;
  const gif = new GIF(gifOpts);

  let outputFrameCount = 0;
  for (let i = 0; i < processedFrames.length; i++) {
    if (i % frameSkip !== 0) continue; // skip frames for size reduction
    const { imgData, delay } = processedFrames[i];
    const frameDelay = Math.max(20, Math.round(delay * frameSkip));

    if (needsScale) {
      // ✔ Đúng thứ tự: scale với alpha nguyên vẹn → rồi mới apply key color
      // Nếu apply key trước: bilinear scaling sẽ trộn lime-green vào viền → viền xanh lá
      tmpCtx.putImageData(imgData, 0, 0);
      scaledCtx.clearRect(0, 0, outW, outH);
      scaledCtx.drawImage(tmpCanvas, 0, 0, outW, outH);
      // Đọc lại pixel ở resolution nhỏ, rồi mới tô key color
      const scaledPx = scaledCtx.getImageData(0, 0, outW, outH);
      applyGifTransparencyKey(scaledPx.data, transparentKey);
      scaledCtx.putImageData(scaledPx, 0, 0);
      gif.addFrame(scaledCanvas, { delay: frameDelay, copy: true });
    } else {
      // Không scale: apply key trực tiếp rồi put lên canvas
      applyGifTransparencyKey(imgData.data, transparentKey);
      tmpCtx.putImageData(imgData, 0, 0);
      gif.addFrame(tmpCanvas, { delay: frameDelay, copy: true });
    }

    outputFrameCount++;
    updateProgress(60 + Math.round(((i + 1) / processedFrames.length) * 20), `Chuẩn bị frame ${i + 1} / ${frameCount}`);
    if (i % 5 === 0) await sleep(0);
  }

  updateProgress(85, 'Đang mã hóa GIF...');
  frameInfo.textContent = `Đang mã hóa ${frameCount} frames...`;

  gif.on('progress', p => updateProgress(85 + Math.round(p * 14), 'Đang mã hóa GIF...'));

  gif.on('finished', blob => {
    if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }
    // Store specifically for animation base
    if (lastStaticProcessedUrl) URL.revokeObjectURL(lastStaticProcessedUrl);
    lastStaticProcessedUrl = URL.createObjectURL(blob);
    
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    resultBlobUrl = URL.createObjectURL(blob);

    showSynchronizedGifPreviews(sourceBlobUrl, resultBlobUrl);
    placeholderResult.style.display = 'none';
    const scaleInfo = outScale < 1 ? ` · ${Math.round(outScale * 100)}% kích thước` : '';
    resultMeta.textContent = `${formatBytes(blob.size)} · ${outputFrameCount} frames${scaleInfo}`;
    if (blob.size > 1_000_000) {
      showToast(`GIF lớn hơn 1MB (${formatBytes(blob.size)}). Tăng mức Nén để giảm tiếp!`, 'info');
    }

    updateProgress(100, 'Hoàn tất!');
    progressSection.classList.add('hidden');
    if (successBadgeText) successBadgeText.textContent = 'Xóa nền thành công!';
    downloadBtnText.textContent = 'Tải xuống GIF';
    downloadSection.classList.remove('hidden');
    processBtn.disabled = false;
    showToast('Xóa nền thành công! 🎉', 'success');
  });

  gif.on('error', err => {
    console.error('gif.js error:', err);
    if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }
    progressSection.classList.add('hidden');
    processBtn.disabled = false;
    showToast('Lỗi encode GIF: ' + (err?.message || err), 'error');
  });

  gif.render();
}

// Hai thẻ <img> GIF có timeline riêng. Kết quả được gán sau khi encode nên
// luôn chậm pha so với bản gốc, dễ làm người dùng tưởng màu động bị thay đổi.
function showSynchronizedGifPreviews(originalUrl, processedUrl) {
  originalImg.removeAttribute('src');
  resultImg.removeAttribute('src');

  requestAnimationFrame(() => {
    originalImg.src = originalUrl;
    resultImg.src = processedUrl;
    resultImg.classList.remove('hidden');
  });
}

// Chọn màu key có khoảng cách nhỏ nhất tới pixel thật là lớn nhất.
// Việc này tránh trường hợp màu key magenta bị gif.js gộp vào màu đỏ/hồng.
function chooseGifTransparencyKey(frames) {
  const candidates = [
    0x00FF00, // lime
    0x00FFFF, // cyan
    0xFF00FF, // magenta
    0x0000FF, // blue
    0xFFFF00, // yellow
    0xFF8000, // orange
  ];
  let bestKey = candidates[0];
  let bestMinDistance = -1;

  for (const key of candidates) {
    const kr = (key >> 16) & 255;
    const kg = (key >> 8) & 255;
    const kb = key & 255;
    let minDistance = Infinity;

    for (const frame of frames) {
      const data = frame.imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        const dr = data[i] - kr;
        const dg = data[i + 1] - kg;
        const db = data[i + 2] - kb;
        const distance = dr * dr + dg * dg + db * db;
        if (distance < minDistance) minDistance = distance;
        if (minDistance === 0) break;
      }
      if (minDistance === 0) break;
    }

    if (minDistance > bestMinDistance) {
      bestMinDistance = minDistance;
      bestKey = key;
    }
  }

  return bestKey;
}

function applyGifTransparencyKey(data, key) {
  const kr = (key >> 16) & 255;
  const kg = (key >> 8) & 255;
  const kb = key & 255;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) {
      data[i] = kr;
      data[i + 1] = kg;
      data[i + 2] = kb;
    }
    data[i + 3] = 255;
  }
}

// ─── Frame Editor Module ──────────────────────────────────────────────────────

function copyImageData(src) {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d');
  ctx.putImageData(src, 0, 0);
  return ctx.getImageData(0, 0, src.width, src.height);
}

function initGifFrames() {
  if (!superGif || frameCount === 0) {
    showToast('Hãy tải file GIF trước!', 'error');
    return;
  }
  if (gifFrames.length > 0 && gifFrames.length === frameCount) {
    // Frames already extracted, render and show
    renderFilmstrip();
    setActiveFrame(activeFrameIndex);
    return;
  }

  gifFrames = [];
  const W = superGif.get_canvas().width;
  const H = superGif.get_canvas().height;

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = W;
  tmpCanvas.height = H;
  const tmpCtx = tmpCanvas.getContext('2d', { willReadFrequently: true });

  const tolerance = parseInt(toleranceSlider.value);
  const feather   = parseInt(featherSlider.value);
  const [r0, g0, b0] = hexToRgb(bgColorInput.value);
  const removeIslands = removeIslandsCheck.checked;

  for (let i = 0; i < frameCount; i++) {
    let imgData;
    if (lastProcessedFrames && lastProcessedFrames[i]) {
      imgData = copyImageData(lastProcessedFrames[i].imgData);
    } else {
      superGif.move_to(i);
      const src = superGif.get_canvas();
      tmpCtx.clearRect(0, 0, W, H);
      tmpCtx.drawImage(src, 0, 0);
      imgData = tmpCtx.getImageData(0, 0, W, H);
      removeBackground(imgData.data, r0, g0, b0, tolerance, feather, W, H, removeIslands, customSeeds);
    }

    const delay = frameDelays[i] || 100;
    gifFrames.push({
      index: i,
      delay,
      initialImageData: copyImageData(imgData),
      currentImageData: imgData,
      history: []
    });
  }

  activeFrameIndex = 0;
  currentZoom = 'fit';
  renderFilmstrip();
  setActiveFrame(0);
}

function renderFilmstrip() {
  if (!frameFilmstrip) return;
  frameFilmstrip.innerHTML = '';
  if (frameFilmstripCount) frameFilmstripCount.textContent = `${gifFrames.length} khung hình`;

  gifFrames.forEach((frame, idx) => {
    const item = document.createElement('div');
    item.className = 'filmstrip-item' + (idx === activeFrameIndex ? ' active' : '');
    item.id = `filmstripItem-${idx}`;

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'filmstrip-thumb-wrap checkered';

    const canvas = document.createElement('canvas');
    canvas.width = frame.currentImageData.width;
    canvas.height = frame.currentImageData.height;
    canvas.id = `filmstripCanvas-${idx}`;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(frame.currentImageData, 0, 0);

    thumbWrap.appendChild(canvas);

    const label = document.createElement('span');
    label.className = 'filmstrip-label';
    label.textContent = `#${idx + 1}`;

    item.appendChild(thumbWrap);
    item.appendChild(label);

    item.addEventListener('click', () => setActiveFrame(idx));
    frameFilmstrip.appendChild(item);
  });
}

function updateThumbnail(idx) {
  const canvas = document.getElementById(`filmstripCanvas-${idx}`);
  if (canvas && gifFrames[idx]) {
    const ctx = canvas.getContext('2d');
    ctx.putImageData(gifFrames[idx].currentImageData, 0, 0);
  }
}

function setActiveFrame(idx) {
  if (!gifFrames || gifFrames.length === 0) return;
  if (idx < 0) idx = 0;
  if (idx >= gifFrames.length) idx = gifFrames.length - 1;
  activeFrameIndex = idx;

  document.querySelectorAll('.filmstrip-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });

  const activeItem = document.getElementById(`filmstripItem-${idx}`);
  if (activeItem) {
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  drawActiveFrame();

  if (frameEditorIndexBadge) frameEditorIndexBadge.textContent = `Frame ${idx + 1} / ${gifFrames.length}`;
  if (frameCounterNav) frameCounterNav.textContent = `${idx + 1} / ${gifFrames.length}`;
  if (frameEditorDelayBadge) frameEditorDelayBadge.textContent = `Delay: ${gifFrames[idx].delay}ms`;
}

function applyCanvasZoom() {
  const frame = gifFrames[activeFrameIndex];
  if (!frame || !frameEditorCanvas || !frameEditorWrap) return;

  const W = frame.currentImageData.width;
  const H = frame.currentImageData.height;

  if (currentZoom === 'fit') {
    const wrapW = frameEditorWrap.clientWidth - 48;
    const wrapH = frameEditorWrap.clientHeight - 48;
    if (wrapW > 50 && wrapH > 50) {
      const scaleFit = Math.min(wrapW / W, wrapH / H);
      // Auto-upscale small GIFs so they fill the enlarged canvas viewport
      const appliedScale = Math.max(0.2, Math.min(6, scaleFit));
      zoomNumeric = appliedScale;
      frameEditorCanvas.style.width = Math.round(W * appliedScale) + 'px';
      frameEditorCanvas.style.height = Math.round(H * appliedScale) + 'px';
      if (frameZoomVal) frameZoomVal.textContent = `${Math.round(appliedScale * 100)}% (Fit)`;
    }
  } else {
    const scale = typeof currentZoom === 'number' ? currentZoom : parseFloat(currentZoom) || 1;
    zoomNumeric = scale;
    frameEditorCanvas.style.width = Math.round(W * scale) + 'px';
    frameEditorCanvas.style.height = Math.round(H * scale) + 'px';
    if (frameZoomVal) frameZoomVal.textContent = `${Math.round(scale * 100)}%`;
  }

  document.querySelectorAll('.btn-zoom-pill').forEach(btn => {
    if (currentZoom === 'fit') {
      btn.classList.toggle('active', btn.dataset.zoom === 'fit');
    } else {
      btn.classList.toggle('active', Math.abs((parseFloat(btn.dataset.zoom) || 0) - zoomNumeric) < 0.05);
    }
  });
}

function zoomIn() {
  let next = Math.round((zoomNumeric + 0.25) * 4) / 4;
  if (next > 6) next = 6;
  currentZoom = next;
  applyCanvasZoom();
}

function zoomOut() {
  let next = Math.round((zoomNumeric - 0.25) * 4) / 4;
  if (next < 0.25) next = 0.25;
  currentZoom = next;
  applyCanvasZoom();
}

function drawActiveFrame() {
  const frame = gifFrames[activeFrameIndex];
  if (!frame || !frameEditorCanvas) return;

  const W = frame.currentImageData.width;
  const H = frame.currentImageData.height;

  frameEditorCanvas.width = W;
  frameEditorCanvas.height = H;
  const ctx = frameEditorCanvas.getContext('2d');
  ctx.putImageData(frame.currentImageData, 0, 0);

  applyCanvasZoom();
}

function saveFrameHistory(frame) {
  if (!frame.history) frame.history = [];
  if (frame.history.length >= 15) frame.history.shift();
  frame.history.push(copyImageData(frame.currentImageData));
}

function floodFillRemove(imgData, startX, startY, tolerance, W, H) {
  const data = imgData.data;
  const startIdx = (startY * W + startX) * 4;
  const targetA = data[startIdx + 3];
  if (targetA === 0) return false;

  const targetR = data[startIdx];
  const targetG = data[startIdx + 1];
  const targetB = data[startIdx + 2];

  const tolSq = tolerance * tolerance * 3;
  const visited = new Uint8Array(W * H);
  const queue = new Int32Array(W * H * 2);
  let head = 0;
  let tail = 0;

  queue[tail++] = startX;
  queue[tail++] = startY;
  visited[startY * W + startX] = 1;

  while (head < tail) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = (y * W + x) * 4;

    data[idx + 3] = 0; // Transparent

    const nbs = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
    for (let i = 0; i < 4; i++) {
      const nx = nbs[i][0];
      const ny = nbs[i][1];
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        const nPos = ny * W + nx;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const nIdx = nPos * 4;
          if (data[nIdx + 3] > 0) {
            const dr = data[nIdx] - targetR;
            const dg = data[nIdx + 1] - targetG;
            const db = data[nIdx + 2] - targetB;
            if (dr * dr + dg * dg + db * db <= tolSq) {
              queue[tail++] = nx;
              queue[tail++] = ny;
            }
          }
        }
      }
    }
  }
  return true;
}

function eraseCircle(imgData, cx, cy, radius, W, H) {
  const data = imgData.data;
  const rSq = radius * radius;
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(W - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(H - 1, Math.ceil(cy + radius));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= rSq) {
        data[(y * W + x) * 4 + 3] = 0;
      }
    }
  }
}

function getCanvasCoords(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);
  return {
    x: Math.max(0, Math.min(canvas.width - 1, x)),
    y: Math.max(0, Math.min(canvas.height - 1, y))
  };
}

if (frameEditorCanvas) {
  frameEditorCanvas.addEventListener('mousedown', e => {
    if (isSpacePressed || e.button === 1) return;
    const frame = gifFrames[activeFrameIndex];
    if (!frame) return;

    const { x, y } = getCanvasCoords(e, frameEditorCanvas);
    const W = frame.currentImageData.width;
    const H = frame.currentImageData.height;

    if (currentFrameTool === 'wand') {
      saveFrameHistory(frame);
      lastWandPoint = { x, y };
      const tol = parseInt(frameTolerance.value) || 30;
      const ok = floodFillRemove(frame.currentImageData, x, y, tol, W, H);
      if (ok) {
        drawActiveFrame();
        updateThumbnail(activeFrameIndex);
        showToast('Đã xóa vùng chọn trên frame này!', 'success');
      }
    } else if (currentFrameTool === 'eraser') {
      isErasingOnFrame = true;
      saveFrameHistory(frame);
      const radius = Math.round((parseInt(frameBrushSize.value) || 15) / 2);
      eraseCircle(frame.currentImageData, x, y, radius, W, H);
      drawActiveFrame();
    }
  });

  frameEditorCanvas.addEventListener('mousemove', e => {
    if (!isErasingOnFrame || currentFrameTool !== 'eraser') return;
    const frame = gifFrames[activeFrameIndex];
    if (!frame) return;

    const { x, y } = getCanvasCoords(e, frameEditorCanvas);
    const W = frame.currentImageData.width;
    const H = frame.currentImageData.height;
    const radius = Math.round((parseInt(frameBrushSize.value) || 15) / 2);

    eraseCircle(frame.currentImageData, x, y, radius, W, H);
    drawActiveFrame();
  });

  const stopErasing = () => {
    if (isErasingOnFrame) {
      isErasingOnFrame = false;
      updateThumbnail(activeFrameIndex);
    }
  };
  frameEditorCanvas.addEventListener('mouseup', stopErasing);
  frameEditorCanvas.addEventListener('mouseleave', stopErasing);
}

document.querySelectorAll('input[name="frameTool"]').forEach(r => {
  r.addEventListener('change', e => {
    currentFrameTool = e.target.value;
    if (currentFrameTool === 'wand') {
      frameWandControls.style.display = 'flex';
      frameEraserControls.style.display = 'none';
      frameEditorWrap.style.cursor = 'crosshair';
    } else {
      frameWandControls.style.display = 'none';
      frameEraserControls.style.display = 'flex';
      frameEditorWrap.style.cursor = 'cell';
    }
  });
});

if (frameTolerance) {
  frameTolerance.addEventListener('input', () => {
    frameToleranceVal.textContent = frameTolerance.value;
  });
}
if (frameBrushSize) {
  frameBrushSize.addEventListener('input', () => {
    frameBrushSizeVal.textContent = frameBrushSize.value + 'px';
  });
}

// ─── Zoom & Pan Controls ──────────────────────────────────────────────────
if (frameZoomInBtn) frameZoomInBtn.addEventListener('click', zoomIn);
if (frameZoomOutBtn) frameZoomOutBtn.addEventListener('click', zoomOut);

document.querySelectorAll('.btn-zoom-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    const z = btn.dataset.zoom;
    if (z === 'fit') {
      currentZoom = 'fit';
    } else {
      currentZoom = parseFloat(z) || 1;
    }
    applyCanvasZoom();
  });
});

window.addEventListener('keydown', e => {
  if (e.code === 'Space' && !e.target.matches('input, textarea, select, [contenteditable]')) {
    if (currentTab === 'frameEditor') {
      e.preventDefault();
      isSpacePressed = true;
      if (frameEditorWrap) frameEditorWrap.style.cursor = 'grab';
    }
  }
});

window.addEventListener('keyup', e => {
  if (e.code === 'Space') {
    isSpacePressed = false;
    if (frameEditorWrap) {
      frameEditorWrap.style.cursor = (currentFrameTool === 'wand') ? 'crosshair' : 'cell';
    }
  }
});

if (frameEditorWrap) {
  frameEditorWrap.addEventListener('mousedown', e => {
    if (isSpacePressed || e.button === 1) {
      e.preventDefault();
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      scrollStartX = frameEditorWrap.scrollLeft;
      scrollStartY = frameEditorWrap.scrollTop;
      frameEditorWrap.style.cursor = 'grabbing';
    }
  });

  window.addEventListener('mousemove', e => {
    if (isPanning && frameEditorWrap) {
      e.preventDefault();
      const dx = e.clientX - panStartX;
      const dy = e.clientY - panStartY;
      frameEditorWrap.scrollLeft = scrollStartX - dx;
      frameEditorWrap.scrollTop = scrollStartY - dy;
    }
  });

  window.addEventListener('mouseup', () => {
    if (isPanning) {
      isPanning = false;
      if (frameEditorWrap) {
        frameEditorWrap.style.cursor = isSpacePressed ? 'grab' : (currentFrameTool === 'wand' ? 'crosshair' : 'cell');
      }
    }
  });

  frameEditorWrap.addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  }, { passive: false });
}

window.addEventListener('resize', () => {
  if (currentTab === 'frameEditor' && currentZoom === 'fit') {
    applyCanvasZoom();
  }
});

if (frameUndoBtn) {
  frameUndoBtn.addEventListener('click', () => {
    const frame = gifFrames[activeFrameIndex];
    if (!frame || !frame.history || frame.history.length === 0) {
      showToast('Chưa có thao tác nào để hoàn tác trên frame này!', 'info');
      return;
    }
    frame.currentImageData = frame.history.pop();
    drawActiveFrame();
    updateThumbnail(activeFrameIndex);
    showToast('Đã hoàn tác frame này!', 'success');
  });
}

if (frameResetBtn) {
  frameResetBtn.addEventListener('click', () => {
    const frame = gifFrames[activeFrameIndex];
    if (!frame) return;
    saveFrameHistory(frame);
    frame.currentImageData = copyImageData(frame.initialImageData);
    drawActiveFrame();
    updateThumbnail(activeFrameIndex);
    showToast('Đã khôi phục frame này về ban đầu!', 'info');
  });
}

if (frameApplyAllBtn) {
  frameApplyAllBtn.addEventListener('click', () => {
    if (!lastWandPoint) {
      showToast('Hãy click xóa một điểm trên frame trước, rồi mới bấm Áp dụng cho mọi Frame!', 'error');
      return;
    }
    const tol = parseInt(frameTolerance.value) || 30;
    const { x, y } = lastWandPoint;

    gifFrames.forEach((frame, idx) => {
      saveFrameHistory(frame);
      const W = frame.currentImageData.width;
      const H = frame.currentImageData.height;
      floodFillRemove(frame.currentImageData, x, y, tol, W, H);
      updateThumbnail(idx);
    });

    drawActiveFrame();
    showToast(`Đã áp dụng xóa vùng tại (${x}, ${y}) trên toàn bộ ${gifFrames.length} frame! 🎉`, 'success');
  });
}

if (framePrevBtn) framePrevBtn.addEventListener('click', () => setActiveFrame(activeFrameIndex - 1));
if (frameNextBtn) frameNextBtn.addEventListener('click', () => setActiveFrame(activeFrameIndex + 1));

window.addEventListener('keydown', e => {
  if (currentTab !== 'frameEditor') return;
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    setActiveFrame(activeFrameIndex - 1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    setActiveFrame(activeFrameIndex + 1);
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault();
    frameUndoBtn.click();
  }
});

async function exportEditedGif() {
  if (!gifFrames || gifFrames.length === 0) {
    showToast('Chưa có frame nào để xuất!', 'error');
    return;
  }

  frameEditorExportBtn.disabled = true;
  progressSection.classList.remove('hidden');
  downloadSection.classList.add('hidden');
  updateProgress(5, 'Đang chuẩn bị các frame...');

  try {
    const W = gifFrames[0].currentImageData.width;
    const H = gifFrames[0].currentImageData.height;

    const compressLevel = parseInt(compressSlider.value);
    const COMPRESS_PRESETS = [
      { scale: 1.00, quality: 1,  frameSkip: 1 },
      { scale: 1.00, quality: 10, frameSkip: 1 },
      { scale: 0.75, quality: 12, frameSkip: 1 },
      { scale: 0.50, quality: 15, frameSkip: 2 },
      { scale: 0.50, quality: 20, frameSkip: 3 },
    ];
    const preset = COMPRESS_PRESETS[compressLevel] || COMPRESS_PRESETS[1];
    const speed = parseFloat(speedSlider.value) || 1;

    const outScale = preset.scale;
    const outW = Math.max(1, Math.round(W * outScale));
    const outH = Math.max(1, Math.round(H * outScale));

    const exportFrames = [];
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = W;
    tmpCanvas.height = H;
    const tmpCtx = tmpCanvas.getContext('2d');

    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = outW;
    scaledCanvas.height = outH;
    const scaledCtx = scaledCanvas.getContext('2d');

    for (let i = 0; i < gifFrames.length; i++) {
      const frame = gifFrames[i];
      tmpCtx.putImageData(frame.currentImageData, 0, 0);

      scaledCtx.clearRect(0, 0, outW, outH);
      scaledCtx.drawImage(tmpCanvas, 0, 0, outW, outH);

      const delay = Math.max(20, Math.round(frame.delay / speed));
      exportFrames.push({
        imgData: scaledCtx.getImageData(0, 0, outW, outH),
        delay
      });
      updateProgress(Math.round(((i + 1) / gifFrames.length) * 50), `Chuẩn bị frame ${i + 1}/${gifFrames.length}`);
    }

    const transparentKey = chooseGifTransparencyKey(exportFrames);
    const workerUrl = await getGifWorkerUrl();
    const gif = new window.GIF({
      workers: workerUrl ? 2 : 0,
      workerScript: workerUrl || undefined,
      quality: preset.quality,
      width: outW,
      height: outH,
      transparent: transparentKey,
      repeat: 0
    });

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = outW;
    frameCanvas.height = outH;
    const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true });

    for (let i = 0; i < exportFrames.length; i++) {
      const f = exportFrames[i];
      applyGifTransparencyKey(f.imgData.data, transparentKey);
      frameCtx.putImageData(f.imgData, 0, 0);
      gif.addFrame(frameCtx, { copy: true, delay: f.delay });
    }

    gif.on('progress', p => {
      updateProgress(50 + Math.round(p * 50), `Đang mã hóa GIF... ${Math.round(p * 100)}%`);
    });

    gif.on('finished', blob => {
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
      resultBlobUrl = URL.createObjectURL(blob);

      resultImg.src = resultBlobUrl;
      resultImg.classList.remove('hidden');
      resultVideo.classList.add('hidden');
      placeholderResult.style.display = 'none';
      resultMeta.textContent = `GIF đã sửa · ${exportFrames.length} khung hình · ${formatBytes(blob.size)}`;

      updateProgress(100, 'Hoàn tất!');
      progressSection.classList.add('hidden');
      if (successBadgeText) successBadgeText.textContent = 'Đã cập nhật GIF thành công!';
      downloadBtnText.textContent = 'Tải xuống GIF đã sửa';
      downloadSection.classList.remove('hidden');
      downloadSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      frameEditorExportBtn.disabled = false;
      showToast('Xuất GIF từ các frame đã sửa thành công! 🎉', 'success');
    });

    gif.on('error', err => { throw err; });
    gif.render();

  } catch (err) {
    console.error(err);
    progressSection.classList.add('hidden');
    frameEditorExportBtn.disabled = false;
    showToast('Lỗi xuất GIF: ' + (err.message || err), 'error');
  }
}

if (frameEditorExportBtn) {
  frameEditorExportBtn.addEventListener('click', exportEditedGif);
}

// ─── Background Removal Algorithm v2 ──────────────────────────────────────────
// Flood-fill từ viền ảnh với khoảng cách màu Redmean (perceptual).
// Viền được làm mượt bằng Gaussian blur thay vì box blur.
function removeBackground(data, r0, g0, b0, tolerance, feather, w, h, doRemoveIslands, seeds = []) {
  // Redmean range ≈ 9 × 255² = 585 225. Map slider (0-128) đến cùng tỉ lệ.
  const tol2 = tolerance * tolerance * 9;
  const n    = w * h;
  const mask    = new Uint8Array(n); // 255 = nền (xóa), 0 = vật thể (giữ)
  const visited = new Uint8Array(n);
  const queue   = [];

  // ── Flood-fill từ 4 viền ảnh ──────────────────────────────────────────────
  function tryEnqueue(x, y) {
    const idx = y * w + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    const b = idx * 4;
    if (data[b + 3] < 10 || colorDistance2(data[b], data[b + 1], data[b + 2], r0, g0, b0) <= tol2)
      queue.push(idx);
  }

  for (let x = 0; x < w; x++) { tryEnqueue(x, 0); tryEnqueue(x, h - 1); }
  for (let y = 1; y < h - 1; y++) { tryEnqueue(0, y); tryEnqueue(w - 1, y); }

  // BFS 8 hướng
  while (queue.length) {
    const idx = queue.pop();
    mask[idx] = 255;
    const x = idx % w, y = (idx / w) | 0;
    if (x > 0)         tryEnqueue(x - 1, y);
    if (x < w - 1)     tryEnqueue(x + 1, y);
    if (y > 0)         tryEnqueue(x, y - 1);
    if (y < h - 1)     tryEnqueue(x, y + 1);
    if (x > 0     && y > 0)     tryEnqueue(x - 1, y - 1);
    if (x < w - 1 && y > 0)     tryEnqueue(x + 1, y - 1);
    if (x > 0     && y < h - 1) tryEnqueue(x - 1, y + 1);
    if (x < w - 1 && y < h - 1) tryEnqueue(x + 1, y + 1);
  }

  // ── Seed thủ công (click xóa vùng nền kẹt) ────────────────────────────────
  for (const p of seeds) {
    if (p.x < 0 || p.x >= w || p.y < 0 || p.y >= h) continue;
    const [sr, sg, sb] = p.color;
    const qM = [], vM = new Uint8Array(n);

    const enqM = (x, y) => {
      const idx = y * w + x;
      if (vM[idx] || mask[idx] === 255) return;
      vM[idx] = 1;
      const b = idx * 4;
      if (data[b + 3] < 10 || colorDistance2(data[b], data[b + 1], data[b + 2], sr, sg, sb) <= tol2)
        qM.push(idx);
    };

    enqM(p.x, p.y);
    while (qM.length) {
      const idx = qM.pop();
      mask[idx] = 255;
      const x = idx % w, y = (idx / w) | 0;
      if (x > 0)         enqM(x - 1, y);
      if (x < w - 1)     enqM(x + 1, y);
      if (y > 0)         enqM(x, y - 1);
      if (y < h - 1)     enqM(x, y + 1);
      if (x > 0     && y > 0)     enqM(x - 1, y - 1);
      if (x < w - 1 && y > 0)     enqM(x + 1, y - 1);
      if (x > 0     && y < h - 1) enqM(x - 1, y + 1);
      if (x < w - 1 && y < h - 1) enqM(x + 1, y + 1);
    }
  }

  // ── Island removal: xóa "đảo nền" lọt thỏm bên trong vật thể ─────────────
  if (doRemoveIslands) {
    const MAX_ISLAND = Math.max(80, Math.floor(n * 0.02));
    const iVis = new Uint8Array(n);
    for (let start = 0; start < n; start++) {
      if (mask[start] || iVis[start]) continue;
      const comp = [], iQ = [start];
      iVis[start] = 1;
      let touchesBound = false, overflow = false;
      while (iQ.length) {
        const ci = iQ.pop(); comp.push(ci);
        const cx = ci % w, cy = (ci / w) | 0;
        if (cx === 0 || cx === w - 1 || cy === 0 || cy === h - 1) touchesBound = true;
        const chk = ni => { if (!mask[ni] && !iVis[ni]) { iVis[ni] = 1; iQ.push(ni); } };
        if (cx > 0)     chk(ci - 1);
        if (cx < w - 1) chk(ci + 1);
        if (cy > 0)     chk(ci - w);
        if (cy < h - 1) chk(ci + w);
        if (comp.length > MAX_ISLAND) { overflow = true; break; }
      }
      if (!overflow && !touchesBound) {
        let bgCount = 0;
        for (const ci of comp) {
          const b = ci * 4;
          if (colorDistance2(data[b], data[b + 1], data[b + 2], r0, g0, b0) <= tol2 * 3) bgCount++;
        }
        if (bgCount / comp.length >= 0.5) for (const ci of comp) mask[ci] = 255;
      }
    }
  }

  // ── Áp mask với Gaussian smooth edges ─────────────────────────────────────
  // feather = 0  → sigma 0.5 (chỉ anti-alias sub-pixel, không xóa mất viền)
  // feather > 0  → sigma = feather (viền mềm tùy chỉnh)
  const sigma   = feather > 0 ? feather : 0.5;
  const blurred = gaussianBlur(mask, w, h, sigma);
  for (let i = 0; i < n; i++) {
    data[i * 4 + 3] = Math.round(data[i * 4 + 3] * (1 - blurred[i] / 255));
  }
}


// Redmean perceptual colour distance – https://www.compuphase.com/cmetric.htm
// Range: 0 to ≈ 585 225 (vs plain RGB Euclidean 0-195 075).
// Much better at distinguishing reds, greens, blues from similar-lightness neighbours.
function colorDistance2(r1, g1, b1, r2, g2, b2) {
  const rmean = (r1 + r2) >> 1;
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return (2 + (rmean >> 8)) * dr * dr + 4 * dg * dg + (2 + ((255 - rmean) >> 8)) * db * db;
}

// Separable 2-pass Gaussian blur – produces smooth bell-curve feather
// (much better than box blur which creates rectangular, boxy edges).
function gaussianBlur(mask, w, h, sigma) {
  const radius = Math.ceil(sigma * 3);
  const ksize  = radius * 2 + 1;
  const kernel = new Float32Array(ksize);
  let ksum = 0;
  for (let i = 0; i < ksize; i++) {
    const x = i - radius;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    ksum += kernel[i];
  }
  for (let i = 0; i < ksize; i++) kernel[i] /= ksum;

  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);

  // Horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = 0; k < ksize; k++) {
        const nx = Math.min(w - 1, Math.max(0, x + k - radius));
        v += mask[y * w + nx] * kernel[k];
      }
      tmp[y * w + x] = v;
    }
  }

  // Vertical pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = 0; k < ksize; k++) {
        const ny = Math.min(h - 1, Math.max(0, y + k - radius));
        v += tmp[ny * w + x] * kernel[k];
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function updateProgress(pct, label) {
  progressFill.style.width = pct + '%';
  progressPct.textContent  = pct + '%';
  if (label) progressLabel.textContent = label;
}

function resetAll() {
  currentFile = null;
  superGif    = null;
  isStaticImage = false;
  isVideoFile = false;
  staticImgObj  = null;
  frameCount  = 0;
  frameDelays = [];
  customSeeds = [];
  if (sourceBlobUrl) { URL.revokeObjectURL(sourceBlobUrl); sourceBlobUrl = null; }
  if (resultBlobUrl) { URL.revokeObjectURL(resultBlobUrl); resultBlobUrl = null; }
  if (lastStaticProcessedUrl) { URL.revokeObjectURL(lastStaticProcessedUrl); lastStaticProcessedUrl = null; }
  if (videoToGifUrl) { URL.revokeObjectURL(videoToGifUrl); videoToGifUrl = null; }
  videoToGifFile = null;
  // Remove any helper SuperGif img elements
  document.querySelectorAll('img[rel\\:animated_src]').forEach(el => el.remove());

  fileInput.value = '';
  videoPlayer.pause();
  videoPlayer.removeAttribute('src');
  videoPlayer.load();
  videoPlayer.controls = false;
  videoPlayer.style.display = 'none';
  document.body.appendChild(videoPlayer);
  originalImg.src = '';
  originalImg.classList.remove('hidden');
  originalMeta.textContent = '';
  resultImg.src = '';
  resultImg.classList.add('hidden');
  placeholderResult.style.display = '';
  resultMeta.textContent = '';

  gifFrames = [];
  activeFrameIndex = 0;
  lastWandPoint = null;
  lastProcessedFrames = null;
  currentZoom = 'fit';
  zoomNumeric = 1;
  document.querySelector('.app-wrapper')?.classList.remove('frame-editor-mode');
  if (frameEditorSection) frameEditorSection.classList.add('hidden');
  if (previewRow) previewRow.style.display = '';
  if (controlsPanel) controlsPanel.style.display = '';

  progressSection.classList.add('hidden');
  downloadSection.classList.add('hidden');
  if (mutedVideoBlobUrl) { URL.revokeObjectURL(mutedVideoBlobUrl); mutedVideoBlobUrl = null; }
  if (resultVideo) {
    resultVideo.pause();
    resultVideo.removeAttribute('src');
    resultVideo.load();
    resultVideo.classList.add('hidden');
  }
  muteVideoBtn.disabled = true;
  muteVideoFileName.textContent = '';
  muteVideoStatus.textContent = '';
  workspace.classList.add('hidden');
  tabsContainer.style.display = 'none';
  mainActions.classList.remove('hidden');
  processBtn.classList.remove('hidden');
  uploadSection.classList.remove('hidden');
  processBtn.disabled = false;
  if (successBadgeText) successBadgeText.textContent = 'Xóa nền thành công!';
  if (downloadBtnText) downloadBtnText.textContent = 'Tải xuống kết quả';
  if (manualSeedHint) manualSeedHint.style.display = 'flex';
  if (originalWrap) {
    originalWrap.style.cursor = 'crosshair';
    originalWrap.title = 'Click vào vùng nền bị kẹt để xóa';
  }
}

function downloadResult() {
  if (currentTab === 'muteVideo') {
    if (!mutedVideoBlobUrl) return;
    const a = document.createElement('a');
    a.href = mutedVideoBlobUrl;
    const ext = videoToGifFile?.name?.split('.').pop().toLowerCase() || 'mp4';
    const baseName = videoToGifFile ? videoToGifFile.name.replace(/\.[^/.]+$/, '') : 'video';
    a.download = `${baseName}_no_audio.${ext}`;
    a.click();
    return;
  }

  if (!resultBlobUrl) return;
  const a = document.createElement('a');
  a.href = resultBlobUrl;
  
  if (currentTab === 'videoToGif') {
    const baseName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'result';
    a.download = baseName + '.gif';
  }
  else if (currentTab === 'animate') {
    const baseName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'result';
    a.download = baseName + '_animated.gif';
  }
  else if (isStaticImage) {
    const baseName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'result';
    a.download = baseName + '_no_bg.png';
  } else {
    const baseName = currentFile ? currentFile.name.replace(/\.gif$/i, '') : 'result';
    a.download = baseName + '_no_bg.gif';
  }
  
  a.click();
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(2) + ' MB';
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

function rgbToHex(r, g, b) {
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${msg}</span>`;
  document.body.appendChild(toast);
  if (!document.getElementById('toast-styles')) {
    const s = document.createElement('style');
    s.id = 'toast-styles';
    s.textContent = `
      .toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);
        background:#1e2130;border:1px solid rgba(255,255,255,0.1);color:#f1f5f9;
        padding:12px 24px;border-radius:100px;font-size:.88rem;font-weight:600;
        box-shadow:0 8px 32px rgba(0,0,0,.5);z-index:9999;opacity:0;
        transition:all .3s cubic-bezier(.4,0,.2,1);font-family:'Inter',sans-serif;}
      .toast-success{border-color:rgba(16,185,129,.4);color:#10b981;}
      .toast-error{border-color:rgba(239,68,68,.4);color:#ef4444;}
      .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
    `;
    document.head.appendChild(s);
  }
  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2800);
  });
}

/* ComfyUI video-generation integration removed. Video-to-GIF conversion runs locally. 
const COMFY_URL = "http://127.0.0.1:8188";

async function checkComfyUI() {
  try {
    const res = await fetch(`${COMFY_URL}/system_stats`, { method: 'GET' });
    if (res.ok) {
      comfyStatus.textContent = '🟢 Sẵn sàng';
      comfyStatus.style.color = '#10b981';
      aiGenerateBtn.disabled = false;
    } else {
      throw new Error('Not ok');
    }
  } catch (e) {
    comfyStatus.textContent = '🔴 Mất kết nối';
    comfyStatus.style.color = '#ef4444';
    aiGenerateBtn.disabled = true;
  }
}

async function uploadImageToComfy(blob, filename) {
  const formData = new FormData();
  formData.append('image', blob, filename);
  formData.append('overwrite', 'true');
  formData.append('type', 'input');
  
  const res = await fetch(`${COMFY_URL}/upload/image`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Upload ảnh thất bại');
  const data = await res.json();
  return data.name;
}

async function queueComfyPrompt(workflow) {
  const clientId = Math.random().toString(36).substring(2, 15);
  const res = await fetch(`${COMFY_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow, client_id: clientId })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Queue prompt thất bại: ' + err);
  }
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.prompt_id;
}

async function waitComfyCompletion(promptId, timeoutSeconds) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  while (Date.now() < deadline) {
    const res = await fetch(`${COMFY_URL}/history/${promptId}`);
    if (res.ok) {
      const history = await res.json();
      if (history[promptId]) {
        const result = history[promptId];
        if (result.status && result.status.status_str === "error") {
          throw new Error('ComfyUI báo lỗi trong lúc tạo video!');
        }
        return result;
      }
    }
    // Chờ 2 giây rồi ping lại
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Quá thời gian chờ ComfyUI xử lý!');
}

async function downloadComfyVideo(filename, type = "output", subfolder = "") {
  const params = new URLSearchParams({ filename, type, subfolder });
  const res = await fetch(`${COMFY_URL}/view?${params.toString()}`);
  if (!res.ok) throw new Error('Không tải được video từ ComfyUI');
  return await res.blob();
}

function setNodeInput(workflow, nodeId, inputName, value) {
  if (!nodeId) return;
  const node = workflow[String(nodeId)];
  if (!node) throw new Error(`Không tìm thấy node ID ${nodeId}`);
  if (!node.inputs) node.inputs = {};
  node.inputs[inputName] = value;
}

aiGenerateBtn.addEventListener('click', async () => {
  if (!isStaticImage && !lastStaticProcessedUrl) {
    showToast('Hãy tải lên một bức ảnh trước!', 'error');
    return;
  }
  
  // Đọc file config.json và workflow_api.json
  let config, baseWorkflow;
  try {
    const [cfgRes, wfRes] = await Promise.all([
      fetch('config.json'),
      fetch('workflow_api.json')
    ]);
    if (!cfgRes.ok || !wfRes.ok) throw new Error('Thiếu file config.json hoặc workflow_api.json');
    config = await cfgRes.json();
    baseWorkflow = await wfRes.json();
  } catch (e) {
    showToast('Lỗi đọc cấu hình: ' + e.message, 'error');
    return;
  }
  
  aiGenerateBtn.disabled = true;
  progressSection.classList.remove('hidden');
  downloadSection.classList.add('hidden');
  
  try {
    updateProgress(5, 'Đang chuẩn bị ảnh...');
    
    // Lấy ảnh hiện tại từ resultImg (nếu đã xóa nền) hoặc originalImg
    const sourceImg = resultImg.src.startsWith('blob:') && !resultImg.classList.contains('hidden') ? resultImg : originalImg;
    const imgRes = await fetch(sourceImg.src);
    const imgBlob = await imgRes.blob();
    
    updateProgress(10, 'Đang tải ảnh lên ComfyUI...');
    const uploadedName = await uploadImageToComfy(imgBlob, 'gif_eraser_input.png');
    
    // Chuẩn bị workflow
    updateProgress(20, 'Đang gửi lệnh Prompt...');
    const workflow = JSON.parse(JSON.stringify(baseWorkflow));
    const nodes = config.nodes;
    
    let seedValue = parseInt(aiSeed.value);
    if (seedValue === -1) seedValue = Math.floor(Math.random() * 2147483647);
    
    setNodeInput(workflow, nodes.image.id, nodes.image.input || "image", uploadedName);
    setNodeInput(workflow, nodes.prompt.id, nodes.prompt.input || "text", aiPrompt.value);
    setNodeInput(workflow, nodes.seed.id, nodes.seed.input || "seed", seedValue);
    
    if (nodes.negative_prompt && nodes.negative_prompt.id) {
      setNodeInput(workflow, nodes.negative_prompt.id, nodes.negative_prompt.input || "text", aiNegativePrompt.value);
    }
    if (nodes.frames && nodes.frames.id) {
      setNodeInput(workflow, nodes.frames.id, nodes.frames.input || "length", parseInt(aiFrames.value));
    }
    if (nodes.output_prefix && nodes.output_prefix.id) {
      setNodeInput(workflow, nodes.output_prefix.id, nodes.output_prefix.input || "filename_prefix", "giferaser/" + Math.random().toString(36).substring(7));
    }
    
    // Xếp hàng đợi
    const promptId = await queueComfyPrompt(workflow);
    
    // Chờ kết quả
    updateProgress(30, 'ComfyUI đang chạy AI (có thể mất vài phút)...');
    const historyResult = await waitComfyCompletion(promptId, config.timeout_seconds || 3600);
    
    updateProgress(90, 'Đang lấy kết quả...');
    // Tìm output filename
    let foundVideoInfo = null;
    const outputs = historyResult.outputs || {};
    for (const nodeOutput of Object.values(outputs)) {
      const candidates = [...(nodeOutput.videos || []), ...(nodeOutput.gifs || []), ...(nodeOutput.images || [])];
      if (candidates.length > 0) {
        // Ưu tiên file mp4
        const video = candidates.find(f => f.filename.endsWith('.mp4')) || candidates[0];
        foundVideoInfo = video;
        break;
      }
    }
    
    if (!foundVideoInfo) {
      throw new Error('ComfyUI chạy xong nhưng không tìm thấy file output nào.');
    }
    
    const videoBlob = await downloadComfyVideo(foundVideoInfo.filename, foundVideoInfo.type, foundVideoInfo.subfolder);
    
    // Chuyển video thẳng vào Video tab
    const videoFile = new File([videoBlob], foundVideoInfo.filename, { type: 'video/mp4' });
    loadFile(videoFile); // Hàm loadFile sẽ tự động switch sang Video Tab
    
    updateProgress(100, 'Tạo Video AI thành công!');
    showToast('Video đã được tạo. Bạn có thể Convert sang GIF ngay!', 'success');
    
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  } finally {
    aiGenerateBtn.disabled = false;
    setTimeout(() => {
      progressSection.classList.add('hidden');
    }, 5000);
  }
});

*/
// ─── Animated Particles ───────────────────────────────────────────────────────
(function() {
  const c = document.getElementById('bgParticles');
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    const sz = Math.random() * 3 + 1;
    Object.assign(p.style, {
      position:'absolute', width:sz+'px', height:sz+'px', borderRadius:'50%',
      background:`hsl(${Math.random()>.5?270:330},70%,60%)`,
      opacity:(Math.random()*.3+.05).toFixed(2),
      left:(Math.random()*100)+'%', top:(Math.random()*100)+'%',
      animation:`float ${Math.random()*15+10}s ease-in-out infinite`,
      animationDelay:`${-Math.random()*15}s`,
    });
    c.appendChild(p);
  }
})();
