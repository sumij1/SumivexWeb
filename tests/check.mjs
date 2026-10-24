import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const page of ['index.html', 'join.html']) {
  const html = readFileSync(resolve(root, page), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${page}: duplicate IDs`);
  assert.match(html, /name="viewport"/);
  assert.match(html, /rel="icon" type="image\/svg\+xml" href="favicon\.svg"/);
  assert.doesNotMatch(html, /www\.figma\.com\/api\/mcp/);
  for (const [, link] of html.matchAll(/(?:src|href|srcset)="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(link)) continue;
    const [pathname, hash] = link.split('#');
    const target = resolve(root, pathname || page);
    assert.ok(existsSync(target), `${page}: missing ${link}`);
    assert.ok(statSync(target).size, `${page}: empty ${link}`);
    if (hash) assert.ok(readFileSync(target, 'utf8').includes(`id="${hash}"`), `${page}: missing anchor ${link}`);
  }
}
const css = readFileSync(resolve(root, 'assets/site.css'), 'utf8');
for (const [, file] of css.matchAll(/url\("([^"]+)"\)/g)) assert.ok(statSync(resolve(root, 'assets', file)).size, `missing CSS asset: ${file}`);

class Element extends EventTarget {
  constructor() { super(); this.open = false; this.attrs = {}; this.hidden = true; this.textContent = ''; this.disabled = false; }
  focus() { this.focused = true; }
  setAttribute(key, value) { this.attrs[key] = value; }
  showModal() { this.open = true; }
  close() { this.open = false; this.dispatchEvent(new Event('close')); }
  click() { this.dispatchEvent(new Event('click')); }
}
class Audio extends Element {
  constructor() { super(); this.paused = true; this.calls = 0; }
  async play() { this.calls++; if (this.reject) throw new Error('Playback unavailable'); this.paused = false; this.dispatchEvent(new Event('play')); }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
}
const script = readFileSync(resolve(root, 'assets/site.js'), 'utf8');
function setup(config = {}, withMusic = true) {
  const dialog = new Element(), trigger = new Element(), closeButton = new Element(), musicButton = new Element(), music = new Audio(), status = new Element();
  const links = [new Element(), new Element(), new Element()];
  const classes = new Set(), media = new EventTarget(), window = new EventTarget();
  window.SUMIVEX_CONFIG = config;
  dialog.querySelector = () => closeButton;
  dialog.querySelectorAll = () => links;
  const elements = { 'mobile-menu': dialog, 'music-toggle': withMusic ? musicButton : null, 'site-music': withMusic ? music : null, 'music-status': withMusic ? status : null };
  const document = { getElementById: id => elements[id], querySelector: () => trigger, body: { classList: { add: key => classes.add(key), remove: key => classes.delete(key) } } };
  vm.runInNewContext(script, { document, window, matchMedia: () => media });
  return { dialog, trigger, closeButton, links, classes, media, window, musicButton, music, status };
}
const menu = setup({}, false);
menu.trigger.click();
assert.ok(menu.dialog.open && menu.classes.has('menu-open') && menu.closeButton.focused);
assert.equal(menu.trigger.attrs['aria-expanded'], 'true');
menu.closeButton.click();
assert.ok(!menu.dialog.open && !menu.classes.has('menu-open') && menu.trigger.focused);
assert.equal(menu.trigger.attrs['aria-expanded'], 'false');
for (const link of menu.links) { menu.trigger.click(); link.click(); assert.ok(!menu.dialog.open); }
menu.trigger.click(); const resize = new Event('change'); resize.matches = true; menu.media.dispatchEvent(resize); assert.ok(!menu.dialog.open);
menu.trigger.click(); menu.window.dispatchEvent(new Event('pagehide')); assert.ok(!menu.dialog.open);
const noAudio = setup();
assert.equal(noAudio.music.calls, 0); assert.ok(!noAudio.status.hidden); assert.match(noAudio.status.textContent, /没有可播放的音乐文件/);
const audio = setup({ musicSrc: 'assets/music.mp3', musicVolume: 5 });
await new Promise(resolve => setImmediate(resolve));
assert.equal(audio.music.calls, 1, 'must attempt autoplay'); assert.equal(audio.music.volume, 1);
assert.equal(audio.musicButton.attrs['aria-pressed'], 'true'); assert.equal(audio.musicButton.disabled, false);
audio.musicButton.click(); assert.ok(audio.music.paused); assert.equal(audio.musicButton.attrs['aria-pressed'], 'false');
audio.music.reject = true; audio.musicButton.click(); await new Promise(resolve => setImmediate(resolve));
assert.equal(audio.musicButton.disabled, false); assert.match(audio.status.textContent, /暂时无法播放/);
console.log('PASS: 2 pages, local assets/fonts, internal anchors, menu focus/ARIA lifecycle, navigation/resize/pagehide close, missing audio, autoplay, playback/pause and rejection recovery.');
console.log('Native dialog Escape, responsive layouts and loaded images also require the browser QA recorded in QA.md.');
