import mongoose from "mongoose";

const transaction_schema = mongoose.Schema({
    from_student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student" 
    }, 
    to_student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student" 
    }, 
    amount: { 
        type: Number, 
        required: true 
    }, 
    reason: { 
        type: String, 
        enum: ["skillswap", "reward", "purchase"], 
        required: true 
    }, 
    relatedSkillswap: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Skillswap" 
    }, 
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transaction_schema);
export default Transaction;
