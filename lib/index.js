"use strict";
exports.__esModule = true;
exports.Celo = void 0;
var tslib_1 = require("tslib");
var contractkit_1 = require("@celo/contractkit");
var signing_utils_1 = require("@celo/contractkit/lib/utils/signing-utils");
var tx_result_1 = require("@celo/contractkit/lib/utils/tx-result");
var detectEthereumProvider = require('@metamask/detect-provider');
var Web3 = require('web3');
function chainIdTransformationForSigning(chainId) {
    return chainId * 2 + 8;
}
function _rlpEncodedTx(kit, web3Tx) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var celoTx, gas, e_1, gasPrice, chainId, nonce;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    celoTx = kit.fillTxDefaults(JSON.parse(JSON.stringify(web3Tx)));
                    return [4 /*yield*/, kit.fillGasPrice(celoTx)];
                case 1:
                    celoTx = _a.sent();
                    if (!(celoTx.gas == null)) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, kit.web3.eth.estimateGas(celoTx)];
                case 3:
                    gas = _a.sent();
                    celoTx.gas = Math.round(gas * kit.config.gasInflationFactor);
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    throw new Error(e_1);
                case 5:
                    if (!(celoTx.gasPrice === '0x0')) return [3 /*break*/, 7];
                    return [4 /*yield*/, kit.web3.eth.getGasPrice()];
                case 6:
                    gasPrice = _a.sent();
                    celoTx.gasPrice = gasPrice;
                    _a.label = 7;
                case 7: return [4 /*yield*/, kit.web3.eth.getChainId()];
                case 8:
                    chainId = _a.sent();
                    celoTx.chainId = chainId;
                    return [4 /*yield*/, kit.web3.eth.getTransactionCount(celoTx.from)];
                case 9:
                    nonce = _a.sent();
                    celoTx.nonce = nonce;
                    return [2 /*return*/, signing_utils_1.rlpEncodedTx(celoTx)];
            }
        });
    });
}
var Celo = /** @class */ (function () {
    function Celo() {
    }
    Celo.prototype.init = function (provider, onAccountsChanged) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var ethr, address;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.kit = contractkit_1.newKit(provider);
                        return [4 /*yield*/, detectEthereumProvider()];
                    case 1:
                        ethr = _a.sent();
                        if (ethr) {
                            if (ethr.isMetaMask) {
                                this.web3 = new Web3(ethr);
                                if (onAccountsChanged) {
                                    ethr.on('accountsChanged', onAccountsChanged);
                                }
                            }
                            else {
                                // TODO: other ethereum wallet did not support.
                            }
                        }
                        else if (window["celo"]) {
                            if (window["celo"].isDexFair) {
                                // TODO: for DexFair
                            }
                            else if (window["celo"].isDSRV) {
                                // TODO: for DSRV
                            }
                        }
                        if (!onAccountsChanged) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getAccount()];
                    case 2:
                        address = _a.sent();
                        onAccountsChanged(address);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.changeNetwork = function (provider) {
        this.kit = null;
        this.kit = contractkit_1.newKit(provider);
    };
    Celo.prototype.getAccount = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accounts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.web3.eth.getAccounts()]; // MetaMask
                    case 1:
                        accounts = _a.sent() // MetaMask
                        ;
                        return [2 /*return*/, accounts.length > 0 ? accounts[0] : ''];
                }
            });
        });
    };
    Celo.prototype.estimateGas = function (web3Tx) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var celoTx, gas, e_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        celoTx = this.kit.fillTxDefaults(JSON.parse(JSON.stringify(web3Tx)));
                        return [4 /*yield*/, this.kit.fillGasPrice(celoTx)];
                    case 1:
                        celoTx = _a.sent();
                        if (!(celoTx.gas == null)) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.kit.web3.eth.estimateGas(celoTx)];
                    case 3:
                        gas = _a.sent();
                        celoTx.gas = Math.round(gas * this.kit.config.gasInflationFactor);
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _a.sent();
                        throw new Error(e_2);
                    case 5: return [2 /*return*/, celoTx.gas];
                }
            });
        });
    };
    Celo.prototype.sendTransaction = function (web3Tx) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var celoTx, signature, v, r, s, encodeTx, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, _rlpEncodedTx(this.kit, web3Tx)];
                    case 1:
                        celoTx = _a.sent();
                        return [4 /*yield*/, this.web3.eth.sign(signing_utils_1.getHashFromEncoded(celoTx.rlpEncode), celoTx.transaction.from)]; // MetaMask
                    case 2:
                        signature = _a.sent() // MetaMask
                        ;
                        v = this.kit.web3.utils.hexToNumber("0x" + signature.slice(130)) + chainIdTransformationForSigning(celoTx.transaction.chainId);
                        r = Buffer.from(signature.slice(2, 66), 'hex');
                        s = Buffer.from(signature.slice(66, 130), 'hex');
                        return [4 /*yield*/, signing_utils_1.encodeTransaction(celoTx, { v: v, s: s, r: r })];
                    case 3:
                        encodeTx = _a.sent();
                        return [2 /*return*/, tx_result_1.toTxResult(this.kit.web3.eth.sendSignedTransaction(encodeTx.raw))];
                    case 4:
                        error_1 = _a.sent();
                        throw new Error(error_1);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return Celo;
}());
exports.Celo = Celo;
