// Dispositivo WebGPU, utilitários de recurso e pré-processador de WGSL.
const Q = new URLSearchParams(location.search);
const BUILD = [];           // construtores de cena registrados pelos outros arquivos: async fn(), executados em ordem por main()
const GAME = { ready: false, mode: Q.get('scene') || 'game', capture: Q.has('cap'), tick: null, init: null, minFrameMs: 0, gpuWorstMs: 0, ui: false };

// Preset di qualità grafica: Molto Bassa (ultra-leggera 60 FPS per qualsiasi dispositivo), Bassa, Media, Alta
const QUALITY_PRESETS = {
  veryLow: { label: 'Molto Bassa', dpr: 1.0, maxH: 720, shadow: 512, cascades: 0, vogelN: 4, envRes: 128, envMips: 4, facesPerFrame: 0, ao: false, ssr: false, motionBlur: false, bloom: false, bloomLevels: 0, vegShadow: false, grass: false },
  low:     { label: 'Bassa',       dpr: 1.0, shadow: 512,  cascades: 1, vogelN: 4, envRes: 256, envMips: 5, facesPerFrame: 0, ao: true,  aoSamples: 4,  volSamples: 4,  ssr: false, motionBlur: false, bloom: true,  bloomLevels: 3, vegShadow: false, grass: false },
  med:     { label: 'Media',       dpr: 1.0, shadow: 1024, cascades: 2, vogelN: 6, envRes: 256, envMips: 6, facesPerFrame: 1, ao: true,  aoSamples: 8,  volSamples: 8,  ssr: false, motionBlur: true,  bloom: true,  bloomLevels: 4, vegShadow: true,  grass: true },
  high:    { label: 'Alta',        dpr: 1.5, shadow: 2048, cascades: 3, vogelN: 8, envRes: 512, envMips: 7, facesPerFrame: 2, ao: true,  aoSamples: 14, volSamples: 20, ssr: true,  motionBlur: true,  bloom: true,  bloomLevels: 6, vegShadow: true,  grass: true },
};

function detectDefaultQuality(adapterInfo) {
  try {
    const saved = localStorage.getItem('napoli_quality');
    if (saved && QUALITY_PRESETS[saved]) return saved;
  } catch (e) {}
  const param = Q.get('quality');
  if (param && QUALITY_PRESETS[param]) return param;

  const desc = `${adapterInfo?.vendor || ''} ${adapterInfo?.architecture || ''} ${adapterInfo?.description || ''} ${adapterInfo?.device || ''}`.toLowerCase();
  if (/swiftshader|llvmpipe|software|basic render|integrated|intel|uhd|hd graphics/.test(desc)) {
    return 'veryLow';
  }
  return 'low';
}

let currentQuality = 'med';
let Q_CONF = QUALITY_PRESETS.med;

function setQuality(qKey, reload = true) {
  if (!QUALITY_PRESETS[qKey]) return;
  try {
    localStorage.setItem('napoli_quality', qKey);
  } catch (e) {}
  if (reload) {
    const url = new URL(location.href);
    url.searchParams.set('quality', qKey);
    if (typeof UI !== 'undefined' && UI.st === ST.JOGO) {
      url.searchParams.set('autostart', '1');
    }
    location.href = url.toString();
  }
}

// Jogo aberto por uma pessoa (tela de início, painel, som) × ferramenta (captura, poses, teste, medição): as ferramentas de
// trabalho/ usam ?cap, ?perf, ?replay ou rodam num navegador automatizado, e para elas nada muda — sem menu, sem painel.
// ?ui=1 força o jogo completo (é como os testes de menu, entrada e som o abrem); ?ui=0 força o modo de ferramenta.
GAME.ui = Q.has('ui') ? Q.get('ui') !== '0' : !(Q.has('cap') || Q.has('perf') || Q.has('replay') || Q.has('auto') || Q.has('scene') || navigator.webdriver);
// Tempo em vetor tipado (escrita por quadro sem caixa na heap): RT[0] = tempo acumulado (s), RT[1] = dt do quadro renderizado, RT[2] = dt pedido ao jogo
const RT = new Float64Array([0, 1 / 60, 1 / 60, 0]);   // RT[3] = intervalo real do último quadro (ms), para as estatísticas
const G = { dev: null, ctx: null, fmt: 'bgra8unorm', W: 0, H: 0, hasTS: false, canvas: null };

