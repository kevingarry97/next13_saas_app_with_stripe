import { Schema, model, models } from "mongoose";

const logSchema = new Schema({
    userId: {
        type: String
    },
    method: {
        type: String
    },
    status: {
        type: Number
    },
    created: {
        type: Date,
        default: Date.now()
    }
});

const Log = models.Log || model("Log", logSchema);

export default Log;
