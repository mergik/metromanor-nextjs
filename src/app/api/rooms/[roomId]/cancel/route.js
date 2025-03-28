import { NextResponse } from 'next/server';
import connectMongoDB from "@/lib/mongodb";
import Room from '@/models/room';
import Booking from '@/models/booking';

/**
 * Handles the cancellation of a room booking
 * 
 * @route POST /api/rooms/[roomId]/cancel
 * @param {Object} request - The incoming request object
 * @param {Object} params - URL parameters containing roomId
 * @param {string} params.roomId - The ID of the room to cancel booking for
 * @returns {Object} NextResponse with success/error message and updated room data
 * @throws {Error} If database operations fail
 */
export async function POST(request, { params }) {
    try {
        await connectMongoDB();
        const { roomId } = params;

        console.log('Attempting to cancel booking for room:', roomId); // Debug log

        // Find the room by ID and populate activeBooking
        const room = await Room.findById(roomId).populate('activeBooking');
        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // Check if there's an active booking
        if (!room.activeBooking) {
            return NextResponse.json({ error: 'No active booking found for this room' }, { status: 400 });
        }

        // Update the booking status
        await Booking.findByIdAndUpdate(room.activeBooking._id, {
            status: 'CANCELLED'
        });

        // Update room status to 'AVAILABLE' and remove activeBooking reference
        room.status = 'AVAILABLE';
        room.activeBooking = null;
        await room.save();

        return NextResponse.json({ 
            message: 'Booking cancelled successfully',
            room: room 
        }, { status: 200 });

    } catch (error) {
        console.error('Cancellation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}