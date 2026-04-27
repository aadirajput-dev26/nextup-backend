import mongoose from "mongoose";

const connection_schema = mongoose.Schema({
    requester: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student", 
        required: true 
    }, 
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student", 
        required: true  
    }, 
    status: { 
        type: String, 
        enum: ["pending", "accepted", "rejected"], 
        default: "pending" 
    }
}, { timestamps: true });

const Connection = mongoose.model("Connection", connection_schema);
export default Connection;
