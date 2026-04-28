import mongoose from "mongoose";

const organisation_schema = mongoose.Schema({
    name: { 
        type: String, 
    },
    email: { 
        type: String, 
        unique: true, 
        required: true 
    },
    password: { 
        type: String, 
    }, 
    avatar: { 
        type: String, 
        default: "default-org.png" 
    }, 
    profile: {
        website: { type: String },
        linkedin: { type: String },
        github: { type: String },
        otherProfiles: { type: Map, of: String }
    },
    location: { 
        type: String 
    },
    description: { 
        type: String 
    },
    posted_opportunities: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Opportunity" 
    }]
}, { timestamps: true });

const Organisation = mongoose.model("Organisation", organisation_schema);
export default Organisation;
