import mongoose from "mongoose";

const collaboration_schema = mongoose.Schema({
    project_title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    required_skills: {
        type : [String]
    }, 
    posted_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student" 
    }, 
    applicants: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Student" 
        }
    ], 
    accepted_by: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Student" 
        }
    ], 
    status: { 
        type: String, enum: ["open", "in-progress", "completed"], default: "open" 
    }
}, { timestamps: true });

const Collaboration = mongoose.model("Collaboration", collaboration_schema);
export default Collaboration;