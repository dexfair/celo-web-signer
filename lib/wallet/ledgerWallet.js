"use strict";
exports.__esModule = true;
exports.newLedgerWalletWithSetup = exports.LedgerWallet = exports.LedgerSigner = void 0;
var tslib_1 = require("tslib");
var wallet_base_1 = require("@celo/wallet-base");
var Ledger = require('@ledgerhq/hw-app-eth')["default"];
var LedgerSigner = /** @class */ (function () {
    function LedgerSigner(ledger, path) {
        this.ledger = ledger;
        this.path = path;
    }
    LedgerSigner.prototype.signTransaction = function (addToV, encodedTx) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var signature, rv;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ledger.signTransaction(this.path, encodedTx.rlpEncode.slice(2))
                        // EIP155 support. check/recalc signature v value.
                    ];
                    case 1:
                        signature = _a.sent();
                        rv = parseInt(signature.v, 16);
                        // tslint:disable-next-line: no-bitwise
                        if (rv !== addToV && (rv & addToV) !== rv) {
                            addToV += 1; // add signature v bit.
                        }
                        signature.v = addToV.toString(10);
                        return [2 /*return*/, {
                                v: signature.v,
                                r: Buffer.from(signature.r, 'hex'),
                                s: Buffer.from(signature.s, 'hex')
                            }];
                }
            });
        });
    };
    LedgerSigner.prototype.signPersonalMessage = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var signature;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ledger.signPersonalMessage(this.path, data.replace('0x', ''))];
                    case 1:
                        signature = _a.sent();
                        return [2 /*return*/, {
                                v: signature.v,
                                r: Buffer.from(signature.r, 'hex'),
                                s: Buffer.from(signature.s, 'hex')
                            }];
                }
            });
        });
    };
    LedgerSigner.prototype.signTypedData = function (typedData) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                throw new Error('Not implemented');
            });
        });
    };
    LedgerSigner.prototype.getNativeKey = function () {
        throw new Error('Not implemented');
    };
    LedgerSigner.prototype.decrypt = function (_ciphertext) {
        throw new Error('Not implemented');
        return Promise.resolve(Buffer.from([]));
    };
    LedgerSigner.prototype.computeSharedSecret = function (_publicKey) {
        throw new Error('Not implemented');
        return Promise.resolve(Buffer.from([]));
    };
    return LedgerSigner;
}());
exports.LedgerSigner = LedgerSigner;
var LedgerWallet = /** @class */ (function (_super) {
    tslib_1.__extends(LedgerWallet, _super);
    function LedgerWallet(transport) {
        var _this = _super.call(this) || this;
        _this.path = '44\'/52752\'/0\'/0/';
        _this.ledger = new Ledger(transport);
        return _this;
    }
    LedgerWallet.prototype.init = function (count) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var temp, i, path, address;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        temp = this.getAccounts();
                        temp.forEach(function (address) { _this.removeSigner(address); });
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < count)) return [3 /*break*/, 4];
                        path = this.path + i.toString();
                        return [4 /*yield*/, this.ledger.getAddress(path)];
                    case 2:
                        address = (_a.sent()).address;
                        this.addSigner(address, new LedgerSigner(this.ledger, path));
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return LedgerWallet;
}(wallet_base_1.WalletBase));
exports.LedgerWallet = LedgerWallet;
function newLedgerWalletWithSetup(transport, count) {
    if (count === void 0) { count = 1; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var wallet;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wallet = new LedgerWallet(transport);
                    return [4 /*yield*/, wallet.init(count)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, wallet];
            }
        });
    });
}
exports.newLedgerWalletWithSetup = newLedgerWalletWithSetup;
