/// <reference types="vite/client" />

declare module '*.html?raw' {
  const markup: string;
  export default markup;
}

declare const SuperGif: new (options: Record<string, unknown>) => any;
declare const GIF: new (options: Record<string, unknown>) => any;
declare const EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> };

interface Window {
  GIF: typeof GIF;
  FFmpegWASM: any;
  FFmpegUtil: any;
  EyeDropper: typeof EyeDropper;
}
