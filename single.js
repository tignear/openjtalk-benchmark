
const Benchmark = require('benchmark');
const { fork, synthesis, sources, htsvoice } = require("./common");
const txt = "東京スカイツリーは、東京都墨田区押上1-1-2にある電波塔であり、東武鉄道及び東武グループのシンボル的存在である。2012年2月29日に完成し、同年5月に電波塔・観光施設として開業した。";
const suite_single = new Benchmark.Suite("OpenJtalk-Single");
suite_single.add("fork-single", {
  defer: true,
  minSamples: 100,
  fn(d) {
    fork(txt).then(() => d.resolve())
  }
}).add("thread-single", {
  defer: true,
  minSamples: 100,
  fn(d) {
    return new Promise(resolve => synthesis(txt, { htsvoice }).on("data", () => resolve())).then(() => d.resolve(), console.error);
  }
}).on('cycle', (event) => {
  const target = event.target;
  const stats = target.stats;
  console.log(`${target.name}: mean:${stats.mean}sec, ±${stats.rme}% (sample count:${stats.sample.length})`);
}).on('complete', () => {
  console.log(`Single Fastest is ${suite_single.filter('fastest').map('name')}`)
}).run();