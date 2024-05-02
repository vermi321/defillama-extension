import genericEtherscanComponent from "./components/explorers/genericEtherscanComponent"
import initPhishingDetector from  "./components/twitter/init"

switch (new URL(document.baseURI).hostname) {
  case "etherscan.io":
  case "bscscan.com":
  case "ftmscan.com":
  case "arbiscan.io":
  case "polygonscan.com":
  case "optimistic.etherscan.io":
  case "cronoscan.com":
  case "moonriver.moonscan.io":
  case "moonbeam.moonscan.io":
  case "moonscan.io":
  case "gnosisscan.io":
  case "bobascan.com":
  case "zkevm.polygonscan.com":
  case "nova.arbiscan.io":
  case "celoscan.com":
  case "bttcscan.com":
  case "scrollscan.com":
  case "lineascan.build":
  case "basescan.org":
  case "era.zksync.network":
  case "kromascan.com":
    genericEtherscanComponent();
    break;
  case "twitter.com":
  case "x.com":
    initPhishingDetector();
    break;
  default:
    break;
}
