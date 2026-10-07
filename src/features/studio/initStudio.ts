import { makeZip } from '../../utils/zip';
import { chooseGifTransparencyKey, applyGifTransparencyKey } from '../gif/transparency';
import { I18N, LANGS } from '../../locales/messages';
import { removeBackground } from '../background/removeBackground';
import { trimVideo, joinVideos, type VideoExportOptions } from '../video/editVideo';

export function initStudio(): void {
const el = (id: string): any => document.getElementById(id);
const q = (selector: string): any => document.querySelector(selector);
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
let customSeeds   = [];     // Tọa độ click thủ công để xóa nền lọt thỏm

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const fileInput         = el('fileInput');
const dropZone          = el('dropZone');
const uploadSection     = el('uploadSection');
const workspace         = el('workspace');
const originalImg       = el('originalImg');
const originalMeta      = el('originalMeta');
const resultImg         = el('resultImg');
const resultMeta        = el('resultMeta');
const placeholderResult = el('placeholderResult');
const bgColorInput      = el('bgColor');
const colorValue        = el('colorValue');
const toleranceSlider   = el('toleranceSlider');
const toleranceVal      = el('toleranceVal');
const featherSlider     = el('featherSlider');
const featherVal        = el('featherVal');
const speedSlider       = el('speedSlider');
const speedVal          = el('speedVal');
const compressSlider    = el('compressSlider');
const compressVal       = el('compressVal');
const compressHint      = el('compressHint');
const processBtn        = el('processBtn');
const resetBtn          = el('resetBtn');
const downloadBtn       = el('downloadBtn');
const progressSection   = el('progressSection');
const progressLabel     = el('progressLabel');
const progressPct       = el('progressPct');
const progressFill      = el('progressFill');
const frameInfo         = el('frameInfo');
const downloadSection   = el('downloadSection');
const successBadgeText  = el('successBadgeText');
const processBtnText    = el('processBtnText');
const downloadBtnText   = el('downloadBtnText');
const resultVideo       = el('resultVideo');
let mutedVideoBlobUrl   = null;
const eyedropBtn        = el('eyedropBtn');
const eyedropHint       = el('eyedropHint');
const eyedropCanvas     = el('eyedropCanvas');
const manualSeedHint   = el('manualSeedHint');
const previewRow        = el('previewRow');
const controlsPanel     = el('controlsPanel');

// ─── Animation & Tabs DOM refs ────────────────────────────────────────────────
const tabsContainer     = el('tabsContainer');
const tabBgRemove       = el('tabBgRemove');
const tabFrameEditor    = el('tabFrameEditor');

// ─── Frame Editor DOM refs ────────────────────────────────────────────────────
const frameEditorSection    = el('frameEditorSection');
const frameEditorIndexBadge = el('frameEditorIndexBadge');
const frameEditorDelayBadge = el('frameEditorDelayBadge');
const frameDelayInput = el('frameDelayInput');
const frameWandControls     = el('frameWandControls');
const frameTolerance        = el('frameTolerance');
const frameToleranceVal     = el('frameToleranceVal');
const frameEraserControls   = el('frameEraserControls');
const frameBrushSize        = el('frameBrushSize');
const frameBrushSizeVal     = el('frameBrushSizeVal');
const frameUndoBtn          = el('frameUndoBtn');
const frameApplyAllBtn      = el('frameApplyAllBtn');
const frameResetBtn         = el('frameResetBtn');
const frameDeleteBtn        = el('frameDeleteBtn');
const frameRestoreBtn       = el('frameRestoreBtn');
const frameEditorWrap       = el('frameEditorWrap');
const frameEditorCanvas     = el('frameEditorCanvas');
const framePrevBtn          = el('framePrevBtn');
const frameNextBtn          = el('frameNextBtn');
const frameCounterNav       = el('frameCounterNav');
const frameFilmstrip        = el('frameFilmstrip');
const frameFilmstripCount   = el('frameFilmstripCount');
const frameChooseAnotherBtn = el('frameChooseAnotherBtn');
const frameEditorExportBtn  = el('frameEditorExportBtn');
const frameZoomOutBtn       = el('frameZoomOutBtn');
const frameZoomInBtn        = el('frameZoomInBtn');
const frameZoomVal          = el('frameZoomVal');

let gifFrames = [];
let deletedFramesStack = [];
let activeFrameIndex = 0;
let currentFrameTool = 'wand';
let isErasingOnFrame = false;
let lastWandPoint = null;
let lastProcessedFrames = null;
let currentZoom: string | number = 'fit'; // 'fit' or number
let zoomNumeric = 1;
let isSpacePressed = false;
let isPanning = false;
let panStartX = 0, panStartY = 0, scrollStartX = 0, scrollStartY = 0;

// ─── Image to GIF DOM refs ─────────────────────────────────────────────
const tabImgToGif       = el('tabImgToGif');
const imgToGifControls  = el('imgToGifControls');
const img2gifModeOriginalBtn = el('img2gifModeOriginal');
const img2gifModeMultiBtn = el('img2gifModeMulti');
const img2gifOriginalMode = el('img2gifOriginalMode');
const img2gifMultiMode   = el('img2gifMultiMode');
const img2gifOriginalThumb = el('img2gifOriginalThumb');
const img2gifOriginalName  = el('img2gifOriginalName');
const img2gifOriginalDims  = el('img2gifOriginalDims');
const img2gifOriginalPreviewCard = el('img2gifOriginalPreviewCard');
const img2gifNoOriginal    = el('img2gifNoOriginal');
let img2gifCurrentMode = 'original';
const img2gifFileInput  = el('img2gifFileInput');
const img2gifDropZone   = el('img2gifDropZone');
const img2gifThumbList  = el('img2gifThumbList');
const img2gifDelaySlider= el('img2gifDelaySlider');
const img2gifDelayVal   = el('img2gifDelayVal');
const img2gifClearBtn   = el('img2gifClearBtn');
const img2gifChooseAnotherBtn = el('img2gifChooseAnotherBtn');
const img2gifConvertBtn = el('img2gifConvertBtn');
const img2gifCanvas     = el('img2gifCanvas');
const img2gifCustomSizeWrap = el('img2gifCustomSizeWrap');
let img2gifImages = []; // Array of {file, dataUrl, img}

// ─── Video to GIF DOM refs ────────────────────────────────────────────────────
const tabVideoToGif       = el('tabVideoToGif');
const videoToGifControls  = el('videoToGifControls');
const tabEditVideo        = el('tabEditVideo');
const editVideoControls   = el('editVideoControls');
const tabMuteVideo        = el('tabMuteVideo');
const muteVideoControls   = el('muteVideoControls');
const videoToGifFileName  = el('videoToGifFileName');
const videoToGifFps       = el('videoToGifFps');
const videoToGifFpsVal    = el('videoToGifFpsVal');
const videoToGifLoop      = el('videoToGifLoop');
const videoToGifConvertBtn = el('videoToGifConvertBtn');
const videoChooseAnotherBtn = el('videoChooseAnotherBtn');
const videoToGifCanvas    = el('videoToGifCanvas');
const videoPlayer         = el('videoPlayer');
const originalWrap        = el('originalWrap');
const videoToGifCustomRange = el('videoToGifCustomRange');
const videoToGifStartTime   = el('videoToGifStartTime');
const videoToGifEndTime     = el('videoToGifEndTime');
const videoToGifEstimate    = el('videoToGifEstimate');
let videoToGifFile = null;
let videoToGifUrl = null;
let editedVideoBlobUrl = null;
let editedVideoName = '';
let editVideoClips: File[] = [];
let editVideoMode: 'trim' | 'join' = 'trim';

const bgControls        = el('bgControls');
const mainActions       = el('mainActions');
let currentTab = 'bgRemove';
let transformSource = { width: 0, height: 0 };
let activeJob = null;
let batchFiles = [];
let staticResultType = 'image/png';

// ─── i18n ─────────────────────────────────────────────────────────────────────
let currentLang = (function() {
  try { return localStorage.getItem('mediastudio_lang') || 'en'; } catch(e) { return 'en'; }
})();

function t(key, params?) {
  var dict = I18N[currentLang] || I18N.en;
  var str = (dict[key] !== undefined) ? dict[key] : ((I18N.en[key] !== undefined) ? I18N.en[key] : key);
  if (typeof str === 'string' && params) {
    Object.keys(params).forEach(function(k) { str = str.split('{' + k + '}').join(String(params[k])); });
  }
  return str;
}

function applyI18nToDOM() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var val = t(el.getAttribute('data-i18n'));
    if (val) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
    var val = t(el.getAttribute('data-i18n-html'));
    if (val) el.innerHTML = val;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
    var val = t(el.getAttribute('data-i18n-title'));
    if (val) el.setAttribute('title', val);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var val = t(el.getAttribute('data-i18n-placeholder'));
    if (val) el.setAttribute('placeholder', val);
  });
}

function setLanguage(lang) {
  if (!I18N[lang]) lang = 'en';
  currentLang = lang;
  try { localStorage.setItem('mediastudio_lang', lang); } catch(e) {}

  var info = LANGS[lang] || LANGS.en;
  var flagEl = el('langPickerFlag');
  var nameEl = el('langPickerName');
  if (flagEl) {
    flagEl.src = info.flag;
    flagEl.srcset = info.flag2x + ' 2x';
    flagEl.alt = info.name;
  }
  if (nameEl) nameEl.textContent = info.name;
  document.querySelectorAll('.lang-option').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  applyI18nToDOM();
  setEditVideoMode(editVideoMode);
  renderEditVideoClips();
  updateEditTrimSummary();
  renderEditTimeline();

  // Dynamic compress labels
  try {
    var lv = parseInt(compressSlider.value) || 0;
    var labels = (I18N[currentLang] || I18N.en).compressLabels[lv];
    if (labels) { compressVal.textContent = labels[0]; compressHint.textContent = labels[1]; }
  } catch(e) {}

  // Update placeholder
  try {
    if (placeholderResult && resultImg.classList.contains('hidden') && resultVideo.classList.contains('hidden')) {
      var phMap = { bgRemove:'placeholderBgRemove', imgToGif:'placeholderImgToGif', videoToGif:'placeholderVideoToGif', editVideo:'placeholderEditVideo', muteVideo:'placeholderMuteVideo' };
      var phKey = phMap[currentTab] || 'placeholderBgRemove';
      placeholderResult.innerHTML = '<p>' + t(phKey) + '</p>';
    }
  } catch(e) {}

  // Update dynamic btn texts
  try {
    if (currentFile) {
      if (isStaticImage && processBtnText) processBtnText.textContent = t('processBtnTextImg');
      else if (currentFile.type === 'image/gif' && processBtnText) processBtnText.textContent = t('processBtnTextGif');
    }
    if (currentTab === 'videoToGif') updateVideoToGifEstimate();
    if (currentTab === 'frameEditor' && gifFrames && gifFrames.length > 0) {
      if (frameFilmstripCount) frameFilmstripCount.textContent = gifFrames.length + ' ' + t('framesCount');
      if (currentZoom === 'fit' && frameZoomVal) {
        frameZoomVal.textContent = Math.round(zoomNumeric * 100) + '% (' + t('frameZoomFit') + ')';
      }
    }
  } catch(e) {}
}

// ─── Language Picker Dropdown ─────────────────────────────────────────────────
(function initLangPicker() {
  var wrap = el('langPickerWrap');
  var trigger = el('langPickerTrigger');
  var dropdown = el('langDropdown');
  if (!wrap || !trigger || !dropdown) return;

  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = wrap.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  dropdown.querySelectorAll('.lang-option').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      setLanguage(btn.getAttribute('data-lang'));
      wrap.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', function() {
    wrap.classList.remove('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      wrap.classList.remove('open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }
  });
})();



// ─── Tab Switching ────────────────────────────────────────────────────────────
function setTransformSource(width, height) {
  transformSource = { width, height };
}

function getTransform() {
  const { width, height } = transformSource;
  if (!width || !height) return null;
  return { x: 0, y: 0, w: width, h: height, outW: width, outH: height };
}

