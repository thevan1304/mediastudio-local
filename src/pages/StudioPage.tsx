import { useLayoutEffect } from 'react';
import markup from './StudioPage.html?raw';
import { initStudio } from '../features/studio/initStudio';
import { BackgroundScene } from '../components/BackgroundScene';

/** Mount the existing studio controls before wiring its media workflows. */
export function StudioPage() {
  useLayoutEffect(() => {
    initStudio();
  }, []);

  return <>
    <BackgroundScene />
    <div dangerouslySetInnerHTML={{ __html: markup }} />
  </>;
}
