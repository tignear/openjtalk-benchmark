
const Benchmark = require('benchmark');
const { fork, synthesis, sources, pathToHTSVoice } = require("./common");

const suite_single = new Benchmark.Suite("OpenJtalk-Single");
suite_single.add("fork-single", {
  defer: true,
  minSamples: 100,
  fn(d) {
    fork(sources[0]).then(() => d.resolve())
  }
}).add("thread-single", {
  defer: true,
  minSamples: 100,
  fn(d) {
    return new Promise(resolve => synthesis(sources[0], { htsvoice: pathToHTSVoice }).on("data", () => resolve())).then(() => d.resolve(), console.error);
  }
}).on('cycle', (event) => {
  const target = event.target;
  const stats = target.stats;
  console.log(`${target.name}: mean:${stats.mean}sec, ±${stats.rme}% (sample count:${stats.sample.length})`);
}).on('complete', () => {
  console.log(`Single Fastest is ${suite_single.filter('fastest').map('name')}`)
}).run();