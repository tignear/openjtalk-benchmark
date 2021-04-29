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
fork-single: mean:1.5507313572815526sec, ±0.517922656418563% (sample count:103)
thread-single: mean:0.7113056216981131sec, ±0.3031245204435511% (sample count:106)
Single Fastest is thread-single
```
## node multi.js
```
fork-multi: mean:11.927693999999999sec, mean/number of entry: 0.06212340624999999sec, ±3.7596627438525703% (sample count:10)
thread-multi: mean:6.61741527sec, mean/number of entry: 0.03446570453125sec, ±0.865607782852954% (sample count:10)
Multi Fastest is thread-multi
```