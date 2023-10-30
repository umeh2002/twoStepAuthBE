"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (Schema) => {
    return (req, res, next) => {
        const { error } = Schema.validate(req.body);
        if (error === undefined || typeof error === "undefined") {
            next();
        }
        else {
            return res.status(404).json({
                message: "error",
                data: error.message,
            });
        }
    };
};
