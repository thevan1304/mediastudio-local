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
const mainActions       = document.getElementById('mainActions');
let currentTab = 'bgRemove';

// ─── i18n ─────────────────────────────────────────────────────────────────────
const LANGS = {
  en: { flag: 'https://flagcdn.com/w20/gb.png', flag2x: 'https://flagcdn.com/w40/gb.png', name: 'English' },
  vi: { flag: 'https://flagcdn.com/w20/vn.png', flag2x: 'https://flagcdn.com/w40/vn.png', name: 'Ti\u1EBFng Vi\u1EC7t' },
};

const I18N = {
  en: {
    heroTitle: 'All-in-One Image, GIF & Video Processing',
    heroSub: 'Background Removal \xB7 Frame-by-frame Editor \xB7 Video to GIF \xB7 Mute Video \xB7 100% Local',
    tabBgRemove: 'Remove Background', tabFrameEditor: 'Frame Editor', tabAnimate: 'Animate Effect',
    tabImgToGif: 'Images to GIF', tabVideoToGif: 'Video to GIF', tabMuteVideo: 'Mute Video',
    dropTitle: 'Drag & drop image, GIF, or video here', dropSub: 'or',
    browseBtn: 'Choose Image / GIF / Video',
    dropInfo: 'Supports JPG, PNG, WEBP, GIF, MP4, WebM, MOV \xB7 Processed right in your browser',
    previewOriginal: 'Original', previewResult: 'Result',
    originalWrapTitle: 'Click on trapped background area to remove',
    manualSeedHintText: 'Click on enclosed background areas to remove manually',
    placeholderBgRemove: 'Click <strong>Remove Background</strong> to see result',
    placeholderAnimate: 'Click <strong>Generate Animated GIF</strong> to see result',
    placeholderImgToGif: 'Click <strong>Create GIF</strong> to see result',
    placeholderVideoToGif: 'Click <strong>Convert Video to GIF</strong> to see result',
    placeholderMuteVideo: 'Click <strong>Mute Video</strong> to see result',
    bgColorLabel: 'Background color to remove',
    eyedropBtnTitle: 'Pick color from image', eyedropBtn: 'Pick Color',
    eyedropHint: 'Click on original image to pick background color',
    toleranceLabel: 'Tolerance:', tolerancePrecise: 'Precise', toleranceWider: 'Wider',
    featherLabel: 'Feather edge:', featherSharp: 'Sharp', featherSmooth: 'Smooth',
    removeIslandsLabel: 'Remove enclosed gaps (holes)',
    removeIslandsHint: 'Careful: may remove details inside the subject (eyes, hands, text...)',
    speedLabel: 'GIF Speed:', speedSlow: 'Slow', speedFast: 'Fast',
    compressLabel: 'Compress GIF:', compressHighQuality: 'High Quality', compressSmallSize: 'Small Size',
    compressHint: '100% size \xB7 Maximum quality (recommended for white/solid backgrounds)',
    compressLabels: [
      ['No compression', '100% size \xB7 Maximum quality'],
      ['Light', '100% size \xB7 Light color compression \xB7 ~70\u201380% file size'],
      ['Medium', 'Scale 75% \xB7 Good quality \xB7 ~40\u201350% file size'],
      ['Heavy', 'Scale 50% \xB7 Drop 1/2 frames \xB7 ~15\u201325% file size'],
      ['Maximum', 'Scale 50% \xB7 Drop 2/3 frames \xB7 Smallest possible'],
    ],
    chooseAnotherFile: 'Choose another file',
    processBtnText: 'Remove Background', processBtnTextImg: 'Remove Image Background', processBtnTextGif: 'Remove GIF Background',
    animEffectLabel: 'Effect',
    effectWobble: 'Wobble', effectPulse: 'Pulse', effectBounce: 'Bounce', effectSpin: 'Spin', effectFloat: 'Float',
    animIntensityLabel: 'Intensity:', animIntensityMild: 'Mild', animIntensityStrong: 'Strong',
    animSpeedLabel: 'Speed:', animBtnText: 'Generate Animated GIF',
    img2gifDropTitle: 'Drag & drop multiple images here',
    img2gifDropSub: 'Supports PNG, JPG, JPEG, WEBP, BMP...',
    img2gifBrowseBtn: 'Choose Images', img2gifDelayLabel: 'Delay per image:', img2gifSizeLabel: 'Export Size',
    img2gifSizeOriginal: 'Original', img2gifSizeHalf: 'Scale 50%', img2gifSizeCustom: 'Custom',
    img2gifWidthPlaceholder: 'Width (px)', img2gifHeightPlaceholder: 'Height (px)',
    img2gifQualityLabel: 'GIF Quality', qualityHigh: 'High', qualityMedium: 'Medium',
    qualityLowLight: 'Low (Light)', qualityLowFast: 'Low (Fast)', infiniteLoop: 'Infinite Loop',
    img2gifClearBtn: 'Clear All', img2gifConvertBtn: 'Create GIF from Images',
    img2gifSelectedHint: 'images selected \u2014 drag to reorder',
    videoFpsLabel: 'Frame Rate (FPS):', videoFpsLight: 'Light (5\u20138)', videoFpsRecommended: 'Recommended (10)', videoFpsSmooth: 'Smooth (20)',
    videoSizeLabel: 'Export Size',
    videoSize30: 'Scale 30% (~240p \xB7 Ultra light)', videoSize50: 'Scale 50% (~380p \xB7 Standard)', videoSizeOrig: 'Original (Very heavy)',
    videoDurationLabel: 'Video Segment (Duration)',
    videoDurationAll: 'Entire video', videoDuration3: 'First 3 seconds', videoDuration5: 'First 5 seconds', videoDurationCustom: 'Custom range',
    videoRangeFrom: 'From:', videoRangeTo: 's to:', videoColorLabel: 'GIF Color Quality',
    videoConvertBtn: 'Convert Video to GIF',
    muteLabel: 'Remove all audio tracks from video', muteBtn: 'Mute Video',
    frameWandTool: '\uD83E\uDE84 Wand (Click area)', frameEraserTool: '\uD83D\uDD8C\uFE0F Eraser',
    frameBrushSizeLabel: 'Brush Size:',
    frameUndoBtn: 'Undo', frameUndoTitle: 'Undo last action (Ctrl+Z)',
    frameApplyAllBtn: '\uD83C\uDF10 Apply to All Frames', frameApplyAllTitle: 'Erase this color at same position across ALL frames',
    frameResetBtn: 'Reset Frame', frameResetTitle: 'Restore this frame',
    frameZoomTitle: 'Zoom:', frameZoomOutTitle: 'Zoom out (\u2212)', frameZoomInTitle: 'Zoom in (+)',
    frameZoomFit: 'Fit View', frameZoomFitTitle: 'Auto fit to screen', frameZoomOrigTitle: 'Original size 100%',
    frameZoomTip: '\uD83D\uDCA1 Select <strong>Fit View</strong> or <strong>200%\u2013300%</strong> to easily edit fine details',
    framePrevBtn: '\u25C4 Prev Frame', framePrevBtnTitle: 'Previous frame (Left arrow)',
    frameNextBtn: 'Next Frame \u25BA', frameNextBtnTitle: 'Next frame (Right arrow)',
    frameEditorTip: '\uD83D\uDCA1 <strong>Tip:</strong> Click on color area to erase. Hold <strong>Space</strong> and drag to pan when zoomed in.',
    frameFilmstripTitle: 'Frames timeline (Click frame to edit):',
    frameExportBtn: 'Re-create GIF from Edited Frames',
    progressLabelDefault: 'Processing frames...',
    successBgRemoved: 'Background removed successfully!', successAnimated: 'Animated GIF generated!',
    successImgToGif: 'GIF created successfully!', successVideoToGif: 'Video converted to GIF!',
    successMuted: 'Audio removed successfully!', successFrameExport: 'GIF updated successfully!',
    downloadResult: 'Download Result', downloadImage: 'Download Image', downloadGif: 'Download GIF',
    downloadMutedVideo: 'Download Muted Video', downloadEditedGif: 'Download Edited GIF',
    feat1Title: '100% Private', feat1Desc: 'All processing runs entirely in your browser. No files are ever uploaded to any server \u2014 your data stays yours.',
    feat2Title: 'Instant Processing', feat2Desc: 'Optimized frame-by-frame algorithms deliver results in seconds, even for large GIFs and long video clips.',
    feat3Title: 'Precise Controls', feat3Desc: 'Dial in the exact result with adjustable tolerance, edge feathering, manual seed points, and compression levels.',
    feat4Title: 'Multi-Format Support', feat4Desc: 'Works with JPG, PNG, WEBP, GIF, MP4, WebM and MOV. Edit frames, convert to GIF, or remove audio \u2014 all in one place.',
    feat5Title: 'Export Ready', feat5Desc: 'Download transparent GIFs, optimized images, muted videos, or animated effects instantly \u2014 no account or sign-up needed.',
    footerText: 'MediaStudio \xB7 100% Client-Side \xB7 No Internet Connection Required',
    toastSelectValidFile: 'Please select an image, GIF, or video file!',
    toastSeedAdded: 'Added erase point!', toastColorSelected: 'Selected color {hex}',
    toastLoadedFrames: 'Loaded {count} frames!', toastErrorGif: 'Error reading GIF: {err}',
    toastLoadedImage: 'Image loaded successfully!', toastErrorImage: 'Error reading image!',
    toastBgRemoved: 'Background removed successfully! \uD83C\uDF89',
    toastAnimateStaticOnly: 'Animate effect only supports static images, not GIFs!',
    toastDropImagesOnly: 'Please drop image files!',
    toastAtLeastTwoImages: 'Please add at least 2 images!',
    toastGifCreated: 'GIF created successfully! \uD83C\uDF89',
    toastErrorCreateGif: 'Error creating GIF: {err}',
    toastLoadedVideo: 'Video loaded successfully!', toastVideoNotSupported: 'Browser does not support this video format.',
    toastSelectVideoFirst: 'Please select a video first!',
    toastVideoToGifSuccess: 'Converted video to GIF successfully! \uD83C\uDF89',
    toastVideoToGifError: 'Error converting video: {err}',
    toastMuteSuccess: 'Audio removed successfully! \uD83C\uDF89', toastMuteError: 'Error removing audio: {err}',
    toastGifLargeWarning: 'GIF larger than 1MB ({size}). Increase compression to reduce size!',
    toastGifEncodeError: 'Error encoding GIF: {err}',
    toastNoUndo: 'Nothing to undo on this frame!', toastUndid: 'Undid action on this frame!',
    toastFrameReset: 'Reset this frame to original!',
    toastClickPointFirst: 'Please click to erase an area on the frame first, then Apply to All Frames!',
    toastApplyAllSuccess: 'Applied area erase at ({x}, {y}) across all {count} frames! \uD83C\uDF89',
    toastNoFramesToExport: 'No frames to export!',
    toastExportSuccess: 'Exported GIF from edited frames successfully! \uD83C\uDF89',
    toastExportError: 'Error exporting GIF: {err}',
    reading: 'reading...', framesCount: 'frames', readingVideo: 'reading video...', secondsUnit: 'seconds',
    videoEstimate: '\u26A1 Estimated: ~{frames} frames ({w}\xD7{h}px \xB7 ~{size})',
    confirmManyFrames: 'This video will generate {count} frames and may take a while. Continue?',
    encodingFrames: 'Encoding {count} frames...', preparingFrame: 'Preparing frame {i} / {total}',
    extractingFrame: 'Extracting frame {i}/{total}', processingFrame: 'Processing frame {i} / {total}',
    processingImage: 'Processing image...', preparingVideo: 'Preparing video file...',
    loadingVideo: 'Loading video into memory...', removingAudio: 'Removing audio from video...',
    finalizingVideo: 'Finalizing video...', preparingFrames: 'Preparing frames...',
    preparing: 'Preparing...', processing: 'Processing...', creating: 'Creating frames...', combining: 'Combining GIF...',
  },
  vi: {
    heroTitle: 'X\u1EED l\xFD \u1EA2nh, GIF & Video \u0111a n\u0103ng tr\xEAn tr\xECnh duy\u1EC7t',
    heroSub: 'X\xF3a n\u1EC1n \xB7 S\u1EEDa t\u1EEDng frame \xB7 Video sang GIF \xB7 T\u1EAFt ti\u1EBFng video \xB7 100% Local',
    tabBgRemove: 'X\xF3a n\u1EC1n', tabFrameEditor: 'S\u1EEDa t\u1EEDng Frame', tabAnimate: 'T\u1EA1o hi\u1EC7u \u1EE9ng (Animate)',
    tabImgToGif: '\u1EA2nh sang GIF', tabVideoToGif: 'Video sang GIF', tabMuteVideo: 'X\xF3a \xE2m thanh',
    dropTitle: 'K\xE9o th\u1EA3 file \u1EA3nh, GIF ho\u1EB7c video v\xE0o \u0111\xE2y', dropSub: 'ho\u1EB7c',
    browseBtn: 'Ch\u1ECDn file \u1EA2nh/GIF/Video',
    dropInfo: 'H\u1ED7 tr\u1EE3 JPG, PNG, WEBP, GIF, MP4, WebM, MOV \xB7 X\u1EED l\xFD ngay tr\xEAn m\xE1y b\u1EA1n',
    previewOriginal: 'G\u1ED1c', previewResult: 'K\u1EBFt qu\u1EA3',
    originalWrapTitle: 'Click v\xE0o v\xF9ng n\u1EC1n b\u1ECB k\u1EB9t \u0111\u1EC3 x\xF3a',
    manualSeedHintText: 'Click v\xE0o v\xF9ng n\u1EC1n l\u1ECDt th\u1ECDm \u0111\u1EC3 x\xF3a th\u1EE7 c\xF4ng',
    placeholderBgRemove: 'Nh\u1EA5n <strong>X\xF3a n\u1EC1n</strong> \u0111\u1EC3 xem k\u1EBFt qu\u1EA3',
    placeholderAnimate: 'Nh\u1EA5n <strong>T\u1EA1o GIF chuy\u1EC3n \u0111\u1ED9ng</strong> \u0111\u1EC3 xem k\u1EBFt qu\u1EA3',
    placeholderImgToGif: 'Nh\u1EA5n <strong>Chuy\u1EC3n sang GIF</strong> \u0111\u1EC3 xem k\u1EBFt qu\u1EA3',
    placeholderVideoToGif: 'Nh\u1EA5n <strong>Chuy\u1EC3n video sang GIF</strong> \u0111\u1EC3 xem k\u1EBFt qu\u1EA3',
    placeholderMuteVideo: 'Nh\u1EA5n <strong>X\xF3a \xE2m thanh</strong> \u0111\u1EC3 xem k\u1EBFt qu\u1EA3',
    bgColorLabel: 'M\xE0u n\u1EC1n c\u1EA7n x\xF3a',
    eyedropBtnTitle: 'Ch\u1ECDn m\xE0u t\u1EEB \u1EA3nh', eyedropBtn: 'H\xFAt m\xE0u',
    eyedropHint: 'Nh\u1EA5p v\xE0o \u1EA3nh g\u1ED1c \u0111\u1EC3 ch\u1ECDn m\xE0u n\u1EC1n',
    toleranceLabel: '\u0110\u1ED9 nh\u1EA1y:', tolerancePrecise: 'Ch\xEDnh x\xE1c', toleranceWider: 'R\u1ED9ng h\u01A1n',
    featherLabel: 'L\xE0m m\u1EC1m vi\u1EC1n:', featherSharp: 'S\u1EAFc n\xE9t', featherSmooth: 'M\u1EC1m m\u1EA1i',
    removeIslandsLabel: 'X\xF3a n\u1EC1n l\u1ECDt th\u1ECDm (l\u1ED7 h\u1ED5ng)',
    removeIslandsHint: 'C\u1EA9n th\u1EADn: c\xF3 th\u1EC3 x\xF3a nh\u1EA7m chi ti\u1EBFt b\xEAn trong \u0111\u1ED1i t\u01B0\u1EE3ng (m\u1EAFt, tay, ch\u1EEF...)',
    speedLabel: 'T\u1ED1c \u0111\u1ED9 GIF:', speedSlow: 'Ch\u1EADm', speedFast: 'Nhanh',
    compressLabel: 'N\xE9n GIF:', compressHighQuality: 'Ch\u1EA5t l\u01B0\u1EE3ng cao', compressSmallSize: 'Dung l\u01B0\u1EE3ng nh\u1ECF',
    compressHint: '100% k\xEDch th\u01B0\u1EDBc \xB7 Ch\u1EA5t l\u01B0\u1EE3ng t\u1ED1i \u0111a (khuy\u1EBFn ngh\u1ECB cho n\u1EC1n tr\u1EAFng/\u0111\u01A1n m\xE0u)',
    compressLabels: [
      ['Kh\xF4ng n\xE9n', '100% k\xEDch th\u01B0\u1EDBc \xB7 Ch\u1EA5t l\u01B0\u1EE3ng t\u1ED1i \u0111a'],
      ['Nh\u1EB9', '100% k\xEDch th\u01B0\u1EDBc \xB7 M\xE0u \u0111\u01B0\u1EE3c n\xE9n nh\u1EB9 \xB7 ~70\u201380% dung l\u01B0\u1EE3ng'],
      ['Trung b\xECnh', 'Thu nh\u1ECF 75% \xB7 Ch\u1EA5t l\u01B0\u1EE3ng t\u1ED1t \xB7 ~40\u201350% dung l\u01B0\u1EE3ng'],
      ['M\u1EA1nh', 'Thu nh\u1ECF 50% \xB7 B\u1ECF 1/2 frame \xB7 ~15\u201325% dung l\u01B0\u1EE3ng'],
      ['T\u1ED1i \u0111a', 'Thu nh\u1ECF 50% \xB7 B\u1ECF 2/3 frame \xB7 Nh\u1ECF nh\u1EA5t c\xF3 th\u1EC3'],
    ],
    chooseAnotherFile: 'Ch\u1ECDn file kh\xE1c',
    processBtnText: 'X\xF3a n\u1EC1n \u1EA2nh/GIF', processBtnTextImg: 'X\xF3a n\u1EC1n \u1EA2nh', processBtnTextGif: 'X\xF3a n\u1EC1n GIF',
    animEffectLabel: 'Hi\u1EC7u \u1EE9ng (Effect)',
    effectWobble: 'L\u1EAFc l\u01B0', effectPulse: 'Nh\u1ECBp tim', effectBounce: 'N\u1EA3y l\xEAn', effectSpin: 'Xoay tr\xF2n', effectFloat: 'Bay b\u1ED5ng',
    animIntensityLabel: 'Bi\xEAn \u0111\u1ED9 (Intensity):', animIntensityMild: 'Nh\u1EB9', animIntensityStrong: 'M\u1EA1nh',
    animSpeedLabel: 'T\u1ED1c \u0111\u1ED9 (Speed):', animBtnText: 'T\u1EA1o GIF chuy\u1EC3n \u0111\u1ED9ng',
    img2gifDropTitle: 'K\xE9o th\u1EA3 nhi\u1EC1u \u1EA3nh v\xE0o \u0111\xE2y',
    img2gifDropSub: 'H\u1ED7 tr\u1EE3 PNG, JPG, JPEG, WEBP, BMP...',
    img2gifBrowseBtn: 'Ch\u1ECDn \u1EA3nh', img2gifDelayLabel: 'T\u1ED1c \u0111\u1ED9 m\u1ED7i \u1EA3nh:', img2gifSizeLabel: 'K\xEDch th\u01B0\u1EDBc xu\u1EA5t',
    img2gifSizeOriginal: 'Gi\u1EEF nguy\xEAn', img2gifSizeHalf: 'Thu nh\u1ECF 50%', img2gifSizeCustom: 'Tu\u1EF3 ch\u1EC9nh',
    img2gifWidthPlaceholder: 'R\u1ED9ng (px)', img2gifHeightPlaceholder: 'Cao (px)',
    img2gifQualityLabel: 'Ch\u1EA5t l\u01B0\u1EE3ng GIF', qualityHigh: 'Cao', qualityMedium: 'Trung b\xECnh',
    qualityLowLight: 'Th\u1EA5p (Nh\u1EB9)', qualityLowFast: 'Th\u1EA5p (Nhanh)', infiniteLoop: 'L\u1EB7p v\xF4 h\u1EA1n',
    img2gifClearBtn: 'X\xF3a t\u1EA5t c\u1EA3', img2gifConvertBtn: 'T\u1EA1o GIF t\u1EEB \u1EA3nh',
    img2gifSelectedHint: '\u1EA3nh \u0111\xE3 ch\u1ECDn \u2014 k\xE9o \u0111\u1EC3 s\u1EAFp x\u1EBFp l\u1EA1i',
    videoFpsLabel: 'T\u1ED1c \u0111\u1ED9 khung h\xECnh (FPS):',
    videoFpsLight: 'Nh\u1EB9 (5\u20138)', videoFpsRecommended: 'Khuy\xEAn d\xF9ng (10)', videoFpsSmooth: 'M\u01B0\u1EE3t (20)',
    videoSizeLabel: 'K\xEDch th\u01B0\u1EDBc xu\u1EA5t',
    videoSize30: 'Thu nh\u1ECF 30% (~240p \xB7 Si\xEAu nh\u1EB9)', videoSize50: 'Thu nh\u1ECF 50% (~380p \xB7 Chu\u1EA9n)', videoSizeOrig: 'Gi\u1EEF nguy\xEAn (R\u1EA5t n\u1EB7ng)',
    videoDurationLabel: '\u0110o\u1EA1n video chuy\u1EC3n \u0111\u1ED5i (Th\u1EDDi l\u01B0\u1EE3ng)',
    videoDurationAll: 'To\xE0n b\u1ED9 video', videoDuration3: '3 gi\xE2y \u0111\u1EA7u', videoDuration5: '5 gi\xE2y \u0111\u1EA7u', videoDurationCustom: 'T\xF9y ch\u1EC9nh gi\xE2y',
    videoRangeFrom: 'T\u1EEB:', videoRangeTo: 's \u0111\u1EBFn:', videoColorLabel: 'Ch\u1EA5t l\u01B0\u1EE3ng m\xE0u GIF',
    videoConvertBtn: 'Chuy\u1EC3n video sang GIF',
    muteLabel: 'X\xF3a to\xE0n b\u1ED9 \xE2m thanh kh\u1ECFi video', muteBtn: 'X\xF3a \xE2m thanh',
    frameWandTool: '\uD83E\uDE84 Click x\xF3a v\xF9ng', frameEraserTool: '\uD83D\uDD8C\uFE0F B\xFAt t\u1EA9y',
    frameBrushSizeLabel: 'C\u1EE1 c\u1ECD:',
    frameUndoBtn: 'Ho\xE0n t\xE1c', frameUndoTitle: 'Ho\xE0n t\xE1c thao t\xE1c v\u1EEBa r\u1ED3i (Ctrl+Z)',
    frameApplyAllBtn: '\uD83C\uDF10 \xC1p d\u1EE5ng cho m\u1ECDi Frame', frameApplyAllTitle: 'X\xF3a v\xF9ng m\xE0u n\xE0y \u1EDF c\xF9ng t\u1ECDa \u0111\u1ED9 tr\xEAn T\u1EA4T C\u1EA2 c\xE1c frame',
    frameResetBtn: 'Kh\xF4i ph\u1EE5c frame', frameResetTitle: 'Kh\xF4i ph\u1EE5c l\u1EA1i frame n\xE0y',
    frameZoomTitle: 'Thu ph\xF3ng:', frameZoomOutTitle: 'Thu nh\u1ECF (\u2212)', frameZoomInTitle: 'Ph\xF3ng to (+)',
    frameZoomFit: 'To v\u1EEDa khung', frameZoomFitTitle: 'T\u1EF1 \u0111\u1ED9ng ph\xF3ng to v\u1EEDa khung m\xE0n h\xECnh', frameZoomOrigTitle: 'K\xEDch th\u01B0\u1EDBc g\u1ED1c 100%',
    frameZoomTip: '\uD83D\uDCA1 Ch\u1ECDn <strong>To v\u1EEDa khung</strong> ho\u1EB7c <strong>200%\u2013300%</strong> \u0111\u1EC3 click x\xF3a c\xE1c chi ti\u1EBFt nh\u1ECF',
    framePrevBtn: '\u25C4 Frame tr\u01B0\u1EDBc', framePrevBtnTitle: 'Frame tr\u01B0\u1EDBc (Ph\xEDm \u2190)',
    frameNextBtn: 'Frame sau \u25BA', frameNextBtnTitle: 'Frame sau (Ph\xEDm \u2192)',
    frameEditorTip: '\uD83D\uDCA1 <strong>M\u1EB9o:</strong> Click chu\u1ED9t v\xE0o v\xF9ng m\xE0u mu\u1ED1n x\xF3a. Gi\u1EEF ph\xEDm <strong>Space</strong> v\xE0 r\xEA chu\u1ED9t \u0111\u1EC3 k\xE9o m\xE0n h\xECnh khi ph\xF3ng to.',
    frameFilmstripTitle: 'Danh s\xE1ch c\xE1c khung h\xECnh (Click frame \u0111\u1EC3 s\u1EEDa):',
    frameExportBtn: 'T\u1EA1o l\u1EA1i GIF t\u1EEB c\xE1c Frame \u0111\xE3 s\u1EEDa',
    progressLabelDefault: '\u0110ang x\u1EED l\xFD frame...',
    successBgRemoved: 'X\xF3a n\u1EC1n th\xE0nh c\xF4ng!', successAnimated: 'T\u1EA1o GIF chuy\u1EC3n \u0111\u1ED9ng th\xE0nh c\xF4ng!',
    successImgToGif: 'T\u1EA1o GIF th\xE0nh c\xF4ng!', successVideoToGif: 'Chuy\u1EC3n video sang GIF th\xE0nh c\xF4ng!',
    successMuted: 'X\xF3a \xE2m thanh th\xE0nh c\xF4ng!', successFrameExport: '\u0110\xE3 c\u1EADp nh\u1EADt GIF th\xE0nh c\xF4ng!',
    downloadResult: 'T\u1EA3i xu\u1ED1ng k\u1EBFt qu\u1EA3', downloadImage: 'T\u1EA3i xu\u1ED1ng \u1EA2nh', downloadGif: 'T\u1EA3i xu\u1ED1ng GIF',
    downloadMutedVideo: 'T\u1EA3i xu\u1ED1ng video kh\xF4ng ti\u1EBFng', downloadEditedGif: 'T\u1EA3i xu\u1ED1ng GIF \u0111\xE3 s\u1EEDa',
    feat1Title: '100% Ri\xEAng t\u01B0', feat1Desc: 'M\u1ECDi x\u1EED l\xFD ch\u1EA1y ngay tr\xEAn tr\xECnh duy\u1EC7t. Kh\xF4ng c\xF3 file n\xE0o đ\u01B0\u1EE3c t\u1EA3i l\xEAn server \u2014 d\u1EEF li\u1EC7u lu\xF4n n\u1EB1m tr\xEAn m\xE1y b\u1EA1n.',
    feat2Title: 'X\u1EED l\xFD t\u1EE9c th\xEC', feat2Desc: 'Thu\u1EADt to\xE1n t\u1ED1i \u01B0u cho t\u1EEDng frame, cho k\u1EBFt qu\u1EA3 trong v\xE0i gi\xE2y, k\u1EC3 c\u1EA3 GIF l\u1EDBn v\xE0 video d\xE0i.',
    feat3Title: 'Ti\u1EC1nh ch\u1EC9nh ch\xEDnh x\xE1c', feat3Desc: '\u0110i\u1EC1u ch\u1EC9nh \u0111\u1ED9 nh\u1EA1y, l\xE0m m\u1EC1m vi\u1EC1n, ch\u1EA5m th\u1EE7 c\xF4ng v\xE0 m\u1EE9c n\xE9n \u0111\u1EC3 c\xF3 k\u1EBFt qu\u1EA3 ch\xEDnh x\xE1c nh\u1EA5t.',
    feat4Title: 'H\u1ED7 tr\u1EE3 nhi\u1EC1u đ\u1ECBnh d\u1EA1ng', feat4Desc: 'H\u1ED7 tr\u1EE3 JPG, PNG, WEBP, GIF, MP4, WebM v\xE0 MOV. S\u1EEDa frame, chuy\u1EC3n video sang GIF, x\xF3a \xE2m thanh \u2014 t\u1EA5t c\u1EA3 trong m\u1ED9t n\u01A1i.',
    feat5Title: 'T\u1EA3i xu\u1ED1ng ngay', feat5Desc: 'T\u1EA3i GIF trong su\u1ED1t, \u1EA3nh t\u1ED1i \u01B0u, video kh\xF4ng ti\u1EBFng hay hi\u1EC7u \u1EE9ng chuy\u1EC3n đ\u1ED9ng t\u1EE9c th\xEC \u2014 kh\xF4ng c\u1EA7n t\u1EA1o t\xE0i kho\u1EA3n.',
    footerText: 'MediaStudio \xB7 X\u1EED l\xFD ho\xE0n to\xE0n c\u1EE5c b\u1ED9 \xB7 Kh\xF4ng c\u1EA7n k\u1EBFt n\u1ED1i internet',
    toastSelectValidFile: 'Vui l\xF2ng ch\u1ECDn file \u1EA2nh, GIF ho\u1EB7c video!',
    toastSeedAdded: '\u0110\xE3 ch\u1EA5m th\xEAm v\xF9ng x\xF3a!', toastColorSelected: '\u0110\xE3 ch\u1ECDn m\xE0u {hex}',
    toastLoadedFrames: '\u0110\xE3 t\u1EA3i {count} frames!', toastErrorGif: 'L\u1ED7i \u0111\u1ECDc GIF: {err}',
    toastLoadedImage: '\u0110\xE3 t\u1EA3i \u1EA3nh th\xE0nh c\xF4ng!', toastErrorImage: 'L\u1ED7i \u0111\u1ECDc \u1EA3nh!',
    toastBgRemoved: '\u0110\xE3 x\xF3a n\u1EC1n xong! \uD83C\uDF89',
    toastAnimateStaticOnly: 'T\xEDnh n\u0103ng T\u1EA1o hi\u1EC7u \u1EE9ng ch\u1EC9 h\u1ED7 tr\u1EE3 \u1EA2nh t\u0129nh, kh\xF4ng h\u1ED7 tr\u1EE3 GIF!',
    toastDropImagesOnly: 'Vui l\xF2ng th\u1EA3 file \u1EA3nh!',
    toastAtLeastTwoImages: 'Vui l\xF2ng th\xEAm \xEDt nh\u1EA5t 2 \u1EA3nh!',
    toastGifCreated: 'T\u1EA1o GIF th\xE0nh c\xF4ng! \uD83C\uDF89',
    toastErrorCreateGif: 'L\u1ED7i t\u1EA1o GIF: {err}',
    toastLoadedVideo: '\u0110\xE3 t\u1EA3i video th\xE0nh c\xF4ng!', toastVideoNotSupported: 'Tr\xECnh duy\u1EC7t kh\xF4ng h\u1ED7 tr\u1EE3 \u0111\u1ECBnh d\u1EA1ng video n\xE0y.',
    toastSelectVideoFirst: 'H\xE3y ch\u1ECDn video tr\u01B0\u1EDBc!',
    toastVideoToGifSuccess: 'Chuy\u1EC3n video sang GIF th\xE0nh c\xF4ng! \uD83C\uDF89',
    toastVideoToGifError: 'L\u1ED7i chuy\u1EC3n video: {err}',
    toastMuteSuccess: 'X\xF3a \xE2m thanh th\xE0nh c\xF4ng! \uD83C\uDF89', toastMuteError: 'L\u1ED7i x\xF3a \xE2m thanh: {err}',
    toastGifLargeWarning: 'GIF l\u1EDBn h\u01A1n 1MB ({size}). T\u0103ng m\u1EE9c N\xE9n \u0111\u1EC3 gi\u1EA3m ti\u1EBFp!',
    toastGifEncodeError: 'L\u1ED7i encode GIF: {err}',
    toastNoUndo: 'Ch\u01B0a c\xF3 thao t\xE1c n\xE0o \u0111\u1EC3 ho\xE0n t\xE1c tr\xEAn frame n\xE0y!', toastUndid: '\u0110\xE3 ho\xE0n t\xE1c frame n\xE0y!',
    toastFrameReset: '\u0110\xE3 kh\xF4i ph\u1EE5c frame n\xE0y v\u1EC1 ban \u0111\u1EA7u!',
    toastClickPointFirst: 'H\xE3y click x\xF3a m\u1ED9t \u0111i\u1EC3m tr\xEAn frame tr\u01B0\u1EDBc, r\u1ED3i m\u1EDBi b\u1EA5m \xC1p d\u1EE5ng cho m\u1ECDi Frame!',
    toastApplyAllSuccess: '\u0110\xE3 \xE1p d\u1EE5ng x\xF3a v\xF9ng t\u1EA1i ({x}, {y}) tr\xEAn to\xE0n b\u1ED9 {count} frame! \uD83C\uDF89',
    toastNoFramesToExport: 'Ch\u01B0a c\xF3 frame n\xE0o \u0111\u1EC3 xu\u1EA5t!',
    toastExportSuccess: 'Xu\u1EA5t GIF t\u1EEB c\xE1c frame \u0111\xE3 s\u1EEDa th\xE0nh c\xF4ng! \uD83C\uDF89',
    toastExportError: 'L\u1ED7i xu\u1EA5t GIF: {err}',
    reading: '\u0111ang \u0111\u1ECDc...', framesCount: 'khung h\xECnh', readingVideo: '\u0111ang \u0111\u1ECDc video...', secondsUnit: 'gi\xE2y',
    videoEstimate: '\u26A1 D\u1EF1 ki\u1EBFn: ~{frames} khung h\xECnh ({w}\xD7{h}px \xB7 ~{size})',
    confirmManyFrames: 'Video n\xE0y s\u1EBD t\u1EA1o {count} khung h\xECnh v\xE0 c\xF3 th\u1EC3 m\u1EA5t nhi\u1EC1u th\u1EDDi gian. B\u1EA1n v\u1EABn mu\u1ED1n ti\u1EBFp t\u1EE5c?',
    encodingFrames: '\u0110ang m\xE3 h\xF3a {count} frames...', preparingFrame: 'Chu\u1EA9n b\u1ECB frame {i} / {total}',
    extractingFrame: '\u0110ang l\u1EA5y khung h\xECnh {i}/{total}', processingFrame: 'X\u1EED l\xFD frame {i} / {total}',
    processingImage: '\u0110ang x\u1EED l\xFD \u1EA3nh...', preparingVideo: '\u0110ang chu\u1EA9n b\u1ECB file video...',
    loadingVideo: '\u0110ang n\u1EA1p video v\xE0o b\u1ED9 nh\u1EDB...', removingAudio: '\u0110ang x\xF3a \xE2m thanh kh\u1ECFi video...',
    finalizingVideo: '\u0110ang ho\xE0n t\u1EA5t \u0111\xF3ng g\xF3i video...', preparingFrames: '\u0110ang chu\u1EA9n b\u1ECB c\xE1c frame...',
    preparing: '\u0110ang chu\u1EA9n b\u1ECB...', processing: '\u0110ang x\u1EED l\xFD...', creating: '\u0110ang t\u1EA1o frame...', combining: '\u0110ang gh\xE9p file GIF...',
  }
};

