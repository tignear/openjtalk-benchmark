const Benchmark = require('benchmark');
const fs = require("fs");
const os = require("os");
const path = require("path");
const { encodeStream } = require("iconv-lite");
const uniqueFilename = require("unique-filename");
const { synthesis } = require("node-openjtalk-binding-discordjs");
const { execFile } = require("child_process");
function loadOrg(path_to_dir) {
  return fs.readdirSync(path_to_dir).flatMap(
    org_path => fs.readFileSync(path.resolve(path_to_dir, org_path), "utf-8").split("\n").filter(line => !line.startsWith("#") && !!line.trim().length)
  );
}
const sources = loadOrg(path.resolve(__dirname, "KWDLC", "org", "w201106-00000"));
async function synthesisFork(pathToOpenJTalk, pathToDict, pathToHTSVoice, text, charset) {
  const pathToCreatedFile = uniqueFilename(os.tmpdir(), "openjtalk-dst") + ".wav";
  const options = {
    ow: pathToCreatedFile,
    x: pathToDict,
    m: pathToHTSVoice
  }
  const args = [
    ...Object.entries(options).flatMap(([k, v]) => {
      return v ? [`-${k}`, `${v}`] : [];
    }),
  ];
  const cp = execFile(pathToOpenJTalk, args, (error/*, stdout, stderr*/) => {
    if (error) {
      console.log(error);
    }
  });
  if (charset) {
    const conv = encodeStream(charset);
    conv.on("error", (...args) => {
      console.log(args);
    });
    if (!cp.stdin) {
      throw TypeError("stdin is closed");
    }
    conv.pipe(cp.stdin);
    conv.write(text);
    conv.end();
  } else {
    cp.stdin?.write(text);
  }
  cp.stdin?.end();
  cp.stdin?.on("error", (err) => {
    console.log(err);
  });
  if (!await new Promise((resolve) => {
    cp.on("exit", (code) => {
      const c = code ?? 0;
      if (c === 0) {
        resolve(c);
        return;
      }
      console.error(`OpenJTalk exited with ${c}.`);
      resolve(c);
    });
  })) {
    return new Promise(resolve => {

      fs.createReadStream(pathToCreatedFile, {
        start: 44,
      }).on("data", chunk => resolve());
    });
  } else {
    console.error(text);
  }
}

const pathToHTSVoice = path.resolve(__dirname, "hts_voice_nitech_jp_atr503_m001-1.05/nitech_jp_atr503_m001.htsvoice");
const sjis_dictionary_dir = path.resolve(__dirname, "open_jtalk_dic_shift_jis-1.11");
const suite = new Benchmark.Suite("OpenJtalk");
suite.add("fork", {
  defer: true, minSamples: 10, fn(d) {
    return Promise.all(
      sources.map(txt => synthesisFork("./open_jtalk.exe", sjis_dictionary_dir, pathToHTSVoice, txt, "Shift_JIS"))
    ).then(() => d.resolve(), console.error);
  }
}).add("thread", {
  defer: true, minSamples: 10, fn(d) {
    return Promise.all(
      sources.map(txt => new Promise(resolve => synthesis(txt, { htsvoice: pathToHTSVoice }).on("data", () => resolve())))
    ).then(() => d.resolve(), console.error);
  }
}).on('cycle', (event) => {
  const target = event.target;
  const stats = target.stats;
  console.log(`${target.name}: mean:${stats.mean}sec, mean/number of entry: ${stats.mean / sources.length}sec, ±${stats.rme}% (sample count:${stats.sample.length})`);
}).on('complete', () => {
  console.log(`Fastest is ${suite.filter('fastest').map('name')}`)
}).run();

const suite_single = new Benchmark.Suite("OpenJtalk-Single");
suite_single.add("fork", {
  defer: true, minSamples: 100, fn(d) {
    synthesisFork("./open_jtalk.exe", sjis_dictionary_dir, pathToHTSVoice, sources[0], "Shift_JIS").then(() => d.resolve())
  }
}).add("thread", {
  defer: true,
  minSamples: 100, fn(d) {
    return new Promise(resolve => synthesis(sources[0], { htsvoice: pathToHTSVoice }).on("data", () => resolve())).then(() => d.resolve(), console.error);
  }
}).on('cycle', (event) => {
  const target = event.target;
  const stats = target.stats;
  console.log(`${target.name}: mean:${stats.mean}sec, ±${stats.rme}% (sample count:${stats.sample.length})`);
}).on('complete', () => {
  console.log(`Fastest is ${suite_single.filter('fastest').map('name')}`)
}).run();