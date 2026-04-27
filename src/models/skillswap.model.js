import mongoose from "mongoose";

const skillswap_schema = mongoose.Schema({
    skill_offered: { 
        type: String 
    }, 
    skill_requested: { 
        type: String 
    }, 
    coins_offered: { 
        type: Number, 
        default: 0 
    }, 
    posted_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student", 
        required: true 
    }, 
    accepted_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student" 
    }, 
    status: { 
        type: String, 
        enum: ["open", "accepted", "completed"], 
        default: "open" 
    },
    duration: { 
        type: String 
    },
    feedback: { 
        type: String 
    }, 
    rating: { 
        type: Number 
    }, 
}, { timestamps: true });

const Skillswap = mongoose.model("Skillswap", skillswap_schema);
export default Skillswap;
