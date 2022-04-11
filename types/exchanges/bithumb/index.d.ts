export = BithumbWallets;
/**
 * }
 */
type BithumbWallets = BithumbSpot;
declare namespace BithumbWallets {
    export { BithumbSpot as spot };
}
import BithumbSpot = require("./wallets/spot");
