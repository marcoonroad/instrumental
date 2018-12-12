### TODO

- [ ] Refactor tests into smaller pieces of test cases. 100 lines MUST BE the
  hard cap limit for every test case, no matter how complex are our contracts.
  Many lines are just contract initialization setup, therefore, we should
  move them as _test fixtures_ outside our _test cases_ (the actual logic).
- [ ] Use `node-config` to easily plug on many Ethereum networks to run tests.
  Every network will be an environment which maps to specific configuration
  data (such as gas price, used accounts to test, etc).
- [ ] Comply to just one standard Ethereum ether basis (finney, szabo, ether,
  etc). During tests, we will need to do the proper conversions before and
  after the web3 transaction calls. Our goal here is **to avoid float-point
  arithmetic**, after all, they all are prone to tiny fractions of
  difference (for instance, `0.0000000000000001`), thus, they weak our
  confidence on tests and on value representation.