function switchTab(tab) {
  if (activeJob && currentTab !== tab) cancelProcessing(true);
  currentTab = tab;
  syncJoinPreviewVisibility();
  [tabBgRemove, tabFrameEditor, tabImgToGif, tabVideoToGif, tabEditVideo, tabMuteVideo].forEach(t => t.classList.remove('active'));
  [bgControls, imgToGifControls, videoToGifControls, editVideoControls, muteVideoControls].forEach(c => c.classList.add('hidden'));
  
  const isEditor = (tab === 'frameEditor');
  if (frameEditorSection) frameEditorSection.classList.toggle('hidden', !isEditor);
  if (previewRow) previewRow.style.display = isEditor ? 'none' : '';
  if (controlsPanel) controlsPanel.style.display = isEditor ? 'none' : '';
  q('.app-wrapper')?.classList.toggle('frame-editor-mode', isEditor);

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
      originalWrap.title = t('originalWrapTitle');
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
      if (successBadgeText) successBadgeText.textContent = t('successMuted');
      downloadBtnText.textContent = t('downloadMutedVideo');
      downloadSection.classList.remove('hidden');
    } else {
      resultVideo.classList.add('hidden');
      resultImg.classList.add('hidden');
      if (placeholderResult) {
        placeholderResult.innerHTML = `<p>${t('placeholderMuteVideo')}</p>`;
        placeholderResult.style.display = '';
      }
      downloadSection.classList.add('hidden');
    }
  } else if (tab === 'editVideo') {
    tabEditVideo.classList.add('active');
    editVideoControls.classList.remove('hidden');
    uploadSection.classList.add('hidden');
    workspace.classList.remove('hidden');
    renderEditVideoClips();
    updateEditTrimSummary();
    renderEditTimeline();
    renderJoinRuler();
    if (editedVideoBlobUrl) {
      resultVideo.src = editedVideoBlobUrl;
      resultVideo.classList.remove('hidden');
      resultImg.classList.add('hidden');
      if (placeholderResult) placeholderResult.style.display = 'none';
      if (successBadgeText) successBadgeText.textContent = t('editSuccessBadge');
      downloadBtnText.textContent = t('editDownload');
      downloadSection.classList.remove('hidden');
    } else {
      resultVideo.classList.add('hidden');
      resultImg.classList.add('hidden');
      if (placeholderResult) {
        placeholderResult.innerHTML = `<p>${t('placeholderEditVideo')}</p>`;
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
      if (successBadgeText) successBadgeText.textContent = t('successVideoToGif');
      downloadBtnText.textContent = t('downloadGif');
      downloadSection.classList.remove('hidden');
    } else {
      resultImg.classList.add('hidden');
      if (placeholderResult) {
        placeholderResult.innerHTML = `<p>${t('placeholderVideoToGif')}</p>`;
        placeholderResult.style.display = '';
      }
      downloadSection.classList.add('hidden');
    }
  } else {
    resultVideo.classList.add('hidden');
    if (tab === 'bgRemove') {
      tabBgRemove.classList.add('active');
      bgControls.classList.remove('hidden');
      if (placeholderResult) placeholderResult.innerHTML = `<p>${t('placeholderBgRemove')}</p>`;
    } else if (tab === 'imgToGif') {
      tabImgToGif.classList.add('active');
      imgToGifControls.classList.remove('hidden');
      if (placeholderResult) placeholderResult.innerHTML = `<p>${t('placeholderImgToGif')}</p>`;
      updateImg2gifOriginalPreview();
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
  tabImgToGif.style.display = (!isVideo && !isGif) ? '' : 'none';
  tabVideoToGif.style.display = isVideo ? '' : 'none';
  tabEditVideo.style.display = isVideo ? '' : 'none';
  tabMuteVideo.style.display = isVideo ? '' : 'none';
  el('staticFormatGroup').classList.toggle('hidden', fileType !== 'image');
  el('batchActions').classList.toggle('hidden', fileType !== 'image' || batchFiles.length < 2);
}
tabBgRemove.addEventListener('click', () => switchTab('bgRemove'));
tabFrameEditor.addEventListener('click', () => switchTab('frameEditor'));
tabImgToGif.addEventListener('click', () => switchTab('imgToGif'));
tabVideoToGif.addEventListener('click', () => switchTab('videoToGif'));
tabEditVideo.addEventListener('click', () => switchTab('editVideo'));
tabMuteVideo.addEventListener('click', () => switchTab('muteVideo'));
videoChooseAnotherBtn.addEventListener('click', resetAll);
if (frameChooseAnotherBtn) frameChooseAnotherBtn.addEventListener('click', resetAll);
if (img2gifChooseAnotherBtn) img2gifChooseAnotherBtn.addEventListener('click', resetAll);

// ─── Drag & Drop ──────────────────────────────────────────────────────────────
['dragenter','dragover'].forEach(evt =>
  dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.add('drag-over'); })
);
['dragleave','drop'].forEach(evt =>
  dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.remove('drag-over'); })
);
function handleUpload(files: FileList) {
  const selected = Array.from(files);
  if (!selected.length) return;
  if (selected.length > 1) {
    if (!selected.every(file => /^image\/(png|jpeg|webp|bmp)$/.test(file.type))) {
      showToast(currentLang === 'vi'
        ? 'Chỉ chọn nhiều ảnh PNG, JPEG, WebP hoặc BMP.'
        : 'Select only PNG, JPEG, WebP, or BMP images together.', 'error');
      return;
    }
    batchFiles = selected;
    loadFile(selected[0], true);
    el('batchCount').textContent = `${selected.length} ${currentLang === 'vi' ? 'ảnh' : 'images'}`;
    return;
  }
  const file = selected[0];
  if (file.type.startsWith('image/') || file.type.startsWith('video/')) loadFile(file);
  else showToast(t('toastSelectValidFile'), 'error');
}
dropZone.addEventListener('drop', e => handleUpload(e.dataTransfer.files));
fileInput.addEventListener('change', () => {
  handleUpload(fileInput.files);
  fileInput.value = '';
});

// ─── Controls ─────────────────────────────────────────────────────────────────
bgColorInput.addEventListener('input', () => { colorValue.textContent = bgColorInput.value; });
toleranceSlider.addEventListener('input', () => { toleranceVal.textContent = toleranceSlider.value; });
featherSlider.addEventListener('input', () => { featherVal.textContent = featherSlider.value; });
speedSlider.addEventListener('input', () => { speedVal.textContent = parseFloat(speedSlider.value).toFixed(2); });

// ─── Image to GIF Mode Switcher ─────────────────────────────────────────────
function switchImg2gifMode(mode) {
  img2gifCurrentMode = mode;
  // Update tab buttons
  img2gifModeOriginalBtn?.classList.toggle('active', mode === 'original');
  img2gifModeMultiBtn?.classList.toggle('active', mode === 'multi');
  // Show/hide panels
  if (img2gifOriginalMode) img2gifOriginalMode.classList.toggle('hidden', mode !== 'original');
  if (img2gifMultiMode)    img2gifMultiMode.classList.toggle('hidden', mode !== 'multi');
  // Show/hide clear btn
  const clearBtn = el('img2gifClearBtn');
  if (clearBtn) clearBtn.style.display = mode === 'multi' ? '' : 'none';
}

function updateImg2gifOriginalPreview() {
  if (!img2gifOriginalThumb) return;
  const srcImg = (resultImg && resultImg.src && resultImg.src.startsWith('blob:') && !resultImg.classList.contains('hidden')) 
    ? resultImg 
    : staticImgObj;
  if (isStaticImage && srcImg) {
    img2gifOriginalPreviewCard?.classList.remove('hidden');
    img2gifNoOriginal?.classList.add('hidden');
    img2gifOriginalThumb.src = srcImg.src;
    if (img2gifOriginalName && currentFile) img2gifOriginalName.textContent = currentFile.name;
    if (img2gifOriginalDims) {
      const w = srcImg.naturalWidth || srcImg.width || 0;
      const h = srcImg.naturalHeight || srcImg.height || 0;
      img2gifOriginalDims.textContent = `${w} × ${h} px`;
    }
  } else {
    img2gifOriginalPreviewCard?.classList.add('hidden');
    img2gifNoOriginal?.classList.remove('hidden');
    if (img2gifOriginalThumb) img2gifOriginalThumb.src = '';
  }
}

img2gifModeOriginalBtn?.addEventListener('click', () => switchImg2gifMode('original'));
img2gifModeMultiBtn?.addEventListener('click', () => switchImg2gifMode('multi'));

// Initialize
switchImg2gifMode('original');

img2gifDelaySlider.addEventListener('input', () => { img2gifDelayVal.textContent = img2gifDelaySlider.value; });
function updateVideoToGifEstimate() {
  if (!videoPlayer || !Number.isFinite(videoPlayer.duration) || videoPlayer.duration <= 0) return;
  const fps = Number(videoToGifFps.value) || 10;
  let start = 0;
  let end = videoPlayer.duration;
  
  const mode = q('input[name="videoToGifDurationMode"]:checked')?.value || 'all';
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
  
  const sizeVal = q('input[name="videoToGifSize"]:checked')?.value || 'original';
  let scale = 1;
  if (sizeVal === '2') scale = 2;
  else if (sizeVal === '4') scale = 4;
  else if (sizeVal === '0.5') scale = 0.5;
  else if (sizeVal === '0.3') scale = 0.3;
  
  const crop = getTransform() || { outW: videoPlayer.videoWidth, outH: videoPlayer.videoHeight };
  const w = Math.round(crop.outW * scale);
  const h = Math.round(crop.outH * scale);
  
  // Approximate GIF size: ~0.4 bytes per pixel per frame on average
  const estBytes = frames * (w * h * 0.42);
  
  if (videoToGifEstimate) {
    videoToGifEstimate.textContent = t('videoEstimate', { frames, w, h, size: formatBytes(estBytes) });
  }
}

videoToGifFps.addEventListener('input', () => {
  videoToGifFpsVal.textContent = videoToGifFps.value;
  updateVideoToGifEstimate();
});
el('videoToGifEnhance')?.addEventListener('change', updateVideoToGifEstimate);
document.querySelectorAll('input[name="videoToGifSize"]').forEach(r => {
  r.addEventListener('change', updateVideoToGifEstimate);
});
document.querySelectorAll('input[name="videoToGifDurationMode"]').forEach(r => {
  r.addEventListener('change', e => {
    if ((e.target as HTMLInputElement).value === 'custom') {
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
    showToast(t('toastSeedAdded'), 'success');
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
  showToast(t('toastColorSelected', { hex }), 'success');
});

// ─── Load File ────────────────────────────────────────────────────────────────
function loadFile(file, preserveBatch = false) {
  if (!preserveBatch) batchFiles = [];
  if (activeJob) cancelProcessing(true);
  gifFrames = [];
  deletedFramesStack = [];
  lastProcessedFrames = null;
  activeFrameIndex = 0;
  setTransformSource(0, 0);
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
    processBtnText.textContent = t('processBtnTextImg');
    processBtn.disabled = false;
    downloadBtnText.textContent = t('downloadImage');
    loadStaticImage(file, objectUrl);
    return;
  }

  processBtnText.textContent = t('processBtnTextGif');
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
      setTransformSource(superGif.get_canvas().width, superGif.get_canvas().height);
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
    showToast(t('toastErrorGif', { err: err.message }), 'error');
    processBtn.disabled = false;
  }
}

function loadStaticImage(file, objectUrl) {
  const img = new Image();
  img.onload = () => {
    staticImgObj = img;
    setTransformSource(img.naturalWidth, img.naturalHeight);
  updateImg2gifOriginalPreview();
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
    showToast(t('toastLoadedImage'), 'success');
  };
  img.onerror = () => {
    showToast(t('toastErrorImage'), 'error');
    progressSection.classList.add('hidden');
  };
  img.src = objectUrl;
}

function autoDetectBgColor(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const counts: Record<string, number> = {};

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
  const job = beginJob();

  const tolerance = parseInt(toleranceSlider.value);
  const feather   = parseInt(featherSlider.value);
  const [r0, g0, b0] = hexToRgb(bgColorInput.value);
  
  processBtn.disabled = true;
  downloadSection.classList.add('hidden');
  progressSection.classList.remove('hidden');
  updateProgress(50, 'Đang xử lý ảnh...');

  // Dùng setTimeout để UI kịp update
  setTimeout(() => {
    if (job.cancelled) return;
    const W = staticImgObj.naturalWidth;
    const H = staticImgObj.naturalHeight;
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = W;
    tmpCanvas.height = H;
    const ctx = tmpCanvas.getContext('2d', { willReadFrequently: true });
    
    ctx.drawImage(staticImgObj, 0, 0);
    const imgData = ctx.getImageData(0, 0, W, H);
    
    removeBackground(imgData.data, r0, g0, b0, tolerance, feather, W, H, customSeeds);
    
    ctx.putImageData(imgData, 0, 0);
    
    const crop = getTransform() || { x: 0, y: 0, w: W, h: H, outW: W, outH: H };
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = crop.outW;
    outputCanvas.height = crop.outH;
    const outputCtx = outputCanvas.getContext('2d');
    const requestedType = el('staticExportFormat').value;
    if (requestedType === 'image/jpeg') {
      outputCtx.fillStyle = '#ffffff';
      outputCtx.fillRect(0, 0, crop.outW, crop.outH);
    }
    outputCtx.drawImage(tmpCanvas, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.outW, crop.outH);

    outputCanvas.toBlob(blob => {
      if (job.cancelled) return;
      if (!blob) { finishJob(job); progressSection.classList.add('hidden'); processBtn.disabled = false; showToast('Image export failed', 'error'); return; }
      finishJob(job);
      staticResultType = blob.type || 'image/png';
      const formatFallback = staticResultType !== requestedType;
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
      resultBlobUrl = URL.createObjectURL(blob);
      resultImg.src = resultBlobUrl;
      
      placeholderResult.style.display = 'none';
      resultImg.classList.remove('hidden');
      resultMeta.textContent = `${t('previewResult')} · ${formatBytes(blob.size)}`;
      
      progressSection.classList.add('hidden');
      if (successBadgeText) successBadgeText.textContent = 'Xóa nền thành công!';
      downloadBtnText.textContent = 'Tải xuống Ảnh';
      downloadSection.classList.remove('hidden');
      processBtn.disabled = false;
      showToast(formatFallback
        ? (currentLang === 'vi' ? 'Trình duyệt không hỗ trợ định dạng đã chọn; đã xuất PNG.' : 'Selected format is unsupported; exported PNG.')
        : t('toastBgRemoved'), formatFallback ? 'info' : 'success');
    }, requestedType, requestedType === 'image/png' ? undefined : 0.9);
  }, 50);
}

// ─── Image to GIF Feature ───────────────────────────────────────────────────

// Img2gif: Drag & drop on the mini drop zone
['dragenter','dragover'].forEach(evt =>
  img2gifDropZone.addEventListener(evt, e => { e.preventDefault(); img2gifDropZone.classList.add('drag-over'); })
);
['dragleave','drop'].forEach(evt =>
  img2gifDropZone.addEventListener(evt, e => { e.preventDefault(); img2gifDropZone.classList.remove('drag-over'); })
);
img2gifDropZone.addEventListener('drop', e => {
  const files = Array.from(e.dataTransfer.files as FileList).filter(f => f.type.startsWith('image/'));
  if (files.length) addImg2gifFiles(files);
  else showToast(t('toastDropImagesOnly'), 'error');
});
img2gifFileInput.addEventListener('change', () => {
  const files = Array.from(img2gifFileInput.files);
  if (files.length) addImg2gifFiles(files);
  img2gifFileInput.value = '';
});

// Size radio toggle
document.querySelectorAll('input[name="img2gifSize"]').forEach(r => {
  r.addEventListener('change', () => {
    img2gifCustomSizeWrap.style.display = (r as HTMLInputElement).value === 'custom' ? 'flex' : 'none';
  });
});

function addImg2gifFiles(files) {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = String(ev.target.result);
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
    wrap.dataset.idx = String(idx);
    wrap.innerHTML = `
      <img src="${item.dataUrl}" alt="frame ${idx+1}" />
      <span class="img2gif-thumb-num">${idx + 1}</span>
      <button class="img2gif-thumb-del" data-idx="${idx}" title="Xóa">×</button>
    `;
    // Drag-to-reorder
    wrap.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', String(idx)); wrap.classList.add('dragging'); });
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
  img2gifDropZone.querySelector('p:first-of-type').textContent = t('img2gifDropTitle');
});

