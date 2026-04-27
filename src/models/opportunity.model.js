import mongoose from "mongoose";

const opportunity_schema = mongoose.Schema({
    title: {
        type: String, 
        required: true 
    },
    type: { 
        type: String, enum: ["internship", "scholarship", "event"], required: true 
    },
    description: { 
        type: String 
    },
    deadline: { 
        type: Date 
    },
    location: { 
        type: String 
    },
    tags: {
        type : [String]
    },
    posted_by_student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student" 
    },
    posted_by_organisation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Organisation" 
    },
    applicants: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Student" 
        }
    ]
}, { timestamps: true });

const Opportunity = mongoose.model("Opportunity", opportunity_schema);
export default Opportunity;
