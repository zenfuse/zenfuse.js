export = BinanceWallets;
type BinanceWallets = BinanceSpot;
declare namespace BinanceWallets {
    export { BinanceSpot as spot };
}
import BinanceSpot = require("./wallets/spot");
