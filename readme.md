# これはなに
OpenJTalkのnodejs bindingであるnode-openjtalk-bindingと適当にビルドした配布されているOpenJTalkの性能を比較するための雑なコードが格納されています。

# 実行方法
```sh
git clone https://github.com/tignear/openjtalk-benchmark.git
cd openjtalk-benchmark
yarn
node single.js
node multi.js
```

# 実際の動作結果
## 環境
Intel(R) Core(TM) i7-8700 CPU @ 3.20GHz  
Linux version 5.4.72-microsoft-standard-WSL2 (oe-user@oe-host) (gcc version 8.2.0 (GCC)) #1 SMP Wed Oct 28 23:40:43 UTC 2020  
MemTotal:       39377052 kB  
gcc (Ubuntu 9.3.0-10ubuntu2) 9.3.0  
node.js v14.16.0
## node single.js
```
fork-single: mean:1.5292322194174752sec, ±0.12843319509084392% (sample count:103)
thread-single: mean:0.9080964466666668sec, ±1.214466088078281% (sample count:105)
Single Fastest is thread-single
```
## node multi.js
```
fork-multi: mean:10.40474801sec, mean/number of entry: 0.05419139588541667sec, ±5.229742699461581% (sample count:10)
thread-multi: mean:7.80502331sec, mean/number of entry: 0.04065116307291667sec, ±3.7502264730418378% (sample count:10)
Multi Fastest is thread-multi
```