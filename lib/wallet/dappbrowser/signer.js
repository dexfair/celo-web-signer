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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
var Signer = /** @class */ (function () {
    function Signer(web3, mobile) {
        var _this = this;
        this.signPersonalMessage = function (data) {
            throw new Error("Not implemented. " + data);
        };
        this.signTypedData = function (typedData) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Not implemented. " + typedData.message);
            });
        }); };
        this.getNativeKey = function () {
            throw new Error('Not implemented');
        };
        this.decrypt = function (_ciphertext) {
            throw new Error("Not implemented. " + _ciphertext);
            return Promise.resolve(Buffer.from([]));
        };
        this.computeSharedSecret = function (_publicKey) {
            throw new Error("Not implemented. " + _publicKey);
            return Promise.resolve(Buffer.from([]));
        };
        this.web3 = web3;
        this.mobile = mobile;
    }
    Signer.prototype.signTransaction = function (addToV, encodedTx) {
        return __awaiter(this, void 0, void 0, function () {
            var chainId, _a, temp, signature, v, r, s;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!encodedTx.transaction.chainId) return [3 /*break*/, 1];
                        _a = encodedTx.transaction.chainId;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.web3.eth.getChainId()];
                    case 2:
                        _a = _b.sent();
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
                        // eslint-disable-next-line no-console
                        console.log(addToV); // TODO - test
                        v = this.web3.utils.hexToNumber("0x" + signature.slice(130)) + (chainId * 2 + 8);
                        r = Buffer.from(signature.slice(2, 66), 'hex');
                        s = Buffer.from(signature.slice(66, 130), 'hex');
                        return [2 /*return*/, { v: v, s: s, r: r }];
                }
            });
        });
    };
    return Signer;
}());
exports.Signer = Signer;
//# sourceMappingURL=signer.js.map