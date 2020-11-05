"use strict";
exports.__esModule = true;
exports.Celo = exports.ERC20ABI = exports.NETWORKS = void 0;
var tslib_1 = require("tslib");
var contractkit_1 = require("@celo/contractkit");
var signing_utils_1 = require("@celo/contractkit/lib/utils/signing-utils");
var tx_result_1 = require("@celo/contractkit/lib/utils/tx-result");
var web3_1 = tslib_1.__importDefault(require("web3"));
var detect_provider_1 = tslib_1.__importDefault(require("@metamask/detect-provider"));
var erc20_abi_1 = require("./erc20.abi");
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
exports.NETWORKS = {
    Mainnet: { provider: 'https://rc1-forno.celo-testnet.org', blockscout: 'https://explorer.celo.org' },
    Alfajores: { provider: 'https://alfajores-forno.celo-testnet.org', blockscout: 'https://alfajores-blockscout.celo-testnet.org' },
    Baklava: { provider: 'https://baklava-forno.celo-testnet.org', blockscout: 'https://baklava-blockscout.celo-testnet.org' }
};
exports.ERC20ABI = erc20_abi_1.ERC20ABI;
var Celo = /** @class */ (function () {
    function Celo(providerName) {
        this.contracts = {
            erc20: null,
            goldToken: null,
            stableToken: null,
            exchange: null
        };
        this.kit = contractkit_1.newKit(exports.NETWORKS[providerName].provider);
    }
    Celo.prototype.init = function (onChainChanged, onAccountsChanged) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, address;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.updateContracts()];
                    case 1:
                        _b.sent();
                        if (!window['ethereum']) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, detect_provider_1["default"]()];
                    case 2:
                        _a.provider = _b.sent();
                        if (this.provider) {
                            if (this.provider.isMetaMask) {
                                this.web3 = new web3_1["default"](this.provider);
                                if (onAccountsChanged) {
                                    this.provider.on('accountsChanged', onAccountsChanged);
                                }
                            }
                            else {
                                console.error('other ethereum wallet did not support.');
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        if (window['celo']) {
                            this.provider = window['celo'];
                            if (window['celo'].isDesktop) {
                                this.web3 = new web3_1["default"](this.provider);
                                this.provider.on('chainChanged', function (chainId) {
                                    var INDEX = {
                                        '42220': { name: 'Mainnet' },
                                        '44787': { name: 'Alfajores' },
                                        '62320': { name: 'Baklava' }
                                    };
                                    _this.changeNetwork(INDEX[chainId].name);
                                    if (onChainChanged) {
                                        onChainChanged(INDEX[chainId].name);
                                    }
                                });
                                if (onAccountsChanged) {
                                    this.provider.on('accountsChanged', onAccountsChanged);
                                }
                            }
                        }
                        _b.label = 4;
                    case 4:
                        if (!onAccountsChanged) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getAccount()];
                    case 5:
                        address = _b.sent();
                        onAccountsChanged(address);
                        _b.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.changeNetwork = function (providerName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.provider.isDesktop) return [3 /*break*/, 2];
                        this.kit = null;
                        this.kit = contractkit_1.newKit(exports.NETWORKS[providerName].provider);
                        return [4 /*yield*/, this.updateContracts()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.updateContracts = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key, _a, _b, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        for (key in this.contracts) {
                            this.contracts[key] = null;
                        }
                        this.contracts.erc20 = new this.kit.web3.eth.Contract(exports.ERC20ABI);
                        _a = this.contracts;
                        return [4 /*yield*/, this.kit._web3Contracts.getGoldToken()];
                    case 1:
                        _a.goldToken = _d.sent();
                        _b = this.contracts;
                        return [4 /*yield*/, this.kit._web3Contracts.getStableToken()];
                    case 2:
                        _b.stableToken = _d.sent();
                        _c = this.contracts;
                        return [4 /*yield*/, this.kit._web3Contracts.getExchange()];
                    case 3:
                        _c.exchange = _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.getAccount = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accounts, provider_1, temp;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accounts = [];
                        if (!(this.provider.isMetaMask || this.provider.isDesktop)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.web3.eth.getAccounts()];
                    case 1:
                        accounts = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!this.provider.isDesktop) return [3 /*break*/, 4];
                        provider_1 = this.provider;
                        temp = function () {
                            return new Promise(function (resolve, reject) {
                                provider_1.getAccount(resolve, reject);
                            });
                        };
                        return [4 /*yield*/, temp()];
                    case 3:
                        accounts = [(_a.sent())];
                        _a.label = 4;
                    case 4: return [2 /*return*/, accounts.length > 0 ? accounts[0] : ''];
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
    Celo.prototype.estimateFee = function (web3Tx) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var gas, price;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.estimateGas(web3Tx)];
                    case 1:
                        gas = _a.sent();
                        return [4 /*yield*/, this.kit.web3.eth.getGasPrice()];
                    case 2:
                        price = _a.sent();
                        return [2 /*return*/, this.kit.web3.utils.fromWei(this.kit.web3.utils.toBN(gas).mul(this.kit.web3.utils.toBN(price)))];
                }
            });
        });
    };
    Celo.prototype.sendTransactionMetaMask = function (web3Tx) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var celoTx, signature, v, r, s, encodeTx, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, _rlpEncodedTx(this.kit, web3Tx)];
                    case 1:
                        celoTx = _a.sent();
                        return [4 /*yield*/, this.web3.eth.sign(signing_utils_1.getHashFromEncoded(celoTx.rlpEncode), celoTx.transaction.from)];
                    case 2:
                        signature = _a.sent();
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
    Celo.prototype.sendTransaction = function (web3Tx) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var txReceipt, provider_2, temp, tx;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txReceipt = null;
                        if (!this.provider.isMetaMask) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendTransactionMetaMask(web3Tx)];
                    case 1:
                        txReceipt = (_a.sent()).waitReceipt();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!this.provider.isDesktop) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.kit.web3.eth.sendTransaction(web3Tx)];
                    case 3:
                        txReceipt = _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        if (!this.provider.isMobile) return [3 /*break*/, 6];
                        provider_2 = this.provider;
                        temp = function () {
                            return new Promise(function (resolve, reject) {
                                provider_2.sendTransaction(web3Tx, resolve, reject);
                            });
                        };
                        return [4 /*yield*/, temp()];
                    case 5:
                        tx = _a.sent();
                        txReceipt = tx_result_1.toTxResult(this.kit.web3.eth.sendSignedTransaction(tx)).waitReceipt();
                        _a.label = 6;
                    case 6: return [2 /*return*/, txReceipt];
                }
            });
        });
    };
    Celo.prototype.sign = function (message, account) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.provider.isMetaMask || this.provider.isDesktop)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.web3.eth.personal.sign(message, account)];
                    case 1: return [2 /*return*/, (_a.sent())];
                    case 2: 
                    // TODO: valora not support sign message
                    return [2 /*return*/, null];
                }
            });
        });
    };
    return Celo;
}());
exports.Celo = Celo;
