"use strict";
exports.__esModule = true;
exports.newDAppBrowserWalletWithSetup = exports.DAppBrowserWallet = exports.DAppBrowserSigner = void 0;
var tslib_1 = require("tslib");
var wallet_base_1 = require("@celo/wallet-base");
var DAppBrowserSigner = /** @class */ (function () {
    function DAppBrowserSigner(web3, mobile) {
        this.web3 = web3;
        this.mobile = mobile;
    }
    DAppBrowserSigner.prototype.signTransaction = function (addToV, encodedTx) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var chainId, _a, temp, signature, v, r, s;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!encodedTx.transaction.chainId) return [3 /*break*/, 1];
                        _a = encodedTx.transaction.chainId;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.web3.eth.getChainId()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        chainId = _a;
                        temp = function () {
                            return new Promise(function (resolve, reject) {
                                _this.mobile.sendTransaction(encodedTx.transaction, resolve, reject);
                            });
                        };
                        return [4 /*yield*/, temp()];
                    case 4:
                        signature = _b.sent();
                        console.log(addToV); // TODO - test
                        v = this.web3.utils.hexToNumber("0x" + signature.slice(130)) + (chainId * 2 + 8);
                        r = Buffer.from(signature.slice(2, 66), 'hex');
                        s = Buffer.from(signature.slice(66, 130), 'hex');
                        return [2 /*return*/, { v: v, s: s, r: r }];
                }
            });
        });
    };
    DAppBrowserSigner.prototype.signPersonalMessage = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                throw new Error('Not implemented');
            });
        });
    };
    DAppBrowserSigner.prototype.signTypedData = function (typedData) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                throw new Error('Not implemented');
            });
        });
    };
    DAppBrowserSigner.prototype.getNativeKey = function () {
        throw new Error('Not implemented');
        return '';
    };
    DAppBrowserSigner.prototype.decrypt = function (_ciphertext) {
        throw new Error('Not implemented');
        return Promise.resolve(Buffer.from([]));
    };
    DAppBrowserSigner.prototype.computeSharedSecret = function (_publicKey) {
        throw new Error('Not implemented');
        return Promise.resolve(Buffer.from([]));
    };
    return DAppBrowserSigner;
}());
exports.DAppBrowserSigner = DAppBrowserSigner;
var DAppBrowserWallet = /** @class */ (function (_super) {
    tslib_1.__extends(DAppBrowserWallet, _super);
    function DAppBrowserWallet(web3, mobile) {
        var _this = _super.call(this) || this;
        _this.accounts = [];
        _this.web3 = web3;
        _this.mobile = mobile;
        return _this;
    }
    DAppBrowserWallet.prototype.init = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var temp, _a;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        temp = function () {
                            return new Promise(function (resolve, reject) {
                                _this.mobile.getAccount(resolve, reject);
                            });
                        };
                        this.accounts.forEach(function (address) { _this.removeSigner(address); });
                        _a = this;
                        return [4 /*yield*/, temp()];
                    case 1:
                        _a.accounts = [(_b.sent())];
                        this.accounts.forEach(function (address) { _this.addSigner(address, new DAppBrowserSigner(_this.web3, _this.mobile)); });
                        return [2 /*return*/];
                }
            });
        });
    };
    DAppBrowserWallet.prototype.getAccounts = function () {
        return this.accounts;
    };
    DAppBrowserWallet.prototype.addAccount = function (address) {
        throw new Error('Not implemented');
    };
    return DAppBrowserWallet;
}(wallet_base_1.WalletBase));
exports.DAppBrowserWallet = DAppBrowserWallet;
function newDAppBrowserWalletWithSetup(web3, mobile) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var wallet;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wallet = new DAppBrowserWallet(web3, mobile);
                    return [4 /*yield*/, wallet.init()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, wallet];
            }
        });
    });
}
exports.newDAppBrowserWalletWithSetup = newDAppBrowserWalletWithSetup;