img2gifConvertBtn.addEventListener('click', async () => {
  // Determine image list based on current mode
  let imagesToProcess = [];
  
  if (img2gifCurrentMode === 'original') {
    // Mode 1: Use the original (or processed) static image
    const srcImg = (resultImg.src.startsWith('blob:') && !resultImg.classList.contains('hidden')) ? resultImg : staticImgObj;
    if (!isStaticImage || !srcImg) {
      showToast(t('img2gifNoOriginalHint'), 'error');
      return;
    }
    imagesToProcess = [{ img: srcImg }];
  } else {
    // Mode 2: Use manually uploaded images
    if (img2gifImages.length < 2) {
      showToast(t('toastAtLeastTwoImages'), 'error');
      return;
    }
    imagesToProcess = img2gifImages;
  }
  
  const delay = parseInt(img2gifDelaySlider.value);
  const sizeOpt = q('input[name="img2gifSize"]:checked').value;
  const quality = parseInt(q('input[name="img2gifQuality"]:checked').value);
  const loop = el('img2gifLoop').checked ? 0 : -1;
  
  // Determine output dimensions
  const firstImg = imagesToProcess[0].img;
  let outW, outH;
  if (sizeOpt === 'original') {
    outW = firstImg.naturalWidth;
    outH = firstImg.naturalHeight;
  } else if (sizeOpt === 'custom') {
    outW = parseInt(el('img2gifCustomW').value) || firstImg.naturalWidth;
    outH = parseInt(el('img2gifCustomH').value) || firstImg.naturalHeight;
  } else {
    const scale = parseFloat(sizeOpt);
    outW = Math.round(firstImg.naturalWidth * scale);
    outH = Math.round(firstImg.naturalHeight * scale);
  }
  
  const job = beginJob();
  img2gifConvertBtn.disabled = true;
  progressSection.classList.remove('hidden');
  downloadSection.classList.add('hidden');
  updateProgress(0, 'Đang chuẩn bị...');
  
  let workerBlobUrl = null;
  try {
    const resp = await fetch('/vendor/gif.worker.js');
    const wBlob = await resp.blob();
    workerBlobUrl = URL.createObjectURL(wBlob);
  } catch (e) {
    console.warn('Không tải được worker:', e);
  }
  if (job.cancelled) { if (workerBlobUrl) URL.revokeObjectURL(workerBlobUrl); return; }
  
  const gifOpts: any = {
    workers: workerBlobUrl ? 4 : 0,
    quality,
    width: outW,
    height: outH,
    repeat: loop
  };
  if (workerBlobUrl) gifOpts.workerScript = workerBlobUrl;
  const gif = new window.GIF(gifOpts);
  job.gif = gif;
  job.cleanup = () => { if (workerBlobUrl) URL.revokeObjectURL(workerBlobUrl); };
  
  img2gifCanvas.width = outW;
  img2gifCanvas.height = outH;
  const ctx = img2gifCanvas.getContext('2d');
  
  for (let i = 0; i < imagesToProcess.length; i++) {
    if (job.cancelled) return;
    updateProgress(Math.round((i / imagesToProcess.length) * 70), `Đang xử lý ảnh ${i+1}/${imagesToProcess.length}`);
    ctx.clearRect(0, 0, outW, outH);
    ctx.drawImage(imagesToProcess[i].img, 0, 0, outW, outH);
    gif.addFrame(ctx, { copy: true, delay });
    await sleep(5);
  }
  
  gif.on('progress', p => updateProgress(70 + Math.round(p * 29), 'Đang mã hóa GIF...'));
  
  gif.on('finished', blob => {
    if (job.cancelled) return;
    finishJob(job);
    if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    resultBlobUrl = URL.createObjectURL(blob);
    
    // Show in the main result area
    resultImg.src = resultBlobUrl;
    resultImg.classList.remove('hidden');
    placeholderResult.style.display = 'none';
    resultMeta.textContent = `GIF · ${imagesToProcess.length} ảnh · ${formatBytes(blob.size)}`;
    
    updateProgress(100, 'Hoàn tất!');
    progressSection.classList.add('hidden');
    if (successBadgeText) successBadgeText.textContent = t('successImgToGif');
    downloadSection.classList.remove('hidden');
    downloadBtnText.textContent = 'Tải xuống GIF';
  img2gifConvertBtn.disabled = false;
  showToast(t('toastGifCreated'), 'success');
  });
  
  gif.on('error', err => {
    if (job.cancelled) return;
    finishJob(job);
    console.error(err);
    if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }
    progressSection.classList.add('hidden');
    img2gifConvertBtn.disabled = false;
    showToast(t('toastErrorCreateGif', { err: err?.message || err }), 'error');
  });
  
  if (!job.cancelled) gif.render();
});

// ─── Video to GIF Feature ────────────────────────────────────────────────────
async function getGifWorkerUrl() {
  try {
    const response = await fetch('/vendor/gif.worker.js');
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
  resetJoinPreview();
  const loadToken = ++timelineLoadToken;
  currentFile = file;
  editVideoClips = [file];
  editClipRanges.clear();
  editUndoStack.length = 0;
  editRedoStack.length = 0;
  updateEditHistoryButtons();
  editStartTime.value = '0';
  if (editedVideoBlobUrl) URL.revokeObjectURL(editedVideoBlobUrl);
  editedVideoBlobUrl = null;
  editedVideoName = '';
  renderEditVideoClips();
  videoToGifUrl = URL.createObjectURL(file);
  videoPlayer.src = videoToGifUrl;
  videoToGifFileName.textContent = `${file.name} · ${t('readingVideo')}`;
  videoToGifConvertBtn.disabled = true;
  videoPlayer.onloadedmetadata = () => {
    setTransformSource(videoPlayer.videoWidth, videoPlayer.videoHeight);
    videoToGifFileName.textContent = `${file.name} · ${videoPlayer.videoWidth}×${videoPlayer.videoHeight} · ${videoPlayer.duration.toFixed(1)} giây`;
    originalMeta.textContent = `${file.name} · ${formatBytes(file.size)} · ${videoPlayer.videoWidth}×${videoPlayer.videoHeight} · ${videoPlayer.duration.toFixed(1)} giây`;
    if (videoToGifStartTime) videoToGifStartTime.value = '0';
    if (videoToGifEndTime) {
      videoToGifEndTime.value = Math.min(videoPlayer.duration, 3).toFixed(1);
      videoToGifEndTime.max = videoPlayer.duration.toFixed(1);
    }
    videoToGifConvertBtn.disabled = false;
    el('editVideoBtn').disabled = false;
    el('editVideoFileName').textContent = `${file.name} · ${formatBytes(file.size)} · ${videoPlayer.duration.toFixed(1)} ${t('secondsUnit')}`;
    el('editEndTime').value = videoPlayer.duration.toFixed(1);
    el('editEndTime').max = videoPlayer.duration.toFixed(1);
    el('editStartTime').max = videoPlayer.duration.toFixed(1);
    updateEditTrimSummary();
    renderEditTimeline();
    loadTimelineMedia(file, 8).then(() => {
      if (timelineLoadToken !== loadToken || videoToGifFile !== file) return;
      renderEditTimeline();
      renderEditVideoClips();
    }).catch(() => {});
    updateMuteTab();
    updateVideoToGifEstimate();
    showToast(t('toastLoadedVideo'), 'success');
  };
  videoPlayer.onerror = () => {
    videoToGifFileName.textContent = 'Không thể đọc video này';
    videoToGifConvertBtn.disabled = true;
    el('editVideoBtn').disabled = true;
    showToast('Trình duyệt không hỗ trợ định dạng video này.', 'error');
  };
}

function waitForVideoEvent(eventName) {
  return new Promise<void>((resolve, reject) => {
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

function applySharpen(ctx, width, height, amount = 0.4) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const src = imgData.data;
    const output = ctx.createImageData(width, height);
    const dst = output.data;
    const a = amount;
    const centerWeight = 1 + 4 * a;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        dst[idx + 3] = src[idx + 3];

        for (let c = 0; c < 3; c++) {
          const cur = src[idx + c];
          const up    = (y > 0) ? src[((y - 1) * width + x) * 4 + c] : cur;
          const down  = (y < height - 1) ? src[((y + 1) * width + x) * 4 + c] : cur;
          const left  = (x > 0) ? src[(y * width + (x - 1)) * 4 + c] : cur;
          const right = (x < width - 1) ? src[(y * width + (x + 1)) * 4 + c] : cur;

          const val = cur * centerWeight - (up + down + left + right) * a;
          dst[idx + c] = Math.min(255, Math.max(0, Math.round(val)));
        }
      }
    }
    ctx.putImageData(output, 0, 0);
  } catch (e) {
    console.warn('Sharpen skipped:', e);
  }
}

const batchExportBtn = el('batchExportBtn');

