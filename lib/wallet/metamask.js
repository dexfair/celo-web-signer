"use strict";
exports.__esModule = true;
exports.newMetaMaskWalletWithSetup = exports.MetaMaskWallet = exports.MetaMaskSigner = void 0;
var tslib_1 = require("tslib");
var wallet_base_1 = require("@celo/wallet-base");
var wallet_base_2 = require("@celo/wallet-base");
var web3_1 = tslib_1.__importDefault(require("web3"));
var MetaMaskSigner = /** @class */ (function () {
    function MetaMaskSigner(web3, account) {
        this.web3 = web3;
        this.account = account;
    }
    MetaMaskSigner.prototype.signTransaction = function (addToV, encodedTx) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var signature, v, r, s;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.web3.eth.sign(wallet_base_2.getHashFromEncoded(encodedTx.rlpEncode), encodedTx.transaction.from)];
                    case 1:
                        signature = _a.sent();
                        v = this.web3.utils.hexToNumber("0x" + signature.slice(130)) + (addToV - 27);
                        r = Buffer.from(signature.slice(2, 66), 'hex');
                        s = Buffer.from(signature.slice(66, 130), 'hex');
                        return [2 /*return*/, { v: v, s: s, r: r }];
                }
            });
        });
    };
    MetaMaskSigner.prototype.signPersonalMessage = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var signature, v, r, s;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.web3.eth.personal.sign(data, this.account)];
                    case 1:
                        signature = _a.sent();
                        v = this.web3.utils.hexToNumber("0x" + signature.slice(130));
                        r = Buffer.from(signature.slice(2, 66), 'hex');
                        s = Buffer.from(signature.slice(66, 130), 'hex');
                        return [2 /*return*/, { v: v, s: s, r: r }];
                }
            });
        });
    };
    MetaMaskSigner.prototype.signTypedData = function (typedData) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                throw new Error('Not implemented');
            });
        });
    };
    MetaMaskSigner.prototype.getNativeKey = function () {
        throw new Error('Not implemented');
    };
    MetaMaskSigner.prototype.decrypt = function (_ciphertext) {
        throw new Error('Not implemented');
        return Promise.resolve(Buffer.from([]));
    };
    MetaMaskSigner.prototype.computeSharedSecret = function (_publicKey) {
        throw new Error('Not implemented');
        return Promise.resolve(Buffer.from([]));
    };
    return MetaMaskSigner;
}());
exports.MetaMaskSigner = MetaMaskSigner;
var MetaMaskWallet = /** @class */ (function (_super) {
    tslib_1.__extends(MetaMaskWallet, _super);
    function MetaMaskWallet(provider, onAccountsChanged) {
        var _this = _super.call(this) || this;
        _this.web3 = new web3_1["default"](provider);
        provider.on('accountsChanged', function (accounts) {
            var temp = _this.getAccounts();
            temp.forEach(function (address) { _this.removeSigner(address); });
            accounts.forEach(function (address) { _this.addSigner(address, new MetaMaskSigner(_this.web3, address)); });
            if (onAccountsChanged) {
                onAccountsChanged(accounts);
            }
        });
        return _this;
    }
    MetaMaskWallet.prototype.init = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var temp, accounts;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        temp = this.getAccounts();
                        temp.forEach(function (address) { _this.removeSigner(address); });
                        return [4 /*yield*/, this.web3.eth.getAccounts()];
                    case 1:
                        accounts = _a.sent();
                        accounts.forEach(function (address) { _this.addSigner(address, new MetaMaskSigner(_this.web3, address)); });
                        return [2 /*return*/];
                }
            });
        });
    };
    return MetaMaskWallet;
}(wallet_base_1.WalletBase));
exports.MetaMaskWallet = MetaMaskWallet;
function newMetaMaskWalletWithSetup(provider, onAccountsChanged) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var wallet;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wallet = new MetaMaskWallet(provider, onAccountsChanged);
                    return [4 /*yield*/, wallet.init()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, wallet];
            }
        });
    });
}
exports.newMetaMaskWalletWithSetup = newMetaMaskWalletWithSetup;
