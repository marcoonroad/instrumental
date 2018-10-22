# instrumental

Financial Instruments encoded as Smart Contracts.

<div align="center">
<a style="margin: 0.1em;" href="https://travis-ci.com/marcoonroad/instrumental">
<img src="https://img.shields.io/travis/com/marcoonroad/instrumental.svg?logo=travis&style=flat-square"/>
</a>
<a style="margin: 0.1em;" href="https://gitlab.com/marcoonroad/instrumental/commits/master">
<img src="https://img.shields.io/badge/build-gitlab-orange.svg?logo=gitlab&style=flat-square"/>
</a>
<a style="margin: 0.1em;" href="https://coveralls.io/github/marcoonroad/instrumental?branch=master">
<img src="https://img.shields.io/coveralls/github/marcoonroad/instrumental.svg?style=flat-square"/>
</a>
<a style="margin: 0.1em;" href="https://app.codacy.com/project/marcoonroad/instrumental/dashboard">
<img src="https://img.shields.io/codacy/grade/7f4c18d183f94540b5fc48a8fc9d1101.svg?style=flat-square"/>
</a>
<a style="margin: 0.1em;" href="https://snyk.io/test/github/marcoonroad/instrumental">
<img src="https://snyk.io/test/github/marcoonroad/instrumental/badge.svg?style=flat-square" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/marcoonroad/instrumental" style="max-width:100%;"/>
</a>
<a style="margin: 0.1em;" href="https://github.com/marcoonroad/instrumental/blob/master/LICENSE.md">
<img src="https://img.shields.io/github/license/marcoonroad/instrumental.svg?style=flat-square"/> </a>
<a style="margin: 0.1em;" href="https://github.com/marcoonroad/instrumental/compare">
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square&logo=github"/>
</a>
<a style="margin: 0.1em;" href="https://www.blockchain.com/btc/address/1PEpBFvkKQtSHj56dCGgDFQBwz45VpMTTQ">
<img src="https://img.shields.io/badge/donate-BTC-yellow.svg?logo=bitcoin&style=flat-square"/>
</a>
</div>

* * *

## Roadmap of Contracts

-   [x] Authorization Hold (in-escrow, multisig contract)
-   [ ] Anticipation/Purchase of Receivables
-   [ ] Auction
-   [ ] Split (PoS/Gateway) Payment - Fan-in
-   [ ] Payables-Receivables Apportionment/Allocation - Fan-out
-   [x] Loyalty/Cashback Reward Program (using MDR from Merchant Account)
-   [ ] Coin Flip/Toss, Commit-Reveal-based Lottery / Public RNG
-   [ ] Derivatives (futures, forwards, swaps and options)

* * *

**Notes:**
The financial instruments regarding receivables will
likely demand a proper Risk management/analysis. Also, for the derivative
contracts, an Oracle to feed real-time market prices is needed as well
(although on tests it could be mocked without any problem).