batchExportBtn.addEventListener('click', async () => {
  if (batchFiles.length < 2) return;
  const job = beginJob();
  const files = [...batchFiles];
  const [r, g, b] = hexToRgb(bgColorInput.value);
  const tolerance = Number(toleranceSlider.value), feather = Number(featherSlider.value);
  const entries = [];
  batchExportBtn.disabled = true;
  progressSection.classList.remove('hidden');
  try {
    for (let i = 0; i < files.length; i++) {
      if (job.cancelled) return;
      const bitmap = await createImageBitmap(files[i]);
      if (job.cancelled) { bitmap.close(); return; }
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(bitmap, 0, 0); bitmap.close();
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      removeBackground(imageData.data, r, g, b, tolerance, feather, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG encoding failed');
      if (job.cancelled) return;
      const base = files[i].name.replace(/\.[^.]+$/, '').replace(/[\\/]/g, '_');
      entries.push({ name: `${String(i + 1).padStart(3, '0')}_${base}_no_bg.png`, data: new Uint8Array(await blob.arrayBuffer()) });
      updateProgress(Math.round((i + 1) / files.length * 90), `${i + 1}/${files.length}`);
      await sleep(0);
    }
    if (job.cancelled) return;
    const url = URL.createObjectURL(makeZip(entries));
    const link = document.createElement('a');
    link.href = url; link.download = 'backgrounds_removed.zip'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    progressSection.classList.add('hidden');
    showToast(currentLang === 'vi' ? 'Đã tạo tệp ZIP.' : 'ZIP file created.', 'success');
  } catch (err) {
    if (!job.cancelled) showToast(err.message || String(err), 'error');
    progressSection.classList.add('hidden');
  } finally {
    batchExportBtn.disabled = false;
    finishJob(job);
  }
});

videoToGifConvertBtn.addEventListener('click', async () => {
  if (!videoToGifFile || !Number.isFinite(videoPlayer.duration)) {
    showToast(t('toastSelectVideoFirst'), 'error');
    return;
  }
  const fps = Number(videoToGifFps.value) || 10;

  // Calculate start, end, and duration
  let startTime = 0;
  let endTime = videoPlayer.duration;
  const durationMode = q('input[name="videoToGifDurationMode"]:checked')?.value || 'all';
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
  if (frameCount > 1200 && !confirm(t('confirmManyFrames', { count: frameCount }))) return;

  const sizeChoice = q('input[name="videoToGifSize"]:checked')?.value || 'original';
  let scale = 1;
  if (sizeChoice === '2') scale = 2;
  else if (sizeChoice === '4') scale = 4;
  else if (sizeChoice === '0.5') scale = 0.5;
  else if (sizeChoice === '0.3') scale = 0.3;
  const enhanceEnabled = el('videoToGifEnhance')?.checked;

  const crop = getTransform() || { x: 0, y: 0, w: videoPlayer.videoWidth, h: videoPlayer.videoHeight, outW: videoPlayer.videoWidth, outH: videoPlayer.videoHeight };
  const width = Math.max(1, Math.round(crop.outW * scale));
  const height = Math.max(1, Math.round(crop.outH * scale));
  const quality = Number(q('input[name="videoToGifQuality"]:checked').value);
  const job = beginJob();
  progressSection.classList.remove('hidden');
  updateProgress(0, currentLang === 'vi' ? 'Đang chuẩn bị...' : 'Preparing...');
  const workerUrl = await getGifWorkerUrl();
  if (job.cancelled) { if (workerUrl) URL.revokeObjectURL(workerUrl); return; }
  job.cleanup = () => { if (workerUrl) URL.revokeObjectURL(workerUrl); };
  const opts: any = { workers: workerUrl ? 2 : 0, quality, width, height, repeat: videoToGifLoop.checked ? 0 : -1 };
  if (workerUrl) opts.workerScript = workerUrl;
  const gif = new window.GIF(opts);
  job.gif = gif;
  const ctx = videoToGifCanvas.getContext('2d', { alpha: false });
  videoToGifCanvas.width = width;
  videoToGifCanvas.height = height;

  videoToGifConvertBtn.disabled = true;
  progressSection.classList.remove('hidden');
  downloadSection.classList.add('hidden');
  try {
    for (let i = 0; i < frameCount; i++) {
      if (job.cancelled) return;
      const targetTime = Math.min(startTime + (i / fps), Math.max(startTime, endTime - 0.001));
      await seekVideo(targetTime);
      if (job.cancelled) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(videoPlayer, crop.x, crop.y, crop.w, crop.h, 0, 0, width, height);
      if (enhanceEnabled) {
        applySharpen(ctx, width, height, scale >= 2 ? 0.45 : 0.35);
      }
      gif.addFrame(ctx, { copy: true, delay: Math.round(1000 / fps) });
      updateProgress(Math.round(((i + 1) / frameCount) * 70), `Đang lấy khung hình ${i + 1}/${frameCount}`);
    }
    gif.on('progress', p => updateProgress(70 + Math.round(p * 30), 'Đang mã hóa GIF...'));
    gif.on('finished', blob => {
      if (job.cancelled) return;
      finishJob(job);
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
      showToast(t('toastVideoToGifSuccess'), 'success');
    });
    gif.on('error', err => {
      if (job.cancelled) return;
      finishJob(job);
      progressSection.classList.add('hidden');
      videoToGifConvertBtn.disabled = false;
      if (workerUrl) URL.revokeObjectURL(workerUrl);
      showToast(t('toastVideoToGifError', { err: err.message || err }), 'error');
    });
    if (!job.cancelled) gif.render();
  } catch (err) {
    if (job.cancelled) return;
    finishJob(job);
    console.error(err);
    progressSection.classList.add('hidden');
    videoToGifConvertBtn.disabled = false;
    if (workerUrl) URL.revokeObjectURL(workerUrl);
    showToast(t('toastVideoToGifError', { err: err.message || err }), 'error');
  }
});

// ─── Mute Video Tab ───────────────────────────────────────────────────────────
const muteVideoBtn       = el('muteVideoBtn');
const muteVideoStatus    = el('muteVideoStatus');
const muteVideoFileName  = el('muteVideoFileName');
const muteChooseAnotherBtn = el('muteChooseAnotherBtn');

let ffmpegInstance = null;
let ffmpegLoaded   = false;
let ffmpegLoading  = false;

// "Chọn file khác" in mute tab → same as videoChooseAnotherBtn (resets everything)
muteChooseAnotherBtn.addEventListener('click', resetAll);

// Called from setVideoToGifFile when video metadata is loaded
function updateMuteTab() {
  if (videoToGifFile && Number.isFinite(videoPlayer.duration) && videoPlayer.duration > 0) {
    muteVideoBtn.disabled = false;
    muteVideoFileName.textContent = `${videoToGifFile.name} · ${formatBytes(videoToGifFile.size)} · ${videoPlayer.videoWidth}×${videoPlayer.videoHeight} · ${videoPlayer.duration.toFixed(1)} ${t('secondsUnit')}`;
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
    await new Promise<void>(resolve => {
      const check = setInterval(() => { if (!ffmpegLoading) { clearInterval(check); resolve(); } }, 100);
    });
    if (!ffmpegLoaded || !ffmpegInstance) throw new Error('FFmpeg could not be loaded.');
    return ffmpegInstance;
  }
  ffmpegLoading = true;
  try {
    const { FFmpeg } = window.FFmpegWASM || {};
    const { toBlobURL } = window.FFmpegUtil || {};
    if (!FFmpeg) throw new Error('FFmpeg.wasm chưa được tải.');
    if (!toBlobURL) throw new Error('FFmpegUtil chưa được tải');

    ffmpegInstance = new FFmpeg();
    ffmpegInstance.on('log', ({ message }) => console.log('[FFmpeg]', message));
    ffmpegInstance.on('progress', ({ progress }) => {
      if (currentTab === 'editVideo') return;
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
    ffmpegInstance?.terminate();
    ffmpegInstance = null;
    ffmpegLoaded = false;
    ffmpegLoading = false;
    throw err;
  }
  return ffmpegInstance;
}

const editVideoBtn = el('editVideoBtn');
const editStartTime = el('editStartTime');
const editEndTime = el('editEndTime');
const editJoinInput = el('editJoinInput');
const editClipList = el('editClipList');
const editTimelineContent = el('editTimelineContent');
const editTimelineTrack = el('editTimelineTrack');
const editJoinScroll = el('editJoinScroll');
const editJoinContent = el('editJoinContent');
const timelineMedia = new Map<File, { duration: number; frames: string[] }>();
const timelineMediaFailed = new Set<File>();
const editClipRanges = new Map<File, { start: number; end: number }>();
type EditSnapshot = { clips: File[]; ranges: Map<File, { start: number; end: number }>; start: string; end: string };
const editUndoStack: EditSnapshot[] = [];
const editRedoStack: EditSnapshot[] = [];
function editSnapshot(): EditSnapshot {
  return { clips: [...editVideoClips], ranges: new Map([...editClipRanges].map(([file, range]) => [file, { ...range }])), start: editStartTime.value, end: editEndTime.value };
}
function updateEditHistoryButtons(): void {
  (el('editUndoBtn') as HTMLButtonElement).disabled = !editUndoStack.length || !!activeJob;
  (el('editRedoBtn') as HTMLButtonElement).disabled = !editRedoStack.length || !!activeJob;
}
function rememberEdit(): void {
  editUndoStack.push(editSnapshot());
  if (editUndoStack.length > 30) editUndoStack.shift();
  editRedoStack.length = 0;
  updateEditHistoryButtons();
}
function restoreEdit(snapshot: EditSnapshot): void {
  editVideoClips = [...snapshot.clips];
  editClipRanges.clear();
  snapshot.ranges.forEach((range, file) => editClipRanges.set(file, { ...range }));
  editStartTime.value = snapshot.start;
  editEndTime.value = snapshot.end;
  resetJoinPreview();
  invalidateEditedVideoResult();
  renderEditVideoClips();
  updateTimelineSelection();
  updateEditTrimSummary();
  updateEditHistoryButtons();
}
function stepEditHistory(direction: 'undo' | 'redo'): void {
  if (activeJob) return;
  const source = direction === 'undo' ? editUndoStack : editRedoStack;
  const target = direction === 'undo' ? editRedoStack : editUndoStack;
  const snapshot = source.pop();
  if (!snapshot) return;
  target.push(editSnapshot());
  restoreEdit(snapshot);
}
el('editUndoBtn').addEventListener('click', () => stepEditHistory('undo'));
el('editRedoBtn').addEventListener('click', () => stepEditHistory('redo'));
for (const id of ['editResolution', 'editQuality']) el(id).addEventListener('change', invalidateEditedVideoResult);
document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (currentTab !== 'editVideo' || !(event.ctrlKey || event.metaKey) || activeJob) return;
  if ((event.target as Element)?.closest('input, textarea, [contenteditable]')) return;
  if (event.key.toLowerCase() !== 'z' && event.key.toLowerCase() !== 'y') return;
  event.preventDefault();
  stepEditHistory(event.key.toLowerCase() === 'y' || event.shiftKey ? 'redo' : 'undo');
});
let editTimelineZoom = 1;
let editJoinZoom = 1;
let timelineLoadToken = 0;
let draggingClipIndex = -1;
let joinTimelinePosition = 0;
let joinIsPlaying = false;
let joinPreviewFile: File | null = null;
let joinPreviewUrl: string | null = null;
const joinPreviewVideo = document.createElement('video');
joinPreviewVideo.playsInline = true;
joinPreviewVideo.style.cssText = 'display:none;width:100%;height:100%;object-fit:contain;';
originalWrap.appendChild(joinPreviewVideo);

function timelineClock(seconds: number): string {
  if (!Number.isFinite(seconds)) seconds = 0;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds % 60).toFixed(1).padStart(4, '0')}`;
}

function joinSourceDuration(): number {
  return editVideoClips.reduce((sum, file) => sum + (timelineMedia.get(file)?.duration || 0), 0);
}

function joinSelectedEnd(): number {
  const last = editVideoClips.at(-1);
  if (!last) return 0;
  return joinSourceDuration() - (timelineMedia.get(last)?.duration || 0) + (getEditClipRange(last)?.end || 0);
}

function syncJoinPreviewVisibility(): void {
  const showJoin = currentTab === 'editVideo' && editVideoMode === 'join' && !!videoToGifFile;
  joinPreviewVideo.style.display = showJoin ? 'block' : 'none';
  if (videoToGifFile) videoPlayer.style.display = showJoin ? 'none' : 'block';
  if (!showJoin) {
    joinIsPlaying = false;
    joinPreviewVideo.pause();
  } else {
    videoPlayer.pause();
    if (!joinPreviewFile && joinSourceDuration() > 0) setJoinPosition(0);
  }
  updateJoinPlayButton();
}

function updateJoinPlayButton(): void {
  const button = el('editJoinPlay');
  button.textContent = joinIsPlaying ? 'Ⅱ' : '▶';
  button.setAttribute('aria-label', t(joinIsPlaying ? 'editPause' : 'editJoinPlay'));
  button.title = t(joinIsPlaying ? 'editPause' : 'editJoinPlay');
}

function updateJoinPlayhead(): void {
  const total = joinSourceDuration();
  let remaining = Math.min(Math.max(0, joinTimelinePosition), total);
  let x = 12;
  const cards = [...editClipList.children] as HTMLElement[];
  for (let index = 0; index < editVideoClips.length; index++) {
    const width = cards[index]?.offsetWidth || 0;
    const duration = timelineMedia.get(editVideoClips[index])?.duration || 0;
    if (index === editVideoClips.length - 1 || remaining <= duration) {
      x += duration ? width * remaining / duration : 0;
      break;
    }
    x += width + 4;
    remaining -= duration;
  }
  const playhead = el('editJoinPlayhead');
  playhead.style.left = `${x}px`;
  playhead.setAttribute('aria-valuenow', joinTimelinePosition.toFixed(2));
  playhead.setAttribute('aria-valuemax', total.toFixed(2));
  el('editJoinCurrent').textContent = timelineClock(joinTimelinePosition);
  el('editJoinTotal').textContent = timelineClock(total);
}

function renderJoinRuler(): void {
  const cards = [...editClipList.children] as HTMLElement[];
  const stripWidth = cards.reduce((sum, card) => sum + card.offsetWidth, 0) + Math.max(0, cards.length - 1) * 4;
  editJoinContent.style.width = `${Math.max(640, stripWidth + 24)}px`;
  const ruler = el('editJoinRuler');
  ruler.style.width = `${stripWidth}px`;
  ruler.replaceChildren();
  let offsetTime = 0;
  let offsetX = 0;
  editVideoClips.forEach((file, index) => {
    const duration = timelineMedia.get(file)?.duration || 0;
    const width = cards[index]?.offsetWidth || 0;
    if (duration && width) {
      const candidates = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300];
      const step = candidates.find(value => value / duration * width >= 55) || 600;
      for (let time = 0; time < duration; time += step) {
        const tick = document.createElement('span');
        tick.className = 'edit-timeline-tick';
        tick.style.left = `${offsetX + time / duration * width}px`;
        tick.textContent = timelineClock(offsetTime + time);
        ruler.appendChild(tick);
      }
    }
    offsetTime += duration;
    offsetX += width + (index < editVideoClips.length - 1 ? 4 : 0);
  });
  if (stripWidth) {
    const lastTick = document.createElement('span');
    lastTick.className = 'edit-timeline-tick edit-timeline-tick-last';
    lastTick.style.left = `${stripWidth}px`;
    lastTick.textContent = timelineClock(offsetTime);
    ruler.appendChild(lastTick);
  }
  updateJoinPlayhead();
  if (currentTab === 'editVideo' && editVideoMode === 'join' && !joinPreviewFile && joinSourceDuration() > 0) setJoinPosition(0);
}

function joinTimeAt(clientX: number): number {
  let offset = 0;
  const cards = [...editClipList.children] as HTMLElement[];
  for (let index = 0; index < cards.length; index++) {
    const rect = cards[index].getBoundingClientRect();
    const duration = timelineMedia.get(editVideoClips[index])?.duration || 0;
    if (clientX <= rect.right || index === cards.length - 1) {
      return Math.max(0, Math.min(joinSourceDuration(), offset + Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * duration));
    }
    offset += duration;
  }
  return 0;
}

function setJoinPosition(time: number): void {
  const total = joinSourceDuration();
  let remaining = Math.max(0, Math.min(total, time));
  let offset = 0;
  for (let index = 0; index < editVideoClips.length; index++) {
    const file = editVideoClips[index];
    const duration = timelineMedia.get(file)?.duration || 0;
    if (!duration) continue;
    if (remaining >= duration && index < editVideoClips.length - 1) {
      remaining -= duration;
      offset += duration;
      continue;
    }
    const range = getEditClipRange(file);
    if (!range) return;
    const local = Math.max(range.start, Math.min(range.end, remaining));
    joinTimelinePosition = offset + local;
    if (joinPreviewFile !== file) {
      joinPreviewVideo.pause();
      if (joinPreviewUrl) URL.revokeObjectURL(joinPreviewUrl);
      joinPreviewFile = file;
      joinPreviewUrl = URL.createObjectURL(file);
      joinPreviewVideo.onloadedmetadata = () => {
        if (joinPreviewFile !== file) return;
        joinPreviewVideo.currentTime = local;
        if (joinIsPlaying) joinPreviewVideo.play().catch(() => { joinIsPlaying = false; updateJoinPlayButton(); });
      };
      joinPreviewVideo.src = joinPreviewUrl;
    } else if (joinPreviewVideo.readyState >= 1) {
      joinPreviewVideo.currentTime = local;
      if (joinIsPlaying && joinPreviewVideo.paused) joinPreviewVideo.play().catch(() => {});
    }
    updateJoinPlayhead();
    return;
  }
  joinTimelinePosition = 0;
  updateJoinPlayhead();
}

function advanceJoinPreview(): void {
  const index = editVideoClips.indexOf(joinPreviewFile as File);
  if (index < 0) return;
  const next = editVideoClips.slice(index + 1).find(file => getEditClipRange(file));
  if (!next) {
    joinIsPlaying = false;
    joinPreviewVideo.pause();
    const offset = editVideoClips.slice(0, index).reduce((sum, file) => sum + (timelineMedia.get(file)?.duration || 0), 0);
    joinTimelinePosition = offset + getEditClipRange(editVideoClips[index])!.end;
    updateJoinPlayhead();
    updateJoinPlayButton();
    return;
  }
  let offset = 0;
  for (const file of editVideoClips) {
    if (file === next) break;
    offset += timelineMedia.get(file)?.duration || 0;
  }
  setJoinPosition(offset + getEditClipRange(next)!.start);
}

joinPreviewVideo.addEventListener('timeupdate', () => {
  if (currentTab !== 'editVideo' || editVideoMode !== 'join') return;
  const index = editVideoClips.indexOf(joinPreviewFile as File);
  if (index < 0) return;
  const range = getEditClipRange(editVideoClips[index]);
  if (!range) return;
  if (joinIsPlaying && joinPreviewVideo.currentTime >= range.end - 0.035) { advanceJoinPreview(); return; }
  const offset = editVideoClips.slice(0, index).reduce((sum, file) => sum + (timelineMedia.get(file)?.duration || 0), 0);
  joinTimelinePosition = offset + joinPreviewVideo.currentTime;
  updateJoinPlayhead();
});
joinPreviewVideo.addEventListener('ended', () => { if (joinIsPlaying) advanceJoinPreview(); });

async function loadTimelineMedia(file: File, frameCount = 1): Promise<void> {
  const cached = timelineMedia.get(file);
  if (cached && cached.frames.length >= frameCount) return;
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.preload = 'auto';
  video.playsInline = true;
  try {
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Video preview unavailable'));
    });
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const frames: string[] = [];
    const canvas = document.createElement('canvas');
    canvas.width = 144;
    canvas.height = 82;
    const context = canvas.getContext('2d');
    for (let index = 0; index < frameCount && context; index++) {
      const time = Math.min(Math.max(0, duration - 0.05), duration * (index + 0.5) / frameCount);
      if (Math.abs(video.currentTime - time) > 0.03) {
        await new Promise<void>((resolve, reject) => {
          video.onseeked = () => resolve();
          video.onerror = () => reject(new Error('Video preview unavailable'));
          video.currentTime = time;
        });
      }
      context.fillStyle = '#191527';
      context.fillRect(0, 0, canvas.width, canvas.height);
      if (video.videoWidth) {
        const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
        const width = video.videoWidth * scale;
        const height = video.videoHeight * scale;
        context.drawImage(video, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      }
      frames.push(canvas.toDataURL('image/jpeg', 0.68));
    }
    if ((timelineMedia.get(file)?.frames.length || 0) < frames.length) timelineMedia.set(file, { duration, frames });
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}

function updateTimelinePlayhead(): void {
  const duration = videoPlayer.duration;
  const fraction = Number.isFinite(duration) && duration > 0 ? Math.min(1, videoPlayer.currentTime / duration) : 0;
  el('editTimelinePlayhead').style.left = `${12 + fraction * editTimelineTrack.offsetWidth}px`;
  el('editTimelineCurrent').textContent = timelineClock(videoPlayer.currentTime);
  el('editTimelinePlayhead').setAttribute('aria-valuenow', videoPlayer.currentTime.toFixed(2));
  el('editTimelinePlayhead').setAttribute('aria-valuemax', Number.isFinite(duration) ? duration.toFixed(2) : '0');
  const playing = !videoPlayer.paused && !videoPlayer.ended;
  el('editTimelinePlay').textContent = playing ? 'Ⅱ' : '▶';
  el('editTimelinePlay').setAttribute('aria-label', t(playing ? 'editPause' : 'editPlay'));
  el('editTimelinePlay').title = t(playing ? 'editPause' : 'editPlay');
}

function renderEditTimeline(): void {
  const duration = videoPlayer.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  editTimelineContent.style.width = `${Math.max(640, duration * 22 * editTimelineZoom)}px`;
  el('editTimelineTotal').textContent = timelineClock(duration);
  const ruler = el('editTimelineRuler');
  ruler.replaceChildren();
  const step = duration > 120 ? 30 : duration > 40 ? 10 : duration > 12 ? 5 : duration > 4 ? 1 : 0.5;
  for (let time = 0; time <= duration + step / 10; time += step) {
    const tick = document.createElement('span');
    tick.className = 'edit-timeline-tick';
    tick.style.left = `${Math.min(100, time / duration * 100)}%`;
    tick.textContent = timelineClock(time);
    ruler.appendChild(tick);
  }
  const frames = el('editTimelineFrames');
  frames.replaceChildren();
  const images = videoToGifFile ? timelineMedia.get(videoToGifFile)?.frames || [] : [];
  for (let index = 0; index < 8; index++) {
    const cell = document.createElement('div');
    cell.className = 'edit-timeline-frame';
    if (images[index]) cell.style.backgroundImage = `url("${images[index]}")`;
    frames.appendChild(cell);
  }
  updateTimelineSelection();
  updateTimelinePlayhead();
}

function updateTimelineSelection(): void {
  const duration = videoPlayer.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  const start = Math.max(0, Math.min(duration, Number(editStartTime.value) || 0));
  const end = Math.max(start, Math.min(duration, Number(editEndTime.value) || duration));
  const startPercent = start / duration * 100;
  const endPercent = end / duration * 100;
  el('editTimelineStart').style.left = `${startPercent}%`;
  el('editTimelineEnd').style.left = `${endPercent}%`;
  el('editTimelineDimLeft').style.width = `${startPercent}%`;
  el('editTimelineDimRight').style.left = `${endPercent}%`;
  el('editTimelineDimRight').style.width = `${100 - endPercent}%`;
  el('editTimelineStart').setAttribute('aria-valuenow', start.toFixed(2));
  el('editTimelineEnd').setAttribute('aria-valuenow', end.toFixed(2));
  el('editTimelineStart').setAttribute('aria-valuemax', duration.toFixed(2));
  el('editTimelineEnd').setAttribute('aria-valuemax', duration.toFixed(2));
  el('editTimelineStartLabel').textContent = `${t('editStartShort')} ${timelineClock(start)}`;
  el('editTimelineEndLabel').textContent = `${t('editEndShort')} ${timelineClock(end)}`;
}

function setTimelineTrimEdge(edge: 'start' | 'end', time: number): void {
  if (activeJob) return;
  const duration = videoPlayer.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  const start = Number(editStartTime.value);
  const end = Number(editEndTime.value);
  const minimum = Math.min(0.05, duration);
  const value = edge === 'start'
    ? Math.max(0, Math.min(end - minimum, time))
    : Math.min(duration, Math.max(start + minimum, time));
  (edge === 'start' ? editStartTime : editEndTime).value = value.toFixed(2);
  invalidateEditedVideoResult();
  videoPlayer.currentTime = value;
  updateEditTrimSummary();
  updateTimelineSelection();
  updateTimelinePlayhead();
}

function timelineTimeAt(clientX: number): number {
  const rect = editTimelineTrack.getBoundingClientRect();
  return Math.max(0, Math.min(videoPlayer.duration || 0, (clientX - rect.left) / rect.width * videoPlayer.duration));
}

function updateEditTrimSummary() {
  const total = videoPlayer.duration;
  const start = Number(editStartTime.value);
  const end = Number(editEndTime.value);
  const summary = el('editTrimSummary');
  if (!Number.isFinite(total) || total <= 0) { summary.textContent = ''; return; }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > total + 0.05) {
    summary.textContent = t('editInvalidRange');
    return;
  }
  summary.textContent = t('editTrimSummary', { length: (end - start).toFixed(1), total: total.toFixed(1) });
}

function getEditClipRange(file: File): { start: number; end: number } | null {
  const duration = timelineMedia.get(file)?.duration;
  if (!duration || !Number.isFinite(duration)) return null;
  let range = editClipRanges.get(file);
  if (!range) {
    range = { start: 0, end: duration };
    editClipRanges.set(file, range);
  }
  return range;
}

function updateJoinSummary(): void {
  let total = 0;
  editVideoClips.forEach((file, index) => {
    const row = editClipList.children[index] as HTMLElement | undefined;
    const offset = row?.querySelector('.video-edit-clip-offset');
    if (offset) offset.textContent = timelineClock(total);
    const range = getEditClipRange(file);
    total += range ? range.end - range.start : 0;
  });
  el('editJoinSummary').textContent = `${timelineClock(total)} ${t('editJoinTotal')}`;
  el('editJoinStartLabel').textContent = `${t('editStartShort')} ${timelineClock(0)}`;
  el('editJoinEndLabel').textContent = `${t('editEndShort')} ${timelineClock(joinSourceDuration())}`;
}

function updateEditClipVisual(row: HTMLElement, file: File): void {
  const duration = timelineMedia.get(file)?.duration || 0;
  const range = getEditClipRange(file);
  if (!range || !duration) return;
  const left = range.start / duration * 100;
  const right = range.end / duration * 100;
  (row.querySelector('.video-edit-clip-dim-left') as HTMLElement).style.width = `${left}%`;
  (row.querySelector('.video-edit-clip-dim-right') as HTMLElement).style.left = `${right}%`;
  (row.querySelector('.video-edit-clip-dim-right') as HTMLElement).style.width = `${100 - right}%`;
  const startHandle = row.querySelector('.video-edit-clip-handle-start') as HTMLElement;
  const endHandle = row.querySelector('.video-edit-clip-handle-end') as HTMLElement;
  startHandle.style.left = `${left}%`;
  endHandle.style.left = `${right}%`;
  for (const [handle, value] of [[startHandle, range.start], [endHandle, range.end]] as const) {
    handle.setAttribute('aria-valuenow', value.toFixed(2));
    handle.setAttribute('aria-valuemax', duration.toFixed(2));
  }
  (row.querySelector('.video-edit-clip-times') as HTMLElement).textContent = `${timelineClock(range.start)} – ${timelineClock(range.end)} · ${timelineClock(range.end - range.start)}`;
  row.title = `${file.name}: ${timelineClock(range.start)} – ${timelineClock(range.end)}`;
  updateJoinSummary();
}

function setEditClipEdge(row: HTMLElement, file: File, edge: 'start' | 'end', time: number): void {
  if (activeJob) return;
  const range = getEditClipRange(file);
  const duration = timelineMedia.get(file)?.duration || 0;
  if (!range || !duration) return;
  const minimum = Math.min(0.05, duration);
  if (edge === 'start') range.start = Math.max(0, Math.min(range.end - minimum, time));
  else range.end = Math.min(duration, Math.max(range.start + minimum, time));
  invalidateEditedVideoResult();
  updateEditClipVisual(row, file);
  if (joinPreviewFile === file) setJoinPosition(joinTimelinePosition);
}

function renderEditVideoClips() {
  editClipList.replaceChildren();
  let timelineOffset = 0;
  editVideoClips.forEach((file, index) => {
    const row = document.createElement('div');
    row.className = 'video-edit-clip';
    row.dataset.index = String(index);
    row.tabIndex = 0;
    row.draggable = true;
    row.setAttribute('aria-label', `${index + 1}. ${file.name}. ${t('editClipDrag')}`);
    const media = timelineMedia.get(file);
    if (media?.duration) row.style.flexBasis = `${Math.max(240, Math.min(2400, Math.round(media.duration * 70 * editJoinZoom)))}px`;
    row.addEventListener('dragstart', (event: DragEvent) => {
      if (activeJob || (event.target as Element).closest('.video-edit-clip-handle, button[data-action]')) { event.preventDefault(); return; }
      draggingClipIndex = index;
      event.dataTransfer?.setData('text/plain', String(index));
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      row.classList.add('is-dragging');
    });
    row.addEventListener('dragend', () => {
      draggingClipIndex = -1;
      editClipList.querySelectorAll('.drop-before, .drop-after, .is-dragging').forEach((item: Element) => item.classList.remove('drop-before', 'drop-after', 'is-dragging'));
    });
    row.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
      event.preventDefault();
      const target = index + (event.key === 'ArrowRight' ? 1 : -1);
      if (target < 0 || target >= editVideoClips.length) return;
      rememberEdit();
      [editVideoClips[index], editVideoClips[target]] = [editVideoClips[target], editVideoClips[index]];
      resetJoinPreview();
      invalidateEditedVideoResult();
      renderEditVideoClips();
      (editClipList.children[target] as HTMLElement)?.focus();
    });
    const offset = document.createElement('div');
    offset.className = 'video-edit-clip-offset';
    offset.textContent = timelineClock(timelineOffset);
    row.appendChild(offset);
    const strip = document.createElement('div');
    strip.className = 'video-edit-clip-strip';
    for (let frameIndex = 0; frameIndex < 8; frameIndex++) {
      const frame = document.createElement('div');
      frame.className = 'video-edit-clip-frame';
      const frameUrl = media?.frames[frameIndex] || media?.frames[0];
      if (frameUrl) frame.style.backgroundImage = `url("${frameUrl}")`;
      strip.appendChild(frame);
    }
    for (const side of ['left', 'right']) {
      const dim = document.createElement('div');
      dim.className = `video-edit-clip-dim video-edit-clip-dim-${side}`;
      strip.appendChild(dim);
    }
    if (media?.duration) for (const edge of ['start', 'end'] as const) {
      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = `video-edit-clip-handle video-edit-clip-handle-${edge}`;
      handle.setAttribute('role', 'slider');
      handle.setAttribute('aria-label', t(edge === 'start' ? 'editClipStart' : 'editClipEnd'));
      handle.setAttribute('aria-valuemin', '0');
      handle.textContent = edge === 'start' ? '‹' : '›';
      handle.addEventListener('pointerdown', (event: PointerEvent) => {
        event.preventDefault();
        rememberEdit();
        const original = { ...getEditClipRange(file)! };
        const width = strip.getBoundingClientRect().width;
        const pointerX = event.clientX;
        handle.setPointerCapture(event.pointerId);
        const move = (moveEvent: PointerEvent) => {
          if (!handle.hasPointerCapture(moveEvent.pointerId)) return;
          const initial = edge === 'start' ? original.start : original.end;
          setEditClipEdge(row, file, edge, initial + (moveEvent.clientX - pointerX) / width * media.duration);
        };
        handle.addEventListener('pointermove', move);
        handle.addEventListener('lostpointercapture', () => handle.removeEventListener('pointermove', move), { once: true });
      });
      handle.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const current = getEditClipRange(file)!;
        const step = event.shiftKey ? 1 : 0.1;
        rememberEdit();
        setEditClipEdge(row, file, edge, (edge === 'start' ? current.start : current.end) + (event.key === 'ArrowRight' ? step : -step));
      });
      strip.appendChild(handle);
    }
    row.appendChild(strip);
    const number = document.createElement('span');
    number.className = 'video-edit-clip-number';
    number.textContent = String(index + 1);
    row.appendChild(number);
    const name = document.createElement('span');
    name.className = 'video-edit-clip-name';
    name.textContent = file.name;
    name.title = file.name;
    row.appendChild(name);
    const times = document.createElement('div');
    times.className = 'video-edit-clip-times';
    times.textContent = media ? '' : t('editLoadingVideo');
    row.appendChild(times);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '×';
    remove.dataset.action = 'remove';
    remove.dataset.index = String(index);
    remove.title = t('editClipRemove');
    remove.setAttribute('aria-label', `${t('editClipRemove')} ${file.name}`);
    remove.disabled = editVideoClips.length === 1;
    row.appendChild(remove);
    editClipList.appendChild(row);
    if (media?.duration) updateEditClipVisual(row, file);
    const range = getEditClipRange(file);
    if (range) timelineOffset += range.end - range.start;
    if (!media && !timelineMediaFailed.has(file)) loadTimelineMedia(file).then(() => {
      if (editVideoClips.includes(file)) renderEditVideoClips();
    }).catch(() => { timelineMediaFailed.add(file); });
  });
  updateJoinSummary();
  renderJoinRuler();
}

function setEditVideoMode(mode: 'trim' | 'join') {
  if (editVideoMode !== mode) invalidateEditedVideoResult();
  editVideoMode = mode;
  el('editTrimMode').classList.toggle('active', mode === 'trim');
  el('editJoinMode').classList.toggle('active', mode === 'join');
  el('editTrimPanel').classList.toggle('hidden', mode !== 'trim');
  el('editJoinPanel').classList.toggle('hidden', mode !== 'join');
  el('editVideoBtnText').textContent = t(mode === 'trim' ? 'editTrimAction' : 'editJoinAction');
  if (mode === 'trim') renderEditTimeline();
  else renderJoinRuler();
  syncJoinPreviewVisibility();
}

function resetJoinPreview(): void {
  joinIsPlaying = false;
  joinTimelinePosition = 0;
  joinPreviewVideo.pause();
  joinPreviewVideo.removeAttribute('src');
  joinPreviewVideo.load();
  if (joinPreviewUrl) URL.revokeObjectURL(joinPreviewUrl);
  joinPreviewUrl = null;
  joinPreviewFile = null;
  updateJoinPlayButton();
  updateJoinPlayhead();
}

function invalidateEditedVideoResult(): void {
  if (!editedVideoBlobUrl) return;
  URL.revokeObjectURL(editedVideoBlobUrl);
  editedVideoBlobUrl = null;
  resultVideo.pause();
  resultVideo.removeAttribute('src');
  resultVideo.load();
  resultVideo.classList.add('hidden');
  if (placeholderResult) { placeholderResult.textContent = t('placeholderEditVideo'); placeholderResult.style.display = ''; }
  downloadSection.classList.add('hidden');
}

el('editTrimMode').addEventListener('click', () => { if (!activeJob) setEditVideoMode('trim'); });
el('editJoinMode').addEventListener('click', () => { if (!activeJob) setEditVideoMode('join'); });
el('editTimelinePlay').addEventListener('click', () => {
  if (videoPlayer.paused) videoPlayer.play().catch(() => {});
  else videoPlayer.pause();
});
el('editJoinPlay').addEventListener('click', () => {
  if (joinIsPlaying) {
    joinIsPlaying = false;
    joinPreviewVideo.pause();
  } else if (joinSourceDuration() > 0) {
    if (joinTimelinePosition >= joinSelectedEnd() - 0.02) setJoinPosition(0);
    else setJoinPosition(joinTimelinePosition);
    joinIsPlaying = true;
    if (joinPreviewVideo.readyState >= 1) joinPreviewVideo.play().catch(() => { joinIsPlaying = false; updateJoinPlayButton(); });
  }
  updateJoinPlayButton();
});
for (const eventName of ['timeupdate', 'play', 'pause', 'ended']) videoPlayer.addEventListener(eventName, updateTimelinePlayhead);
el('editTimelineZoomIn').addEventListener('click', () => { editTimelineZoom = Math.min(8, editTimelineZoom * 1.5); renderEditTimeline(); });
el('editTimelineZoomOut').addEventListener('click', () => { editTimelineZoom = Math.max(0.5, editTimelineZoom / 1.5); renderEditTimeline(); });
el('editJoinZoomIn').addEventListener('click', () => { editJoinZoom = Math.min(8, editJoinZoom * 1.5); renderEditVideoClips(); });
el('editJoinZoomOut').addEventListener('click', () => { editJoinZoom = Math.max(0.5, editJoinZoom / 1.5); renderEditVideoClips(); });
for (const edge of ['start', 'end'] as const) {
  const handle = el(edge === 'start' ? 'editTimelineStart' : 'editTimelineEnd');
  handle.addEventListener('pointerdown', (event: PointerEvent) => {
    event.preventDefault();
    rememberEdit();
    handle.setPointerCapture(event.pointerId);
    setTimelineTrimEdge(edge, timelineTimeAt(event.clientX));
  });
  handle.addEventListener('pointermove', (event: PointerEvent) => {
    if (handle.hasPointerCapture(event.pointerId)) setTimelineTrimEdge(edge, timelineTimeAt(event.clientX));
  });
  handle.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.shiftKey ? 1 : 0.1;
    const current = Number((edge === 'start' ? editStartTime : editEndTime).value);
    rememberEdit();
    setTimelineTrimEdge(edge, current + (event.key === 'ArrowRight' ? step : -step));
  });
}
const trimPlayhead = el('editTimelinePlayhead');
trimPlayhead.addEventListener('pointerdown', (event: PointerEvent) => {
  event.preventDefault();
  trimPlayhead.setPointerCapture(event.pointerId);
});
trimPlayhead.addEventListener('pointermove', (event: PointerEvent) => {
  if (!trimPlayhead.hasPointerCapture(event.pointerId)) return;
  videoPlayer.currentTime = timelineTimeAt(event.clientX);
  updateTimelinePlayhead();
});
trimPlayhead.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  videoPlayer.currentTime = Math.max(0, Math.min(videoPlayer.duration, videoPlayer.currentTime + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 1 : 0.1)));
  updateTimelinePlayhead();
});
const joinPlayhead = el('editJoinPlayhead');
joinPlayhead.addEventListener('pointerdown', (event: PointerEvent) => {
  event.preventDefault();
  joinPlayhead.setPointerCapture(event.pointerId);
});
joinPlayhead.addEventListener('pointermove', (event: PointerEvent) => {
  if (joinPlayhead.hasPointerCapture(event.pointerId)) setJoinPosition(joinTimeAt(event.clientX));
});
joinPlayhead.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  setJoinPosition(joinTimelinePosition + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 1 : 0.1));
});
el('editAddClips').addEventListener('click', () => { if (!activeJob) editJoinInput.click(); });
el('editChooseAnotherBtn').addEventListener('click', resetAll);

editJoinInput.addEventListener('change', () => {
  const added = Array.from(editJoinInput.files as FileList).filter(file => file.type.startsWith('video/'));
  editJoinInput.value = '';
  if (!added.length) return;
  if (editVideoClips.length + added.length > 8) { showToast(t('editTooManyClips'), 'error'); return; }
  if ([...editVideoClips, ...added].reduce((sum, file) => sum + file.size, 0) > 250 * 1024 * 1024) {
    showToast(t('editTooLarge'), 'error'); return;
  }
  rememberEdit();
  editVideoClips.push(...added);
  invalidateEditedVideoResult();
  renderEditVideoClips();
});

editClipList.addEventListener('click', (event: MouseEvent) => {
  if (activeJob) return;
  const button = (event.target as Element).closest('button[data-action]') as HTMLButtonElement | null;
  if (!button) return;
  const index = Number(button.dataset.index);
  if (!Number.isInteger(index) || index < 0 || index >= editVideoClips.length) return;
  if (button.dataset.action === 'remove' && editVideoClips.length > 1) {
    rememberEdit();
    if (joinPreviewFile === editVideoClips[index]) resetJoinPreview();
    editClipRanges.delete(editVideoClips[index]);
    editVideoClips.splice(index, 1);
  }
  invalidateEditedVideoResult();
  renderEditVideoClips();
});

editClipList.addEventListener('dragover', (event: DragEvent) => {
  if (draggingClipIndex < 0) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  const bounds = editJoinScroll.getBoundingClientRect();
  if (event.clientX > bounds.right - 40) editJoinScroll.scrollLeft += 22;
  if (event.clientX < bounds.left + 40) editJoinScroll.scrollLeft -= 22;
  editClipList.querySelectorAll('.drop-before, .drop-after').forEach((item: Element) => item.classList.remove('drop-before', 'drop-after'));
  const card = (event.target as Element).closest('.video-edit-clip') as HTMLElement | null;
  if (!card) return;
  const before = event.clientX < card.getBoundingClientRect().left + card.offsetWidth / 2;
  card.classList.add(before ? 'drop-before' : 'drop-after');
});
editClipList.addEventListener('drop', (event: DragEvent) => {
  if (draggingClipIndex < 0) return;
  event.preventDefault();
  const card = (event.target as Element).closest('.video-edit-clip') as HTMLElement | null;
  const target = card ? Number(card.dataset.index) + (event.clientX >= card.getBoundingClientRect().left + card.offsetWidth / 2 ? 1 : 0) : editVideoClips.length;
  const source = draggingClipIndex;
  draggingClipIndex = -1;
  if (!Number.isInteger(target) || source < 0 || source >= editVideoClips.length) return;
  if (target !== source && target !== source + 1) rememberEdit();
  const [moved] = editVideoClips.splice(source, 1);
  editVideoClips.splice(Math.max(0, Math.min(editVideoClips.length, target > source ? target - 1 : target)), 0, moved);
  resetJoinPreview();
  invalidateEditedVideoResult();
  renderEditVideoClips();
});

editVideoBtn.addEventListener('click', async () => {
  if (!videoToGifFile || !Number.isFinite(videoPlayer.duration)) return;
  const mode = editVideoMode;
  const start = Number(editStartTime.value);
  const end = Number(editEndTime.value);
  if (mode === 'trim' && (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > videoPlayer.duration + 0.05)) {
    showToast(t('editInvalidRange'), 'error'); return;
  }
  if (mode === 'join' && editVideoClips.length < 2) { showToast(t('editNeedClips'), 'error'); return; }
  if (mode === 'join' && editVideoClips.reduce((sum, file) => sum + file.size, 0) > 250 * 1024 * 1024) {
    showToast(t('editTooLarge'), 'error'); return;
  }
  if (mode === 'join' && editVideoClips.some(file => !getEditClipRange(file))) {
    showToast(t('editClipNotReady'), 'error'); return;
  }

  const job = beginJob();
  job.ffmpeg = true;
  editVideoBtn.disabled = true;
  downloadSection.classList.add('hidden');
  progressSection.classList.remove('hidden');
  updateProgress(5, t('preparingVideo'));
  try {
    const ffmpeg = await loadFFmpeg();
    if (job.cancelled) return;
    const report = (key: string, percent: number, params?: Record<string, number>) => updateProgress(percent, t(key, params));
    const cancelled = () => job.cancelled;
    const exportOptions: VideoExportOptions = {
      maxHeight: (el('editResolution') as HTMLSelectElement).value === 'source' ? null : Number((el('editResolution') as HTMLSelectElement).value),
      crf: Number((el('editQuality') as HTMLSelectElement).value) as VideoExportOptions['crf'],
    };
    const blob = mode === 'trim'
      ? await trimVideo(ffmpeg, videoToGifFile, start, end, videoPlayer.videoWidth, videoPlayer.videoHeight, exportOptions, report, cancelled)
      : await joinVideos(ffmpeg, editVideoClips.map(file => ({ file, ...getEditClipRange(file)! })), videoPlayer.videoWidth, videoPlayer.videoHeight, exportOptions, report, cancelled);
    if (job.cancelled) return;
    if (editedVideoBlobUrl) URL.revokeObjectURL(editedVideoBlobUrl);
    editedVideoBlobUrl = URL.createObjectURL(blob);
    editedVideoName = `${(editVideoClips[0] || videoToGifFile).name.replace(/\.[^/.]+$/, '')}_${mode === 'trim' ? 'trimmed' : 'joined'}.mp4`;
    resultVideo.src = editedVideoBlobUrl;
    resultVideo.muted = false;
    resultVideo.classList.remove('hidden');
    resultImg.classList.add('hidden');
    if (placeholderResult) placeholderResult.style.display = 'none';
    resultMeta.textContent = `${editedVideoName} · ${formatBytes(blob.size)}`;
    if (successBadgeText) successBadgeText.textContent = t('editSuccessBadge');
    downloadBtnText.textContent = t('editDownload');
    updateProgress(100, t('editSuccess'));
    progressSection.classList.add('hidden');
    downloadSection.classList.remove('hidden');
    downloadSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    finishJob(job);
    showToast(t('editSuccess'), 'success');
  } catch (err) {
    if (!job.cancelled) {
      finishJob(job);
      progressSection.classList.add('hidden');
      showToast(t('editError', { err: err?.message || err }), 'error');
      console.error('[EditVideo]', err);
    }
  } finally {
    editVideoBtn.disabled = false;
  }
});

muteVideoBtn.addEventListener('click', async () => {
  if (!videoToGifFile) { showToast('Hãy chọn video trước!', 'error'); return; }
  const job = beginJob();
  job.ffmpeg = true;

  muteVideoBtn.disabled = true;
  downloadSection.classList.add('hidden');
  progressSection.classList.remove('hidden');
  updateProgress(15, 'Đang chuẩn bị file video...');

  try {
    const ffmpeg = await loadFFmpeg();
    if (job.cancelled) { ffmpeg.terminate(); ffmpegInstance = null; ffmpegLoaded = false; return; }
    updateProgress(35, 'Đang nạp video vào bộ nhớ...');

    const { fetchFile } = window.FFmpegUtil || {};
    if (!fetchFile) throw new Error('FFmpegUtil chưa được tải');
    const inputData = await fetchFile(videoToGifFile);
    if (job.cancelled) return;

    const ext = videoToGifFile.name.split('.').pop().toLowerCase() || 'mp4';
    const inputName  = `input.${ext}`;
    const outputName = `output_no_audio.${ext}`;

    await ffmpeg.writeFile(inputName, inputData);

    updateProgress(65, 'Đang xóa âm thanh khỏi video...');
    // -c:v copy = giữ nguyên chất lượng video, -an = xóa âm thanh, không re-encode → xử lý tức thì
    await ffmpeg.exec(['-i', inputName, '-c:v', 'copy', '-an', outputName]);
    if (job.cancelled) return;

    updateProgress(90, 'Đang hoàn tất đóng gói video...');
    const outputData = await ffmpeg.readFile(outputName);
    if (job.cancelled) return;
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

    showToast(t('toastMuteSuccess'), 'success');
    finishJob(job);

  } catch (err) {
    if (job.cancelled) return;
    finishJob(job);
    console.error('[MuteVideo]', err);
    progressSection.classList.add('hidden');
    showToast(t('toastMuteError', { err: err.message || err }), 'error');
  } finally {
    muteVideoBtn.disabled = false;
  }
});

// ─── Process GIF ──────────────────────────────────────────────────────────────
async function processGif() {
  if (!superGif || frameCount === 0) { showToast('File GIF chưa sẵn sàng!', 'error'); return; }
  const job = beginJob();

  const tolerance = parseInt(toleranceSlider.value);
  const feather   = parseInt(featherSlider.value);
  const speed     = parseFloat(speedSlider.value);
  const [r0, g0, b0] = hexToRgb(bgColorInput.value);
  
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
    const resp = await fetch('/vendor/gif.worker.js');
    const blob = await resp.blob();
    workerBlobUrl = URL.createObjectURL(blob);
  } catch (e) {
    console.warn('Không tải được worker script:', e);
  }
  if (job.cancelled) { if (workerBlobUrl) URL.revokeObjectURL(workerBlobUrl); return; }

  const gifCanvas = superGif.get_canvas();
  const W = gifCanvas.width;
  const H = gifCanvas.height;
  const crop = getTransform() || { x: 0, y: 0, w: W, h: H, outW: W, outH: H };
  const outW = Math.max(2, Math.round(crop.outW * outScale));
  const outH = Math.max(2, Math.round(crop.outH * outScale));

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width  = W;
  tmpCanvas.height = H;
  const tmpCtx = tmpCanvas.getContext('2d', { willReadFrequently: true });

  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = outW;
  scaledCanvas.height = outH;
  const scaledCtx = scaledCanvas.getContext('2d', { willReadFrequently: true });

  const processedFrames = [];

  for (let i = 0; i < frameCount; i++) {
    if (job.cancelled) { if (workerBlobUrl) URL.revokeObjectURL(workerBlobUrl); return; }
    superGif.move_to(i);
    const src = superGif.get_canvas();

    // Copy frame to temp canvas
    tmpCtx.clearRect(0, 0, W, H);
    tmpCtx.drawImage(src, 0, 0);

    // Get pixel data and remove background
    const imgData = tmpCtx.getImageData(0, 0, W, H);
    removeBackground(imgData.data, r0, g0, b0, tolerance, feather, W, H, customSeeds);

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
  const gifOpts: any = {
    workers: workerBlobUrl ? 2 : 0,
    quality: gifQuality,
    width:   outW,
    height:  outH,
    transparent: transparentKey,
  };
  if (workerBlobUrl) gifOpts.workerScript = workerBlobUrl;
  const gif = new GIF(gifOpts);
  job.gif = gif;
  job.cleanup = () => { if (workerBlobUrl) URL.revokeObjectURL(workerBlobUrl); };

  let outputFrameCount = 0;
  for (let i = 0; i < processedFrames.length; i++) {
    if (job.cancelled) { if (workerBlobUrl) URL.revokeObjectURL(workerBlobUrl); return; }
    if (i % frameSkip !== 0) continue; // skip frames for size reduction
    const { imgData, delay } = processedFrames[i];
    const frameDelay = Math.max(20, Math.round(delay * frameSkip));

    // Scale/crop while alpha is intact; apply GIF transparency key afterwards.
    tmpCtx.putImageData(imgData, 0, 0);
    scaledCtx.clearRect(0, 0, outW, outH);
    scaledCtx.drawImage(tmpCanvas, crop.x, crop.y, crop.w, crop.h, 0, 0, outW, outH);
    const scaledPx = scaledCtx.getImageData(0, 0, outW, outH);
    applyGifTransparencyKey(scaledPx.data, transparentKey);
    scaledCtx.putImageData(scaledPx, 0, 0);
    gif.addFrame(scaledCanvas, { delay: frameDelay, copy: true });

    outputFrameCount++;
    updateProgress(60 + Math.round(((i + 1) / processedFrames.length) * 20), `Chuẩn bị frame ${i + 1} / ${frameCount}`);
    if (i % 5 === 0) await sleep(0);
  }

  updateProgress(85, 'Đang mã hóa GIF...');
  frameInfo.textContent = `Đang mã hóa ${frameCount} frames...`;

  gif.on('progress', p => updateProgress(85 + Math.round(p * 14), 'Đang mã hóa GIF...'));

  gif.on('finished', blob => {
    if (job.cancelled) return;
    finishJob(job);
    if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    resultBlobUrl = URL.createObjectURL(blob);

    showSynchronizedGifPreviews(sourceBlobUrl, resultBlobUrl);
    placeholderResult.style.display = 'none';
    const scaleInfo = outScale < 1 ? ` · ${Math.round(outScale * 100)}% kích thước` : '';
    resultMeta.textContent = `${formatBytes(blob.size)} · ${outputFrameCount} frames${scaleInfo}`;
    if (blob.size > 1_000_000) {
      showToast(t('toastGifLargeWarning', { size: formatBytes(blob.size) }), 'info');
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
    if (job.cancelled) return;
    finishJob(job);
    console.error('gif.js error:', err);
    if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }
    progressSection.classList.add('hidden');
    processBtn.disabled = false;
    showToast(t('toastGifEncodeError', { err: err?.message || err }), 'error');
  });

  if (!job.cancelled) gif.render();
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
      removeBackground(imgData.data, r0, g0, b0, tolerance, feather, W, H, customSeeds);
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
  if (frameFilmstripCount) frameFilmstripCount.textContent = `${gifFrames.length} ${t('framesCount')}`;

  gifFrames.forEach((frame, idx) => {
    const item = document.createElement('div');
    item.className = 'filmstrip-item' + (idx === activeFrameIndex ? ' active' : '');
    item.id = `filmstripItem-${idx}`;
    item.draggable = true;
    item.addEventListener('dragstart', event => {
      event.dataTransfer.setData('text/plain', String(idx));
      event.dataTransfer.effectAllowed = 'move';
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
    item.addEventListener('dragover', event => event.preventDefault());
    item.addEventListener('drop', event => {
      event.preventDefault();
      const from = Number(event.dataTransfer.getData('text/plain'));
      if (!Number.isInteger(from) || from < 0 || from >= gifFrames.length || from === idx) return;
      const activeFrame = gifFrames[activeFrameIndex];
      const [moved] = gifFrames.splice(from, 1);
      gifFrames.splice(idx, 0, moved);
      deletedFramesStack = [];
      updateTimelineUndoBtn();
      activeFrameIndex = gifFrames.indexOf(activeFrame);
      renderFilmstrip();
      setActiveFrame(activeFrameIndex);
    });

    // Quick delete button on hover
    const delBtn = document.createElement('button');
    delBtn.className = 'filmstrip-del-btn';
    delBtn.title = t('frameDeleteTitle');
    delBtn.setAttribute('aria-label', `Delete frame ${idx + 1}`);
    delBtn.innerHTML = '<svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteFrame(idx);
    });

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
    label.textContent = `#${idx + 1} · ${frame.delay}ms`;

    item.appendChild(delBtn);
    item.appendChild(thumbWrap);
    item.appendChild(label);

    item.addEventListener('click', () => setActiveFrame(idx));
    frameFilmstrip.appendChild(item);
  });
}

