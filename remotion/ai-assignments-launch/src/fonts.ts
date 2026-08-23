import { continueRender, delayRender } from "remotion";
import { GEIST, GEIST_MONO, SPECTRAL, SPECTRAL_ITALIC } from "./fontdata";

// Brand fonts as inline data URIs via plain @font-face.
// We gate the first frames on document.fonts.load(), but inside a capped
// race — a stalled font engine degrades one worker's first frame instead of
// killing the whole render (loadFont's uncapped delayRender did exactly that).
if (typeof document !== "undefined") {
  const css = `
@font-face { font-family: 'Geist'; src: url(${GEIST}) format('woff2'); font-weight: 100 900; font-style: normal; font-display: block; }
@font-face { font-family: 'Geist Mono'; src: url(${GEIST_MONO}) format('woff2'); font-weight: 100 900; font-style: normal; font-display: block; }
@font-face { font-family: 'Spectral'; src: url(${SPECTRAL}) format('woff2'); font-weight: 400; font-style: normal; font-display: block; }
@font-face { font-family: 'Spectral'; src: url(${SPECTRAL_ITALIC}) format('woff2'); font-weight: 400; font-style: italic; font-display: block; }
`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const handle = delayRender("Decoding inline brand fonts");
  const done = () => continueRender(handle);
  const wait = new Promise<void>((resolve) => setTimeout(resolve, 7000));
  Promise.race([
    Promise.all([
      document.fonts.load("470 100px Geist"),
      document.fonts.load("450 20px 'Geist Mono'"),
      document.fonts.load("400 100px Spectral"),
      document.fonts.load("italic 400 100px Spectral"),
    ]).then(() => undefined),
    wait,
  ])
    .then(done)
    .catch(done);
}
