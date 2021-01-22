"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Celo = exports.ERC20ABI = exports.NETWORKS = void 0;
var contractkit_1 = require("@celo/contractkit");
var web3_1 = __importDefault(require("web3"));
var detect_provider_1 = __importDefault(require("@metamask/detect-provider"));
var hw_transport_webusb_1 = __importDefault(require("@ledgerhq/hw-transport-webusb"));
var erc20_abi_1 = require("./erc20.abi");
var wallet_1 = require("./wallet/ledgerWallet/wallet");
var wallet_2 = require("./wallet/metamask/wallet");
var wallet_3 = require("./wallet/dappbrowser/wallet");
var BluetoothTransport = require('@ledgerhq/hw-transport-web-ble').default;
exports.NETWORKS = {
    Mainnet: {
        provider: 'https://rc1-forno.celo-testnet.org',
        blockscout: 'https://explorer.celo.org',
    },
    Alfajores: {
        provider: 'https://alfajores-forno.celo-testnet.org',
        blockscout: 'https://alfajores-blockscout.celo-testnet.org',
    },
    Baklava: {
        provider: 'https://baklava-forno.celo-testnet.org',
        blockscout: 'https://baklava-blockscout.celo-testnet.org',
    },
};
exports.ERC20ABI = erc20_abi_1.ERC20ABI;
var Celo = /** @class */ (function () {
    function Celo(network) {
        var _this = this;
        this.isConnected = false;
        this.isDesktop = false;
        this.transport = null;
        this.wallet = null;
        this.contracts = {
            erc20: null,
        };
        this.getSupport = function () { return __awaiter(_this, void 0, void 0, function () {
            var celo, metamask, usb, ble;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        celo = !!window.celo;
                        metamask = window.ethereum && window.ethereum.isMetaMask;
                        return [4 /*yield*/, hw_transport_webusb_1.default.isSupported()];
                    case 1:
                        usb = _a.sent();
                        return [4 /*yield*/, BluetoothTransport.isSupported()];
                    case 2:
                        ble = _a.sent();
                        return [2 /*return*/, { celo: celo, metamask: metamask, usb: usb, ble: ble }];
                }
            });
        }); };
        this.getNetwork = function () {
            return _this.network;
        };
        this.network = network;
        this.kit = contractkit_1.newKit(this.network.provider);
        this.contracts.erc20 = new this.kit.web3.eth.Contract(exports.ERC20ABI);
    }
    Celo.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.transport) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.transport.on('disconnect', function () {
                                _this.transport = null;
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.isConnected = false;
                        if (localStorage) {
                            localStorage.setItem('CeloWebSigner', '');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.connectCelo = function (
    // eslint-disable-next-line no-unused-vars
    onChainChanged, 
    // eslint-disable-next-line no-unused-vars
    onAccountsChanged) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, web3, _a, accounts;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!window.celo) return [3 /*break*/, 4];
                        provider = window.celo;
                        if (!provider.isDesktop) return [3 /*break*/, 1];
                        this.kit = contractkit_1.newKit(this.network.provider);
                        provider.on('accountsChanged', function (accounts) {
                            if (onAccountsChanged) {
                                onAccountsChanged(accounts);
                            }
                        });
                        provider.on('chainChanged', function (chainId) { return __awaiter(_this, void 0, void 0, function () {
                            var INDEX;
                            return __generator(this, function (_a) {
                                INDEX = {
                                    '42220': { name: 'Mainnet' },
                                    '44787': { name: 'Alfajores' },
                                    '62320': { name: 'Baklava' },
                                };
                                if (onChainChanged) {
                                    onChainChanged(INDEX[chainId].name);
                                }
                                return [2 /*return*/];
                            });
                        }); });
                        return [3 /*break*/, 4];
                    case 1:
                        if (!provider.isMobile) return [3 /*break*/, 3];
                        web3 = new web3_1.default(this.network.provider);
                        _a = this;
                        return [4 /*yield*/, wallet_3.newDAppBrowserWalletWithSetup(web3, provider)];
                    case 2:
                        _a.wallet = _b.sent();
                        this.kit = contractkit_1.newKitFromWeb3(web3, this.wallet);
                        if (onAccountsChanged) {
                            accounts = this.wallet.getAccounts();
                            onAccountsChanged(accounts);
                        }
                        this.isConnected = true;
                        return [3 /*break*/, 4];
                    case 3: throw new Error('other celo wallet did not support.');
                    case 4: return [2 /*return*/, this.isConnected];
                }
            });
        });
    };
    // eslint-disable-next-line no-unused-vars
    Celo.prototype.reConnect = function (onAccountsChanged) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.isConnected) return [3 /*break*/, 8];
                        if (!localStorage) return [3 /*break*/, 8];
                        _a = localStorage.getItem('CeloWebSigner');
                        switch (_a) {
                            case 'metamask': return [3 /*break*/, 1];
                            case 'usb': return [3 /*break*/, 3];
                            case 'ble': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.connectMetaMask(onAccountsChanged)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 3: return [4 /*yield*/, this.connectLedgerUSB(onAccountsChanged)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 5: return [4 /*yield*/, this.connectLedgerBLE(onAccountsChanged)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, this.isConnected];
                }
            });
        });
    };
    Celo.prototype.connectMetaMask = function (
    // eslint-disable-next-line no-unused-vars
    onAccountsChanged) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, web3, _a, accounts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!window.ethereum) return [3 /*break*/, 6];
                        if (!window.ethereum.isMetaMask) return [3 /*break*/, 2];
                        return [4 /*yield*/, window.ethereum.enable()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, detect_provider_1.default({ mustBeMetaMask: true })];
                    case 3:
                        provider = _b.sent();
                        if (!(provider && provider.isMetaMask)) return [3 /*break*/, 5];
                        web3 = new web3_1.default(this.network.provider);
                        _a = this;
                        return [4 /*yield*/, wallet_2.newMetaMaskWalletWithSetup(provider, onAccountsChanged)];
                    case 4:
                        _a.wallet = _b.sent();
                        this.kit = contractkit_1.newKitFromWeb3(web3, this.wallet);
                        if (onAccountsChanged) {
                            accounts = this.wallet.getAccounts();
                            onAccountsChanged('metamask', accounts);
                            if (localStorage) {
                                localStorage.setItem('CeloWebSigner', 'metamask');
                            }
                        }
                        this.isConnected = true;
                        return [3 /*break*/, 6];
                    case 5: throw new Error('other ethereum wallet did not support.');
                    case 6: return [2 /*return*/, this.isConnected];
                }
            });
        });
    };
    Celo.prototype.connectLedgerUSB = function (
    // eslint-disable-next-line no-unused-vars
    onAccountsChanged) {
        return __awaiter(this, void 0, void 0, function () {
            var transport;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, hw_transport_webusb_1.default.isSupported()];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        return [4 /*yield*/, hw_transport_webusb_1.default.create()];
                    case 2:
                        transport = _a.sent();
                        return [4 /*yield*/, this.ledgerSetup('usb', transport, onAccountsChanged)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, this.isConnected];
                }
            });
        });
    };
    Celo.prototype.connectLedgerBLE = function (
    // eslint-disable-next-line no-unused-vars
    onAccountsChanged) {
        return __awaiter(this, void 0, void 0, function () {
            var transport;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, BluetoothTransport.isSupported()];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        return [4 /*yield*/, BluetoothTransport.create()];
                    case 2:
                        transport = _a.sent();
                        return [4 /*yield*/, this.ledgerSetup('ble', transport, onAccountsChanged)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, this.isConnected];
                }
            });
        });
    };
    Celo.prototype.ledgerSetup = function (type, transport, 
    // eslint-disable-next-line no-unused-vars
    onAccountsChanged) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, address, web3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.transport = transport;
                        _a = this;
                        return [4 /*yield*/, wallet_1.newLedgerWalletWithSetup(transport)];
                    case 1:
                        _a.wallet = _b.sent();
                        address = this.wallet.getAccounts();
                        if (address.length > 0) {
                            web3 = new web3_1.default(this.network.provider);
                            this.kit = contractkit_1.newKitFromWeb3(web3, this.wallet);
                            if (onAccountsChanged) {
                                onAccountsChanged(type, address);
                                if (localStorage) {
                                    localStorage.setItem('CeloWebSigner', type);
                                }
                            }
                            this.isConnected = true;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.changeNetwork = function (network) {
        return __awaiter(this, void 0, void 0, function () {
            var web3;
            return __generator(this, function (_a) {
                if (!this.isDesktop) {
                    this.network = network;
                    if (this.wallet) {
                        web3 = new web3_1.default(this.network.provider);
                        this.kit = contractkit_1.newKitFromWeb3(web3, this.wallet);
                    }
                    else {
                        this.kit = contractkit_1.newKit(this.network.provider);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    Celo.prototype.getAccounts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isDesktop) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.kit.web3.eth.getAccounts()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 2: return [2 /*return*/, this.wallet ? this.wallet.getAccounts() : []];
                }
            });
        });
    };
    Celo.prototype.sendTransaction = function (web3Tx) {
        return __awaiter(this, void 0, void 0, function () {
            var txResult, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.kit.sendTransaction(web3Tx)];
                    case 1:
                        txResult = _a.sent();
                        return [2 /*return*/, txResult.waitReceipt()];
                    case 2:
                        error_1 = _a.sent();
                        throw new Error(error_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.sign = function (message, account) {
        return __awaiter(this, void 0, void 0, function () {
            var result, v;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.wallet) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.wallet.signPersonalMessage(account, this.kit.web3.utils.toHex(message))];
                    case 1:
                        result = _a.sent();
                        v = this.kit.web3.utils.hexToNumber("0x" + result.slice(130));
                        if (v < 27) {
                            v += 27;
                        }
                        return [2 /*return*/, result.slice(0, 130).concat(v.toString(16))];
                    case 2: return [2 /*return*/, null];
                }
            });
        });
    };
    Celo.prototype.recover = function (message, signature) {
        try {
            var result = this.kit.web3.eth.accounts.recover(this.kit.web3.utils.toHex(message), signature);
            return result;
        }
        catch (error) {
            throw new Error(error);
        }
    };
    return Celo;
}());
exports.Celo = Celo;
//# sourceMappingURL=index.js.map