function updateTimelineUndoBtn() {
  if (!frameRestoreBtn) return;
  const count = deletedFramesStack.length;
  frameRestoreBtn.disabled = (count === 0);
  frameRestoreBtn.style.opacity = (count === 0) ? '0.5' : '1';
  frameRestoreBtn.style.pointerEvents = (count === 0) ? 'none' : 'auto';
  const textEl = el('frameRestoreBtnText');
  if (textEl) {
    textEl.textContent = count > 0 
      ? `${t('frameRestoreBtn')} (${count})` 
      : t('frameRestoreBtn');
  }
}

function restoreDeletedFrame() {
  if (!deletedFramesStack || deletedFramesStack.length === 0) {
    showToast(t('toastNoDeletedFrames') || 'Không có frame nào để khôi phục!', 'info');
    return;
  }
  const item = deletedFramesStack.pop();
  const restoreIdx = Math.min(item.index, gifFrames.length);
  gifFrames.splice(restoreIdx, 0, item.frame);

  renderFilmstrip();
  setActiveFrame(restoreIdx);
  updateTimelineUndoBtn();
  showToast(t('toastFrameDeleteUndo', { idx: restoreIdx + 1 }), 'success');
}

function deleteFrame(idx) {
  if (!gifFrames || gifFrames.length <= 1) {
    showToast(t('toastMinFramesError'), 'warning');
    return;
  }
  if (idx < 0 || idx >= gifFrames.length) return;

  const deletedNum = idx + 1;
  const deletedFrame = gifFrames[idx];
  deletedFramesStack.push({ frame: deletedFrame, index: idx });
  gifFrames.splice(idx, 1);

  if (activeFrameIndex >= gifFrames.length) {
    activeFrameIndex = gifFrames.length - 1;
  } else if (activeFrameIndex > idx) {
    activeFrameIndex--;
  }

  renderFilmstrip();
  setActiveFrame(activeFrameIndex);
  updateTimelineUndoBtn();
  showToast(t('toastFrameDeleted', { idx: deletedNum }), 'info');
}

