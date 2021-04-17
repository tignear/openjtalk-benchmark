const fs = require("fs");
const os = require("os");
const path = require("path");
const { encodeStream } = require("iconv-lite");
const uniqueFilename = require("unique-filename");
const { synthesis, dictionary_dir } = require("node-openjtalk-binding-discordjs");
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
const htsvoice = fs.readFileSync(pathToHTSVoice);
const sjis_dictionary_dir = path.resolve(__dirname, "open_jtalk_dic_shift_jis-1.11");
const fork = process.platform === 'win32' ? txt => synthesisFork("./open_jtalk.exe", sjis_dictionary_dir, pathToHTSVoice, txt, "Shift_JIS") : txt => synthesisFork("./open_jtalk", dictionary_dir, pathToHTSVoice, txt);
exports.fork = fork;
exports.sources = sources;
exports.synthesis = synthesis;
exports.htsvoice = htsvoice;