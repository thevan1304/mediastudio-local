type Progress = (percent: number, phase: 'palette' | 'encode') => void;
type Cancelled = () => boolean;

export type OriginalFramesGifOptions = {
  start: number;
  end: number;
  width: number;
  height: number;
  quality: number;
  enhance: boolean;
  loop: boolean;
};

/** Decode each source frame once and let the GIF muxer keep its presentation timestamp. */
export async function convertOriginalFramesToGif(
  ffmpeg: any,
  file: File,
  options: OriginalFramesGifOptions,
  onProgress: Progress,
  isCancelled: Cancelled,
): Promise<Blob> {
  const extension = file.name.match(/\.([a-z0-9]{1,5})$/i)?.[1]?.toLowerCase() || 'mp4';
  const input = `original_frames_input.${extension}`;
  const palette = 'original_frames_palette.png';
  const output = 'original_frames_output.gif';
  const duration = options.end - options.start;
  const filters = `scale=${options.width}:${options.height}:flags=lanczos${options.enhance ? ',unsharp=5:5:0.5' : ''}`;
  const colors = options.quality <= 10 ? 256 : options.quality <= 20 ? 160 : 96;
  const dither = options.quality <= 20 ? 'sierra2_4a' : 'none';
  let phase: 'palette' | 'encode' = 'palette';
  const reportProgress = ({ progress }: { progress: number }) => {
    if (Number.isFinite(progress) && progress >= 0 && progress <= 1) {
      onProgress(phase === 'palette' ? 10 + Math.round(progress * 35) : 50 + Math.round(progress * 45), phase);
    }
  };
  ffmpeg.on('progress', reportProgress);
  try {
    onProgress(5, 'palette');
    await ffmpeg.writeFile(input, new Uint8Array(await file.arrayBuffer()));
    if (isCancelled()) throw new Error('Cancelled');

    const paletteCode = await ffmpeg.exec([
      '-y', '-ss', String(options.start), '-i', input, '-t', String(duration),
      '-vf', `${filters},palettegen=max_colors=${colors}:reserve_transparent=0`,
      '-frames:v', '1', palette,
    ]);
    if (paletteCode !== 0) throw new Error(`Palette generation failed (FFmpeg code ${paletteCode}).`);
    if (isCancelled()) throw new Error('Cancelled');

    phase = 'encode';
    onProgress(50, phase);
    const encodeCode = await ffmpeg.exec([
      '-y', '-ss', String(options.start), '-i', input, '-i', palette,
      '-t', String(duration),
      '-filter_complex', `[0:v]${filters}[video];[video][1:v]paletteuse=dither=${dither}[gif]`,
      '-map', '[gif]', '-an', '-fps_mode', 'passthrough',
      '-loop', options.loop ? '0' : '-1', output,
    ]);
    if (encodeCode !== 0) throw new Error(`GIF encoding failed (FFmpeg code ${encodeCode}).`);
    if (isCancelled()) throw new Error('Cancelled');

    const data = await ffmpeg.readFile(output);
    onProgress(98, phase);
    return new Blob([Uint8Array.from(data)], { type: 'image/gif' });
  } finally {
    ffmpeg.off('progress', reportProgress);
    await Promise.all([input, palette, output].map(name => ffmpeg.deleteFile(name).catch(() => {})));
  }
}