function updateThumbnail(idx) {
  const canvas = el(`filmstripCanvas-${idx}`);
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

  const activeItem = el(`filmstripItem-${idx}`);
  if (activeItem) {
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  drawActiveFrame();

  if (frameEditorIndexBadge) frameEditorIndexBadge.textContent = `Frame ${idx + 1} / ${gifFrames.length}`;
  if (frameCounterNav) frameCounterNav.textContent = `${idx + 1} / ${gifFrames.length}`;
  if (frameEditorDelayBadge) frameEditorDelayBadge.textContent = `Delay: ${gifFrames[idx].delay}ms`;
  if (frameDelayInput) frameDelayInput.value = gifFrames[idx].delay;
}

frameDelayInput?.addEventListener('change', () => {
  const frame = gifFrames[activeFrameIndex];
  if (!frame) return;
  frame.delay = Math.max(20, Math.min(60000, Math.round(Number(frameDelayInput.value) || 100)));
  frameDelayInput.value = frame.delay;
  if (frameEditorDelayBadge) frameEditorDelayBadge.textContent = `Delay: ${frame.delay}ms`;
  const label = q(`#filmstripItem-${activeFrameIndex} .filmstrip-label`);
  if (label) label.textContent = `#${activeFrameIndex + 1} · ${frame.delay}ms`;
});

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
      if (frameZoomVal) frameZoomVal.textContent = `${Math.round(appliedScale * 100)}% (${t('frameZoomFit')})`;
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
      btn.classList.toggle('active', (btn as HTMLElement).dataset.zoom === 'fit');
    } else {
      btn.classList.toggle('active', Math.abs((parseFloat((btn as HTMLElement).dataset.zoom) || 0) - zoomNumeric) < 0.05);
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
  drawGifText(ctx, W, H, 1);

  applyCanvasZoom();
}

