"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const promise_mysql_1 = __importDefault(require("promise-mysql"));
const keys_1 = __importDefault(require("./keys"));
const db = promise_mysql_1.default.createPool(keys_1.default.database.dev);
exports.db = db;
db.getConnection()
    .then(connection => {
    db.releaseConnection(connection);
    console.log('DB is Connected to ', keys_1.default.database.dev.host);
});
