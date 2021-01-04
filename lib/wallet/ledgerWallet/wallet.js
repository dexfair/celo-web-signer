"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.newLedgerWalletWithSetup = exports.Wallet = void 0;
var wallet_base_1 = require("@celo/wallet-base");
var signer_1 = require("./signer");
var Ledger = require('@ledgerhq/hw-app-eth').default;
var Wallet = /** @class */ (function (_super) {
    __extends(Wallet, _super);
    function Wallet(transport) {
        var _this = _super.call(this) || this;
        _this.path = "44'/52752'/0'/0/";
        _this.ledger = new Ledger(transport);
        return _this;
    }
    Wallet.prototype.init = function (count) {
        return __awaiter(this, void 0, void 0, function () {
            var temp, temp1, i, path;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        temp = this.getAccounts();
                        temp.forEach(function (address) {
                            _this.removeSigner(address);
                        });
                        temp1 = [];
                        for (i = 0; i < count; i += 1) {
                            path = this.path + i.toString();
                            temp1.push(this.ledger.getAddress(path));
                        }
                        return [4 /*yield*/, Promise.all(temp1)];
                    case 1:
                        (_a.sent()).forEach(function (_a, index) {
                            var address = _a.address;
                            _this.addSigner(address, new signer_1.Signer(_this.ledger, _this.path + index.toString()));
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return Wallet;
}(wallet_base_1.WalletBase));
exports.Wallet = Wallet;
function newLedgerWalletWithSetup(transport, count) {
    if (count === void 0) { count = 1; }
    return __awaiter(this, void 0, void 0, function () {
        var wallet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wallet = new Wallet(transport);
                    return [4 /*yield*/, wallet.init(count)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, wallet];
            }
        });
    });
}
exports.newLedgerWalletWithSetup = newLedgerWalletWithSetup;
//# sourceMappingURL=wallet.js.map