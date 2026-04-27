import mongoose from "mongoose";

const student_schema = mongoose.Schema({
    email : {
        type : String,
        unique : true,
        required : true
    },
    password : {
        type : String,
    },
    profiles : {
        linkedin : {
            type : String
        },
        github : {
            type : String
        },
        other_profiles : {
            type : Map,
            of : String
        }
    },
    avatar : {
        type : String
    },
    gender : {
        type : String,
        enum : ["Male", "Female", "Other"]
    },
    location : {
        type : String,
        required : true
    },
    intrested_domains : {
        type : [String],
    },
    education : {
        collegeName : String, 
        course : String,
        specialization : String,
        year_of_graduation : Number
    },
    skills : {
        type : [String],
    },
    connections : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Student"
        }
    ],
    coin_balance : {
        type : Number,
        default : 0
    },
    posted_opportunities : [
        { 
            type: mongoose.Schema.Types.ObjectId, ref: "Opportunity"
        }
    ],
    collaborations: [
        { 
            type: mongoose.Schema.Types.ObjectId, ref: "Collaboration"
        }
    ],
    skillswapRequests: [
        { 
            type: mongoose.Schema.Types.ObjectId, ref: "Skillswap"
        }
    ],
    transactions: [
        { 
            type: mongoose.Schema.Types.ObjectId, ref: "Transaction"
        }
    ],
    badges : {
        type : [String],
        default : []
    }
},
{
    timestamps : true
})

const Student = mongoose.model("Student", student_schema);
export default Student;