async function gpuInit() {
  if (!navigator.gpu) throw new Error('WebGPU non disponibile in questo browser.');
  const ad = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  if (!ad) throw new Error('Nessun adattatore GPU WebGPU disponibile.');
  let adapterInfo = null;
  try {
    adapterInfo = ad.info || (ad.requestAdapterInfo ? await ad.requestAdapterInfo() : null);
  } catch (e) {}
  currentQuality = detectDefaultQuality(adapterInfo);
  Q_CONF = QUALITY_PRESETS[currentQuality];

  const feats = [];
  // 'timestamp-query' é pedido na medição de desempenho (?perf) e no jogo aberto por uma pessoa (benchmark e estatísticas
  // mostram o tempo de GPU quando o navegador permite); ?nots desliga. Captura, poses e testes continuam sem o recurso.
  for (const f of ['float32-filterable', 'rg11b10ufloat-renderable'].concat((Q.has('perf') || GAME.ui) && !Q.has('nots') ? ['timestamp-query'] : [])) if (ad.features.has(f)) feats.push(f);
  if (!ad.features.has('float32-filterable')) throw new Error('GPU senza supporto float32-filterable.');
  G.hasTS = feats.includes('timestamp-query');
  const reqLimits = {};
  if (ad.limits.maxColorAttachmentBytesPerSample) reqLimits.maxColorAttachmentBytesPerSample = Math.min(64, ad.limits.maxColorAttachmentBytesPerSample);
  if (ad.limits.maxBufferSize) reqLimits.maxBufferSize = ad.limits.maxBufferSize;
  if (ad.limits.maxTextureDimension2D) reqLimits.maxTextureDimension2D = Math.min(8192, ad.limits.maxTextureDimension2D);
  if (ad.limits.maxSampledTexturesPerShaderStage) reqLimits.maxSampledTexturesPerShaderStage = Math.min(16, ad.limits.maxSampledTexturesPerShaderStage);
  G.dev = await ad.requestDevice({
    requiredFeatures: feats,
    requiredLimits: reqLimits
  });
  G.dev.addEventListener('uncapturederror', e => { console.error('GPU: ' + e.error.message); G.lastErr = e.error.message; });
  G.canvas = document.getElementById('c');
  const res = (Q.get('res') || '').split('x');
  const maxDpr = currentQuality === 'high' ? 1.5 : 1.0;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  let w = Math.round(innerWidth * dpr);
  let h = Math.round(innerHeight * dpr);
  if (res.length === 2) {
    w = +res[0];
    h = +res[1];
  } else if (Q_CONF.maxH && h > Q_CONF.maxH) {
    const scale = Q_CONF.maxH / h;
    w = Math.round(w * scale);
    h = Q_CONF.maxH;
  }
  G.W = clamp(w & ~1, 320, 5120);
  G.H = clamp(h & ~1, 180, 2880);
  G.canvas.width = G.W; G.canvas.height = G.H;
  G.ctx = G.canvas.getContext('webgpu');
  G.fmt = navigator.gpu.getPreferredCanvasFormat();
  G.ctx.configure({ device: G.dev, format: G.fmt, alphaMode: 'opaque' });
}

const TU = { RT: 0x10, TB: 0x04, CS: 0x01, CD: 0x02, ST: 0x08 };
function mkTex(w, h, format, usage, extra) {
  const d = { size: [w, h, 1], format, usage: usage ?? (TU.RT | TU.TB), mipLevelCount: 1 };
  if (extra) Object.assign(d, extra);
  return G.dev.createTexture(d);
}
function mkBuf(size, usage, data) {
  const b = G.dev.createBuffer({ size: (size + 3) & ~3, usage, mappedAtCreation: !!data });
  if (data) { new Uint8Array(b.getMappedRange()).set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength)); b.unmap(); }
  return b;
}
const BU = { V: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, I: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST, U: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, S: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST };

