export = FtxWallets;
type FtxWallets = FtxSpot;
declare namespace FtxWallets {
    export { FtxSpot as spot };
}
import FtxSpot = require("./wallets/spot");