function drawGifText(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
  const value = (el('gifTextInput') as HTMLInputElement)?.value.trim();
  if (!value) return;
  const size = Math.max(8, Math.min(200, Number((el('gifTextSize') as HTMLInputElement).value) || 36)) * scale;
  const position = (el('gifTextPosition') as HTMLSelectElement).value;
  const color = (el('gifTextColor') as HTMLInputElement).value;
  ctx.save();
  let fontSize = Math.min(size, height * 0.45);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  do {
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    if (ctx.measureText(value).width <= width * 0.9) break;
    fontSize -= 1;
  } while (fontSize > 8);
  const y = position === 'top' ? fontSize * 0.8 : position === 'center' ? height / 2 : height - fontSize * 0.8;
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, fontSize / 9);
  ctx.strokeStyle = 'rgba(0,0,0,.85)';
  ctx.fillStyle = color;
  ctx.strokeText(value, width / 2, y, width * 0.9);
  ctx.fillText(value, width / 2, y, width * 0.9);
  ctx.restore();
}

['gifTextInput', 'gifTextSize', 'gifTextColor', 'gifTextPosition'].forEach(id => {
  el(id)?.addEventListener('input', drawActiveFrame);
});

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
    currentFrameTool = (e.target as HTMLInputElement).value;
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
    const z = (btn as HTMLElement).dataset.zoom;
    if (z === 'fit') {
      currentZoom = 'fit';
    } else {
      currentZoom = parseFloat(z) || 1;
    }
    applyCanvasZoom();
  });
});

