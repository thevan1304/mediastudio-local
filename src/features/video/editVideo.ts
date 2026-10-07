type Progress = (key: string, percent: number, params?: Record<string, number>) => void;
type Cancelled = () => boolean;
export type JoinClip = { file: File; start: number; end: number };
export type VideoExportOptions = { maxHeight: number | null; crf: 18 | 23 | 28 };

function outputDimensions(sourceWidth: number, sourceHeight: number, maxHeight: number | null) {
  const ratio = maxHeight ? Math.min(1, maxHeight / sourceHeight) : 1;
  return {
    width: Math.max(2, Math.floor(sourceWidth * ratio / 2) * 2),
    height: Math.max(2, Math.floor(sourceHeight * ratio / 2) * 2),
  };
}

function extension(file: File) {
  const ext = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  return ext && /^[a-z0-9]{1,5}$/.test(ext) ? ext : 'mp4';
}

function assertSuccess(code: number, action: string) {
  if (code !== 0) throw new Error(`${action} failed (FFmpeg code ${code}).`);
}

async function deleteFiles(ffmpeg: any, names: string[]) {
  await Promise.all(names.map(name => ffmpeg.deleteFile(name).catch(() => {})));
}

export async function trimVideo(
  ffmpeg: any, file: File, start: number, end: number,
  sourceWidth: number, sourceHeight: number, options: VideoExportOptions,
  onProgress: Progress, isCancelled: Cancelled,
): Promise<Blob> {
  const { width, height } = outputDimensions(sourceWidth, sourceHeight, options.maxHeight);
  const input = `edit_input.${extension(file)}`;
  const output = 'edit_trimmed.mp4';
  try {
    onProgress('editLoadingVideo', 20);
    await ffmpeg.writeFile(input, new Uint8Array(await file.arrayBuffer()));
    if (isCancelled()) throw new Error('Cancelled');
    onProgress('editTrimming', 40);
    const code = await ffmpeg.exec([
      '-i', input, '-ss', String(start), '-t', String(end - start),
      '-map', '0:v:0', '-map', '0:a:0?',
      '-vf', `scale=${width}:${height},setsar=1`,
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', String(options.crf), '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', output,
    ]);
    assertSuccess(code, 'Trim');
    if (isCancelled()) throw new Error('Cancelled');
    onProgress('editPreparingDownload', 95);
    const data = await ffmpeg.readFile(output);
    return new Blob([Uint8Array.from(data)], { type: 'video/mp4' });
  } finally {
    await deleteFiles(ffmpeg, [input, output]);
  }
}

export async function joinVideos(
  ffmpeg: any, clips: JoinClip[], sourceWidth: number, sourceHeight: number,
  options: VideoExportOptions,
  onProgress: Progress, isCancelled: Cancelled,
): Promise<Blob> {
  const { width, height } = outputDimensions(sourceWidth, sourceHeight, options.maxHeight);
  const segments: string[] = [];
  const cleanup: string[] = [];
  const output = 'edit_joined.mp4';
  const list = 'edit_concat.txt';
  cleanup.push(output, list);

  try {
    for (let i = 0; i < clips.length; i++) {
      if (isCancelled()) throw new Error('Cancelled');
      const clip = clips[i];
      const input = `edit_clip_${i}.${extension(clip.file)}`;
      const segment = `edit_segment_${i}.mp4`;
      cleanup.push(input, segment);
      segments.push(segment);
      onProgress('editConvertingClip', Math.round(10 + i / clips.length * 75), { index: i + 1, count: clips.length });
      await ffmpeg.writeFile(input, new Uint8Array(await clip.file.arrayBuffer()));
      if (isCancelled()) throw new Error('Cancelled');

      const encodeArgs = (useSilence: boolean) => [
        '-y', '-i', input,
        ...(useSilence ? ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100'] : []),
        '-ss', String(clip.start), '-t', String(clip.end - clip.start),
        '-map', '0:v:0', '-map', useSilence ? '1:a:0' : '0:a:0',
        '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1`,
        '-af', 'apad', '-shortest',
        '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', String(options.crf), '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-ar', '44100', '-ac', '2', '-b:a', '128k',
        '-movflags', '+faststart', segment,
      ];
      let code = await ffmpeg.exec(encodeArgs(false));
      if (code !== 0 && !isCancelled()) {
        // A clip without an audio stream needs silence to keep every segment compatible.
        await ffmpeg.deleteFile(segment).catch(() => {});
        code = await ffmpeg.exec(encodeArgs(true));
      }
      assertSuccess(code, `Clip ${i + 1}`);
      await ffmpeg.deleteFile(input).catch(() => {});
    }

    if (isCancelled()) throw new Error('Cancelled');
    onProgress('editJoining', 88);
    const concatList = segments.map(name => `file '${name}'`).join('\n') + '\n';
    await ffmpeg.writeFile(list, new TextEncoder().encode(concatList));
    assertSuccess(await ffmpeg.exec([
      '-f', 'concat', '-safe', '0', '-i', list,
      '-c', 'copy', '-movflags', '+faststart', output,
    ]), 'Join');
    if (isCancelled()) throw new Error('Cancelled');
    onProgress('editPreparingDownload', 96);
    const data = await ffmpeg.readFile(output);
    return new Blob([Uint8Array.from(data)], { type: 'video/mp4' });
  } finally {
    await deleteFiles(ffmpeg, cleanup);
  }
}
