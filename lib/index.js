"use strict";
exports.__esModule = true;
exports.Celo = exports.ERC20ABI = exports.NETWORKS = void 0;
var tslib_1 = require("tslib");
var contractkit_1 = require("@celo/contractkit");
var signing_utils_1 = require("@celo/contractkit/lib/utils/signing-utils");
var tx_result_1 = require("@celo/contractkit/lib/utils/tx-result");
var web3_1 = tslib_1.__importDefault(require("web3"));
var detect_provider_1 = tslib_1.__importDefault(require("@metamask/detect-provider"));
var hw_transport_webusb_1 = tslib_1.__importDefault(require("@ledgerhq/hw-transport-webusb"));
var hw_transport_u2f_1 = tslib_1.__importDefault(require("@ledgerhq/hw-transport-u2f"));
var erc20_abi_1 = require("./erc20.abi");
var Ledger = require('@ledgerhq/hw-app-eth')["default"];
function chainIdTransformationForSigning(chainId) {
    return chainId * 2 + 8;
}
function createLedgerProvider(transport, type) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var ledger, provider, error_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ledger = new Ledger(transport);
                    provider = {
                        isLedger: true,
                        type: type,
                        index: 0,
                        getPath: function (index) { return "44'/52752'/0'/0/" + index; },
                        getAccount: ledger.getAddress,
                        signTransaction: ledger.signTransaction,
                        signPersonalMessage: ledger.signPersonalMessage
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, provider.getAccount(provider.getPath(0))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, provider];
                case 3:
                    error_1 = _a.sent();
                    console.log(new Error(error_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    });
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
    function Celo(network) {
        this.isEnable = false;
        this.contracts = {
            erc20: null,
            goldToken: null,
            stableToken: null,
            exchange: null
        };
        this.kit = contractkit_1.newKit(network.provider);
    }
    Celo.prototype.connect = function (onChainChanged, onAccountsChanged) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, error_2, transport, _b, _c, _d, transport, _e, _f, address;
            var _this = this;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, this.updateContracts()];
                    case 1:
                        _g.sent();
                        _a = !this.isEnable;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, hw_transport_webusb_1["default"].isSupported()];
                    case 2:
                        _a = (_g.sent());
                        _g.label = 3;
                    case 3:
                        if (!_a) return [3 /*break*/, 12];
                        return [4 /*yield*/, hw_transport_webusb_1["default"].list()];
                    case 4:
                        if (!((_g.sent()).length === 0)) return [3 /*break*/, 8];
                        _g.label = 5;
                    case 5:
                        _g.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, window['navigator'].usb.requestDevice({ filters: [{ vendorId: '0x2c97' }] })];
                    case 6:
                        _g.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _g.sent();
                        console.log(new Error(error_2));
                        return [3 /*break*/, 8];
                    case 8: return [4 /*yield*/, hw_transport_webusb_1["default"].list()];
                    case 9:
                        if (!((_g.sent()).length > 0)) return [3 /*break*/, 12];
                        return [4 /*yield*/, hw_transport_webusb_1["default"].create()];
                    case 10:
                        transport = _g.sent();
                        _b = this;
                        return [4 /*yield*/, createLedgerProvider(transport, 'usb')];
                    case 11:
                        _b.provider = _g.sent();
                        this.isEnable = this.provider ? true : false;
                        _g.label = 12;
                    case 12:
                        _d = !this.isEnable;
                        if (!_d) return [3 /*break*/, 14];
                        return [4 /*yield*/, hw_transport_u2f_1["default"].isSupported()];
                    case 13:
                        _d = (_g.sent());
                        _g.label = 14;
                    case 14:
                        _c = _d;
                        if (!_c) return [3 /*break*/, 16];
                        return [4 /*yield*/, hw_transport_u2f_1["default"].list()];
                    case 15:
                        _c = (_g.sent()).length > 0;
                        _g.label = 16;
                    case 16:
                        if (!_c) return [3 /*break*/, 19];
                        return [4 /*yield*/, hw_transport_u2f_1["default"].create()];
                    case 17:
                        transport = _g.sent();
                        _e = this;
                        return [4 /*yield*/, createLedgerProvider(transport, 'u2f')];
                    case 18:
                        _e.provider = _g.sent();
                        this.isEnable = this.provider ? true : false;
                        _g.label = 19;
                    case 19:
                        if (!(!this.isEnable && window['celo'])) return [3 /*break*/, 20];
                        this.provider = window['celo'];
                        if (window['celo'].isDesktop) {
                            this.web3 = new web3_1["default"](this.provider);
                            this.provider.on('chainChanged', function (chainId) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var INDEX;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            INDEX = {
                                                '42220': { name: 'Mainnet' },
                                                '44787': { name: 'Alfajores' },
                                                '62320': { name: 'Baklava' }
                                            };
                                            return [4 /*yield*/, this.changeNetwork(INDEX[chainId].name)];
                                        case 1:
                                            _a.sent();
                                            if (onChainChanged) {
                                                onChainChanged(INDEX[chainId].name);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            if (onAccountsChanged) {
                                this.provider.on('accountsChanged', function (accounts) { onAccountsChanged(accounts[0]); });
                            }
                            this.isEnable = true;
                        }
                        else if (window['celo'].isMobile) {
                            this.isEnable = true;
                        }
                        return [3 /*break*/, 24];
                    case 20:
                        if (!(!this.isEnable && window['ethereum'])) return [3 /*break*/, 24];
                        if (!window['ethereum'].isMetaMask) return [3 /*break*/, 22];
                        return [4 /*yield*/, window['ethereum'].enable()];
                    case 21:
                        _g.sent();
                        _g.label = 22;
                    case 22:
                        _f = this;
                        return [4 /*yield*/, detect_provider_1["default"]()];
                    case 23:
                        _f.provider = _g.sent();
                        if (this.provider) {
                            if (this.provider.isMetaMask) {
                                this.web3 = new web3_1["default"](this.provider);
                                if (onAccountsChanged) {
                                    this.provider.on('accountsChanged', function (accounts) { onAccountsChanged(accounts[0]); });
                                }
                                this.isEnable = true;
                            }
                            else {
                                console.error('other ethereum wallet did not support.');
                            }
                        }
                        _g.label = 24;
                    case 24:
                        if (!(this.isEnable && onAccountsChanged)) return [3 /*break*/, 26];
                        return [4 /*yield*/, this.getAccount()];
                    case 25:
                        address = _g.sent();
                        onAccountsChanged(address);
                        _g.label = 26;
                    case 26: return [2 /*return*/, this.isEnable];
                }
            });
        });
    };
    Celo.prototype.changeNetwork = function (network) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.provider.isDesktop) return [3 /*break*/, 2];
                        this.kit = null;
                        this.kit = contractkit_1.newKit(network.provider);
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
                        return [4 /*yield*/, this.kit.contracts.getGoldToken()];
                    case 1:
                        _a.goldToken = (_d.sent()).contract;
                        _b = this.contracts;
                        return [4 /*yield*/, this.kit.contracts.getStableToken()];
                    case 2:
                        _b.stableToken = (_d.sent()).contract;
                        _c = this.contracts;
                        return [4 /*yield*/, this.kit.contracts.getExchange()];
                    case 3:
                        _c.exchange = (_d.sent()).contract;
                        return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.getAccount = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accounts, provider_1, temp, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accounts = [];
                        if (!(this.provider.isMetaMask || this.provider.isDesktop)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.web3.eth.getAccounts()];
                    case 1:
                        accounts = _a.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!this.provider.isMobile) return [3 /*break*/, 4];
                        provider_1 = this.provider;
                        temp = function () {
                            return new Promise(function (resolve, reject) {
                                provider_1.getAccount(resolve, reject);
                            });
                        };
                        return [4 /*yield*/, temp()];
                    case 3:
                        accounts = [(_a.sent())];
                        return [3 /*break*/, 6];
                    case 4:
                        if (!this.provider.isLedger) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.provider.getAccount(this.provider.getPath(this.provider.index))];
                    case 5:
                        result = _a.sent();
                        accounts = [result.address];
                        _a.label = 6;
                    case 6: return [2 /*return*/, accounts.length > 0 ? accounts[0] : ''];
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
            var celoTx, signature, v, r, s, encodeTx, error_3;
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
                        error_3 = _a.sent();
                        throw new Error(error_3);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.sendTransaction = function (web3Tx) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var txReceipt, provider_2, _a, temp, tx, celoTx, signature, addToV, rv, v, r, s, encodeTx;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        txReceipt = null;
                        if (!this.provider.isMetaMask) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendTransactionMetaMask(web3Tx)];
                    case 1:
                        txReceipt = (_b.sent()).waitReceipt();
                        return [3 /*break*/, 11];
                    case 2:
                        if (!this.provider.isDesktop) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.kit.web3.eth.sendTransaction(web3Tx)];
                    case 3:
                        txReceipt = _b.sent();
                        return [3 /*break*/, 11];
                    case 4:
                        if (!this.provider.isMobile) return [3 /*break*/, 7];
                        provider_2 = this.provider;
                        _a = web3Tx;
                        return [4 /*yield*/, this.kit.web3.eth.getChainId()];
                    case 5:
                        _a.chainId = _b.sent();
                        temp = function () {
                            return new Promise(function (resolve, reject) {
                                provider_2.sendTransaction(web3Tx, resolve, reject);
                            });
                        };
                        return [4 /*yield*/, temp()];
                    case 6:
                        tx = _b.sent();
                        txReceipt = tx_result_1.toTxResult(this.kit.web3.eth.sendSignedTransaction(tx)).waitReceipt();
                        return [3 /*break*/, 11];
                    case 7:
                        if (!this.provider.isLedger) return [3 /*break*/, 11];
                        return [4 /*yield*/, _rlpEncodedTx(this.kit, web3Tx)];
                    case 8:
                        celoTx = _b.sent();
                        return [4 /*yield*/, this.provider.signTransaction(this.provider.getPath(this.provider.index), celoTx.rlpEncode.slice(2))];
                    case 9:
                        signature = _b.sent();
                        addToV = celoTx.transaction.chainId * 2 + 35;
                        rv = parseInt(signature.v, 16);
                        if (rv !== addToV && (rv & addToV) !== rv) {
                            addToV += 1;
                        }
                        v = addToV;
                        r = Buffer.from(signature.r, 'hex');
                        s = Buffer.from(signature.s, 'hex');
                        return [4 /*yield*/, signing_utils_1.encodeTransaction(celoTx, { v: v, s: s, r: r })];
                    case 10:
                        encodeTx = _b.sent();
                        txReceipt = tx_result_1.toTxResult(this.kit.web3.eth.sendSignedTransaction(encodeTx.raw)).waitReceipt();
                        _b.label = 11;
                    case 11: return [2 /*return*/, txReceipt];
                }
            });
        });
    };
    Celo.prototype.sign = function (message, account) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, v, s, r;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.provider.isMetaMask || this.provider.isDesktop)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.web3.eth.personal.sign(message, account)];
                    case 1: return [2 /*return*/, (_b.sent())];
                    case 2:
                        if (!this.provider.isMobile) return [3 /*break*/, 3];
                        return [3 /*break*/, 5];
                    case 3:
                        if (!this.provider.isLedger) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.provider.sign(this.provider.getPath(this.provider.index), Buffer.from(message).toString('hex'))];
                    case 4:
                        _a = _b.sent(), v = _a.v, s = _a.s, r = _a.r;
                        v = (v - 27).toString(16);
                        if (v.length < 2) {
                            v = "0" + v;
                        }
                        return [2 /*return*/, "0x" + r + s + v];
                    case 5: return [2 /*return*/, null];
                }
            });
        });
    };
    return Celo;
}());
exports.Celo = Celo;