window.addEventListener('keydown', e => {
  if (e.code === 'Space' && !(e.target as Element).matches('input, textarea, select, [contenteditable]')) {
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

// 1. Undo cho XÓA NỀN (Wand / Eraser trên canvas)
if (frameUndoBtn) {
  frameUndoBtn.addEventListener('click', () => {
    const frame = gifFrames[activeFrameIndex];
    if (!frame || !frame.history || frame.history.length === 0) {
      showToast(t('toastNoUndo'), 'info');
      return;
    }
    frame.currentImageData = frame.history.pop();
    drawActiveFrame();
    updateThumbnail(activeFrameIndex);
    showToast(t('toastUndid'), 'success');
  });
}

// 2. Xóa và Undo cho FRAMES TIMELINE
if (frameDeleteBtn) {
  frameDeleteBtn.addEventListener('click', () => {
    deleteFrame(activeFrameIndex);
  });
}

if (frameRestoreBtn) {
  frameRestoreBtn.addEventListener('click', () => {
    restoreDeletedFrame();
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
    showToast(t('toastFrameReset'), 'info');
  });
}

if (frameApplyAllBtn) {
  frameApplyAllBtn.addEventListener('click', () => {
    if (!lastWandPoint) {
      showToast(t('toastClickPointFirst'), 'error');
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
    showToast(t('toastApplyAllSuccess', { x, y, count: gifFrames.length }), 'success');
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
  } else if ((e.ctrlKey || e.metaKey) && (e.shiftKey) && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault();
    restoreDeletedFrame();
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault();
    frameUndoBtn.click();
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (!(e.target as Element).matches('input, textarea, select, [contenteditable]')) {
      e.preventDefault();
      deleteFrame(activeFrameIndex);
    }
  }
});

async function exportEditedGif() {
  if (!gifFrames || gifFrames.length === 0) {
    showToast(t('toastNoFramesToExport'), 'error');
    return;
  }
  const job = beginJob();

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
    const crop = getTransform() || { x: 0, y: 0, w: W, h: H, outW: W, outH: H };
    const outW = Math.max(1, Math.round(crop.outW * outScale));
    const outH = Math.max(1, Math.round(crop.outH * outScale));

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
      if (job.cancelled) return;
      const frame = gifFrames[i];
      tmpCtx.putImageData(frame.currentImageData, 0, 0);

      scaledCtx.clearRect(0, 0, outW, outH);
      scaledCtx.drawImage(tmpCanvas, crop.x, crop.y, crop.w, crop.h, 0, 0, outW, outH);
      drawGifText(scaledCtx, outW, outH, outW / crop.w);

      const delay = Math.max(20, Math.round(frame.delay / speed));
      exportFrames.push({
        imgData: scaledCtx.getImageData(0, 0, outW, outH),
        delay
      });
      updateProgress(Math.round(((i + 1) / gifFrames.length) * 50), `Chuẩn bị frame ${i + 1}/${gifFrames.length}`);
      if (i % 5 === 0) await sleep(0);
    }

    const transparentKey = chooseGifTransparencyKey(exportFrames);
    const workerUrl = await getGifWorkerUrl();
    if (job.cancelled) { if (workerUrl) URL.revokeObjectURL(workerUrl); return; }
    const gif = new window.GIF({
      workers: workerUrl ? 2 : 0,
      workerScript: workerUrl || undefined,
      quality: preset.quality,
      width: outW,
      height: outH,
      transparent: transparentKey,
      repeat: 0
    });
    job.gif = gif;
    job.cleanup = () => { if (workerUrl) URL.revokeObjectURL(workerUrl); };

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
      if (job.cancelled) return;
      finishJob(job);
      if (workerUrl) URL.revokeObjectURL(workerUrl);
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
      resultBlobUrl = URL.createObjectURL(blob);

      resultImg.src = resultBlobUrl;
      resultImg.classList.remove('hidden');
      resultVideo.classList.add('hidden');
      placeholderResult.style.display = 'none';
      resultMeta.textContent = `GIF đã sửa · ${exportFrames.length} khung hình · ${formatBytes(blob.size)}`;

      updateProgress(100, 'Hoàn tất!');
      progressSection.classList.add('hidden');
      if (successBadgeText) successBadgeText.textContent = t('successFrameExport');
      downloadBtnText.textContent = t('downloadEditedGif');
      downloadSection.classList.remove('hidden');
      downloadSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      frameEditorExportBtn.disabled = false;
      showToast(t('toastExportSuccess'), 'success');
    });

    gif.on('error', err => {
      if (job.cancelled) return;
      finishJob(job);
      if (workerUrl) URL.revokeObjectURL(workerUrl);
      progressSection.classList.add('hidden');
      frameEditorExportBtn.disabled = false;
      showToast(t('toastExportError', { err: err.message || err }), 'error');
    });
    if (!job.cancelled) gif.render();

  } catch (err) {
    if (job.cancelled) return;
    finishJob(job);
    console.error(err);
    progressSection.classList.add('hidden');
    frameEditorExportBtn.disabled = false;
    showToast(t('toastExportError', { err: err.message || err }), 'error');
  }
}

if (frameEditorExportBtn) {
  frameEditorExportBtn.addEventListener('click', exportEditedGif);
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function beginJob() {
  if (activeJob) cancelProcessing(true);
  activeJob = { cancelled: false, gif: null, ffmpeg: false };
  el('cancelProcessingBtn').classList.remove('hidden');
  return activeJob;
}

function finishJob(job) {
  if (activeJob === job) {
    activeJob = null;
    el('cancelProcessingBtn').classList.add('hidden');
  }
}

function cancelProcessing(silent = false) {
  const job = activeJob;
  if (!job) return;
  job.cancelled = true;
  if (job.gif) job.gif.abort();
  if (job.cleanup) job.cleanup();
  if (job.ffmpeg && ffmpegInstance) {
    ffmpegInstance.terminate();
    ffmpegInstance = null;
    ffmpegLoaded = false;
  }
  activeJob = null;
  progressSection.classList.add('hidden');
  el('cancelProcessingBtn').classList.add('hidden');
  [processBtn, img2gifConvertBtn, videoToGifConvertBtn, frameEditorExportBtn, editVideoBtn, muteVideoBtn].forEach(btn => { if (btn) btn.disabled = false; });
  if (!silent) showToast(currentLang === 'vi' ? 'Đã hủy xử lý.' : 'Processing cancelled.', 'info');
}

el('cancelProcessingBtn').addEventListener('click', () => cancelProcessing());

function updateProgress(pct, label) {
  progressFill.style.width = pct + '%';
  progressPct.textContent  = pct + '%';
  if (label) progressLabel.textContent = label;
}

function resetAll() {
  if (activeJob) cancelProcessing(true);
  batchFiles = [];
  staticResultType = 'image/png';
  setTransformSource(0, 0);
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
  if (videoToGifUrl) { URL.revokeObjectURL(videoToGifUrl); videoToGifUrl = null; }
  if (editedVideoBlobUrl) { URL.revokeObjectURL(editedVideoBlobUrl); editedVideoBlobUrl = null; }
  editedVideoName = '';
  editVideoClips = [];
  resetJoinPreview();
  editClipRanges.clear();
  editUndoStack.length = 0;
  editRedoStack.length = 0;
  updateEditHistoryButtons();
  timelineLoadToken++;
  timelineMedia.clear();
  timelineMediaFailed.clear();
  el('editTimelineFrames').replaceChildren();
  editVideoMode = 'trim';
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
  deletedFramesStack = [];
  updateTimelineUndoBtn();
  activeFrameIndex = 0;
  lastWandPoint = null;
  lastProcessedFrames = null;
  currentZoom = 'fit';
  zoomNumeric = 1;
  q('.app-wrapper')?.classList.remove('frame-editor-mode');
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
  editVideoBtn.disabled = true;
  el('editVideoFileName').textContent = '';
  editClipList.replaceChildren();
  setEditVideoMode('trim');
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
  if (currentTab === 'editVideo') {
    if (!editedVideoBlobUrl) return;
    const a = document.createElement('a');
    a.href = editedVideoBlobUrl;
    a.download = editedVideoName || 'edited_video.mp4';
    a.click();
    return;
  }
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
  
  if (currentTab === 'imgToGif') {
    let baseName = 'animation';
    if (img2gifCurrentMode === 'original' && currentFile) {
      baseName = currentFile.name.replace(/\.[^/.]+$/, '');
    } else if (img2gifImages.length > 0 && img2gifImages[0]?.file?.name) {
      baseName = img2gifImages[0].file.name.replace(/\.[^/.]+$/, '');
    } else if (currentFile) {
      baseName = currentFile.name.replace(/\.[^/.]+$/, '');
    }
    a.download = baseName + '.gif';
  }
  else if (currentTab === 'videoToGif') {
    const baseName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'result';
    a.download = baseName + '.gif';
  }

  else if (isStaticImage) {
    const baseName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'result';
    const ext = staticResultType === 'image/webp' ? 'webp' : staticResultType === 'image/jpeg' ? 'jpg' : 'png';
    a.download = `${baseName}_no_bg.${ext}`;
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
  q('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${msg}</span>`;
  document.body.appendChild(toast);
  if (!el('toast-styles')) {
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


// ─── Dynamic Interactive Canvas Scene ─────────────────────────────────────────
(function initDynamicBackground() {
  const canvas = el('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = [
    'rgba(168, 85, 247, ', // purple
    'rgba(56, 189, 248, ',  // cyan/sky
    'rgba(244, 114, 182, ', // pink
    'rgba(129, 140, 248, ', // indigo
    'rgba(255, 255, 255, '  // star white
  ];

  const particleCount = Math.min(80, Math.max(40, Math.floor((width * height) / 16000)));
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
      baseAlpha: Math.random() * 0.45 + 0.2,
      alpha: 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulseSpeed: Math.random() * 0.02 + 0.008,
      pulseAngle: Math.random() * Math.PI * 2
    });
  }

  let mouse = { x: -1000, y: -1000, radius: 130 };

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  function render() {
    if (document.hidden) {
      requestAnimationFrame(render);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse repulsion
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        p.x -= Math.cos(angle) * force * 2.5;
        p.y -= Math.sin(angle) * force * 2.5;
      }

      // Movement
      p.x += p.vx;
      p.y += p.vy;

      // Screen wrap
      if (p.x < -10) p.x = width + 10;
      else if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      else if (p.y > height + 10) p.y = -10;

      // Pulsing alpha
      p.pulseAngle += p.pulseSpeed;
      p.alpha = Math.max(0.1, p.baseAlpha + Math.sin(p.pulseAngle) * 0.2);

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();

      // Connect close particles with delicate light threads
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < 110) {
          const lineAlpha = (1 - d / 110) * 0.16;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${lineAlpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();

// Initialize default language
setLanguage(currentLang);

}