let currentLang = (function() {
  try { return localStorage.getItem('mediastudio_lang') || 'en'; } catch(e) { return 'en'; }
})();

function t(key, params) {
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
    if (val) el.title = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var val = t(el.getAttribute('data-i18n-placeholder'));
    if (val) el.placeholder = val;
  });
}

function setLanguage(lang) {
  if (!I18N[lang]) lang = 'en';
  currentLang = lang;
  try { localStorage.setItem('mediastudio_lang', lang); } catch(e) {}

  var info = LANGS[lang] || LANGS.en;
  var flagEl = document.getElementById('langPickerFlag');
  var nameEl = document.getElementById('langPickerName');
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

  // Dynamic compress labels
  try {
    var lv = parseInt(compressSlider.value) || 0;
    var labels = (I18N[currentLang] || I18N.en).compressLabels[lv];
    if (labels) { compressVal.textContent = labels[0]; compressHint.textContent = labels[1]; }
  } catch(e) {}

  // Update placeholder
  try {
    if (placeholderResult && resultImg.classList.contains('hidden') && resultVideo.classList.contains('hidden')) {
      var phMap = { bgRemove:'placeholderBgRemove', imgToGif:'placeholderImgToGif', videoToGif:'placeholderVideoToGif', muteVideo:'placeholderMuteVideo' };
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
  var wrap = document.getElementById('langPickerWrap');
  var trigger = document.getElementById('langPickerTrigger');
  var dropdown = document.getElementById('langDropdown');
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
function switchTab(tab) {
  currentTab = tab;
  [tabBgRemove, tabFrameEditor, tabImgToGif, tabVideoToGif, tabMuteVideo].forEach(t => t.classList.remove('active'));
  [bgControls, imgToGifControls, videoToGifControls, muteVideoControls].forEach(c => c.classList.add('hidden'));
  
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
  tabMuteVideo.style.display = isVideo ? '' : 'none';
}
tabBgRemove.addEventListener('click', () => switchTab('bgRemove'));
tabFrameEditor.addEventListener('click', () => switchTab('frameEditor'));
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
  else showToast(t('toastSelectValidFile'), 'error');
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
    videoToGifEstimate.textContent = t('videoEstimate', { frames, w, h, size: formatBytes(estBytes) });
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
      resultMeta.textContent = `${t('previewResult')} · ${formatBytes(blob.size)}`;
      
      progressSection.classList.add('hidden');
      if (successBadgeText) successBadgeText.textContent = 'Xóa nền thành công!';
      downloadBtnText.textContent = 'Tải xuống Ảnh';
      downloadSection.classList.remove('hidden');
      processBtn.disabled = false;
      showToast(t('toastBgRemoved'), 'success');
    }, 'image/png');
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
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
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
  img2gifDropZone.querySelector('p:first-of-type').textContent = t('img2gifDropTitle');
});

