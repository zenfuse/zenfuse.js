export = OkxWallets;
type OkxWallets = OkxSpot;
declare namespace OkxWallets {
    export { OkxSpot as spot };
}
import OkxSpot = require("./wallets/spot");
