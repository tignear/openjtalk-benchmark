const Benchmark = require('benchmark');
const {fork,synthesis,sources,htsvoice} = require("./common");

const suite = new Benchmark.Suite("OpenJtalk");
suite.add("fork-multi", {
  defer: true, minSamples: 10, fn(d) {
    return Promise.all(
      sources.map(fork)
    ).then(() => d.resolve(), console.error);
  }
}).add("thread-multi", {
  defer: true, minSamples: 10, fn(d) {
    return Promise.all(
      sources.map(txt => new Promise(resolve => synthesis(txt, { htsvoice }).on("data", () => resolve())))
    ).then(() => d.resolve(), console.error);
  }
}).on('cycle', (event) => {
  const target = event.target;
  const stats = target.stats;
  console.log(`${target.name}: mean:${stats.mean}sec, mean/number of entry: ${stats.mean / sources.length}sec, ±${stats.rme}% (sample count:${stats.sample.length})`);
}).on('complete', () => {
  console.log(`Multi Fastest is ${suite.filter('fastest').map('name')}`)
}).run();