img2gifConvertBtn.addEventListener('click', async () => {
  if (img2gifImages.length < 2) {
    showToast(t('toastAtLeastTwoImages'), 'error');
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
    if (successBadgeText) successBadgeText.textContent = t('successImgToGif');
    downloadSection.classList.remove('hidden');
    downloadBtnText.textContent = 'Tải xuống GIF';
  img2gifConvertBtn.disabled = false;
  showToast(t('toastGifCreated'), 'success');
  });
  
  gif.on('error', err => {
    console.error(err);
    if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }
    progressSection.classList.add('hidden');
    img2gifConvertBtn.disabled = false;
    showToast(t('toastErrorCreateGif', { err: err?.message || err }), 'error');
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
  videoToGifFileName.textContent = `${file.name} · ${t('readingVideo')}`;
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
    showToast(t('toastLoadedVideo'), 'success');
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
    showToast(t('toastSelectVideoFirst'), 'error');
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
  if (frameCount > 1200 && !confirm(t('confirmManyFrames', { count: frameCount }))) return;

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
      showToast(t('toastVideoToGifSuccess'), 'success');
    });
    gif.on('error', err => { throw err; });
    gif.render();
  } catch (err) {
    console.error(err);
    progressSection.classList.add('hidden');
    videoToGifConvertBtn.disabled = false;
    if (workerUrl) URL.revokeObjectURL(workerUrl);
    showToast(t('toastVideoToGifError', { err: err.message || err }), 'error');
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

    showToast(t('toastMuteSuccess'), 'success');

  } catch (err) {
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
    console.error('gif.js error:', err);
    if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }
    progressSection.classList.add('hidden');
    processBtn.disabled = false;
    showToast(t('toastGifEncodeError', { err: err?.message || err }), 'error');
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
  if (frameFilmstripCount) frameFilmstripCount.textContent = `${gifFrames.length} ${t('framesCount')}`;

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
      showToast(t('toastNoUndo'), 'info');
      return;
    }
    frame.currentImageData = frame.history.pop();
    drawActiveFrame();
    updateThumbnail(activeFrameIndex);
    showToast(t('toastUndid'), 'success');
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
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault();
    frameUndoBtn.click();
  }
});

async function exportEditedGif() {
  if (!gifFrames || gifFrames.length === 0) {
    showToast(t('toastNoFramesToExport'), 'error');
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
      if (successBadgeText) successBadgeText.textContent = t('successFrameExport');
      downloadBtnText.textContent = t('downloadEditedGif');
      downloadSection.classList.remove('hidden');
      downloadSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      frameEditorExportBtn.disabled = false;
      showToast(t('toastExportSuccess'), 'success');
    });

    gif.on('error', err => { throw err; });
    gif.render();

  } catch (err) {
    console.error(err);
    progressSection.classList.add('hidden');
    frameEditorExportBtn.disabled = false;
    showToast(t('toastExportError', { err: err.message || err }), 'error');
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
// ─── Dynamic Interactive Canvas Scene ─────────────────────────────────────────
(function initDynamicBackground() {
  const canvas = document.getElementById('bgCanvas');
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
