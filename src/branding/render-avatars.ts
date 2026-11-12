import path from 'path';
import { fileURLToPath } from 'url';
import { bundle } from '@remotion/bundler';
import { renderStill } from '@remotion/renderer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

async function main() {
  console.log('📦 Bundling Remotion Root...');
  const entryPoint = path.resolve(projectRoot, 'src/video/Root.tsx');
  const bundled = await bundle({
    entryPoint,
  });

  const compositions = [
    { id: 'AvatarOption1Velocity', filename: 'option1-velocity.png', title: 'Option 1: The Fast Monogram (Linear Style)' },
    { id: 'AvatarOption2Editorial', filename: 'option2-editorial.png', title: 'Option 2: Swiss Editorial (Axios / Bloomberg Style)' },
    { id: 'AvatarOption3Prism', filename: 'option3-prism.png', title: 'Option 3: Geometric Fold (Framer / Stripe Style)' },
    { id: 'AvatarOption4Minimalist', filename: 'option4-minimalist.png', title: 'Option 4: Broadcast Minimalist (Monocle Style)' },
  ];

  const outDir = path.resolve(projectRoot, 'assets/branding');

  for (const comp of compositions) {
    console.log(`🎨 Rendering ${comp.title}...`);
    const outputPath = path.resolve(outDir, comp.filename);
    await renderStill({
      composition: {
        id: comp.id,
        width: 1024,
        height: 1024,
        fps: 30,
        durationInFrames: 1,
        defaultProps: {},
        props: {},
      },
      serveUrl: bundled,
      output: outputPath,
      imageFormat: 'png',
    });
    console.log(`✅ Saved: ${outputPath}`);
  }

  console.log('🎉 All 4 brand avatars successfully rendered to assets/branding/!');
}

main().catch((err) => {
  console.error('❌ Failed to render avatars:', err);
  process.exit(1);
});