// Pré-processador: #include nome, #define NOME [valor], #ifdef/#ifndef/#else/#endif. Substitui macros por palavra inteira.
function wgslPP(name, defs) {
  defs = Object.assign({}, defs);
  const seen = {};
  const run = (nm) => {
    const src = WGSL[nm]; if (src === undefined) throw new Error('wgsl ausente: ' + nm);
    const out = []; const st = []; let on = true;
    for (const line of src.split('\n')) {
      const t = line.trim();
      if (t[0] === '#') {
        const p = t.split(/\s+/);
        if (p[0] === '#ifdef') { st.push(on); on = on && (p[1] in defs); continue; }
        if (p[0] === '#ifndef') { st.push(on); on = on && !(p[1] in defs); continue; }
        if (p[0] === '#else') { on = st[st.length - 1] && !on; continue; }
        if (p[0] === '#endif') { on = st.pop(); continue; }
        if (!on) continue;
        if (p[0] === '#include') { if (!seen[p[1]]) { seen[p[1]] = 1; out.push(run(p[1])); } continue; }
        if (p[0] === '#define') { defs[p[1]] = p.slice(2).join(' '); continue; }
        continue;
      }
      if (on) out.push(line);
    }
    return out.join('\n');
  };
  let code = 'diagnostic(off, derivative_uniformity);\n' + run(name);
  for (const k in defs) if (defs[k] !== '' && defs[k] !== true) code = code.replace(new RegExp('\\b' + k + '\\b', 'g'), defs[k]);
  return code;
}
const _modCache = {};
function mkShader(name, defs) {
  const key = name + JSON.stringify(defs || {});
  if (_modCache[key]) return _modCache[key];
  const code = wgslPP(name, defs);
  const m = G.dev.createShaderModule({ code, label: name });
  m.getCompilationInfo().then(info => {
    for (const msg of info.messages) if (msg.type === 'error') {
      const ln = code.split('\n'); console.error(`WGSL ${name}:${msg.lineNum}: ${msg.message}\n${ln.slice(Math.max(0, msg.lineNum - 3), msg.lineNum + 1).join('\n')}`);
      G.lastErr = `WGSL ${name}:${msg.lineNum}: ${msg.message}`;
    }
  });
  return _modCache[key] = m;
}
// Pipeline de tela cheia (triângulo único) com layout automático.
function mkFsPipe(name, defs, targets, opts) {
  const mod = mkShader(name, defs);
  return G.dev.createRenderPipeline({
    label: name, layout: 'auto',
    vertex: { module: mod, entryPoint: 'vs' },
    fragment: { module: mod, entryPoint: (opts && opts.entry) || 'fs', targets: targets.map(t => typeof t === 'string' ? { format: t } : t) },
    primitive: { topology: 'triangle-list' },
  });
}
function mkBG(pipe, idx, entries) {
  return G.dev.createBindGroup({ layout: pipe.getBindGroupLayout(idx), entries: entries.map((r, i) => ({ binding: i, resource: (r instanceof GPUBuffer) ? { buffer: r } : r })) });
}
function mkBGL(layout, entries) {
  return G.dev.createBindGroup({ layout, entries: entries.map((r, i) => ({ binding: i, resource: (r instanceof GPUBuffer) ? { buffer: r } : (r && r.buffer instanceof GPUBuffer) ? r : r })) });
}
// descritor de passe reutilizável (nenhuma alocação por quadro: só troca .view)
function mkPassDesc(nColor, depth, clear, label) {
  const d = { label, colorAttachments: [] };
  for (let i = 0; i < nColor; i++) d.colorAttachments.push({ view: null, loadOp: clear ? 'clear' : 'load', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 0 } });
  if (depth) d.depthStencilAttachment = { view: null, depthLoadOp: depth === 'load' || depth === 'ro' ? 'load' : 'clear', depthStoreOp: 'store', depthClearValue: depth === 'clear1' ? 1 : 0 };
  if (depth === 'ro') { const a = d.depthStencilAttachment; delete a.depthLoadOp; delete a.depthStoreOp; delete a.depthClearValue; a.depthReadOnly = true; }
  return d;
}
// gera mips por blit linear (uso na inicialização)
let _mipPipe = {};
function genMips(tex, format, layers) {
  const dev = G.dev;
  if (!_mipPipe[format]) _mipPipe[format] = mkFsPipe('blit', {}, [format]);
  const pipe = _mipPipe[format];
  const samp = dev.createSampler({ minFilter: 'linear', magFilter: 'linear' });
  const enc = dev.createCommandEncoder();
  for (let L = 0; L < (layers || 1); L++) for (let m = 1; m < tex.mipLevelCount; m++) {
    const srcV = tex.createView({ dimension: '2d', baseMipLevel: m - 1, mipLevelCount: 1, baseArrayLayer: L, arrayLayerCount: 1 });
    const dstV = tex.createView({ dimension: '2d', baseMipLevel: m, mipLevelCount: 1, baseArrayLayer: L, arrayLayerCount: 1 });
    const p = enc.beginRenderPass({ colorAttachments: [{ view: dstV, loadOp: 'clear', storeOp: 'store' }] });
    p.setPipeline(pipe); p.setBindGroup(0, mkBG(pipe, 0, [srcV, samp])); p.draw(3); p.end();
  }
  dev.queue.submit([enc.finish()]);
}
const mipCount = (w, h) => 1 + Math.floor(Math.log2(Math.max(w, h)));
