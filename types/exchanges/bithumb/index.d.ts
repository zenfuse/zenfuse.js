export = BitglobalWallets;
/**
 * }
 */
type BitglobalWallets = BitglobalSpot;
declare namespace BitglobalWallets {
    export { BitglobalSpot as spot };
}
import BitglobalSpot = require("./wallets/spot");
