import mongoose, { Schema } from "mongoose";


const roomSchema = new Schema({
    roomNumber: {
        type: Number,
        required: true,
        unique: true
    },
    floorNumber: {
        type: String,
        required: true
    },
    roomType: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    amenities: [String],
    images: [String],
    description: {
        type: String,
        required: true
    },
    MaxGuests: { type: Number, required: true },
    activeBooking: { type: Schema.Types.ObjectId, ref: 'Booking' },
    status: {
        type: String,
        enum: ['AVAILABLE', 'OCCUPIED', 'BOOKED', 'CLEANING', 'MAINTENANCE'],
        default: 'AVAILABLE'
    }
    
}, { timestamps: true })

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema)

export default Room;