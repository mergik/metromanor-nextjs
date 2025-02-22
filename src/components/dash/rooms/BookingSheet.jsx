"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BedDouble, CreditCard, Hotel, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { getStatusColors } from "@/lib/roomStatusColors";

/**
 * BookingSheet component for handling room bookings and related operations
 * @param {Object} props - Component props
 * @param {Object} props.room - Room details
 * @param {boolean} props.isOpen - Controls visibility of booking sheet
 * @param {Function} props.onClose - Callback function to close booking sheet
 */
const BookingSheet = ({ room, isOpen, onClose }) => {
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [date, setDate] = useState({
		from: new Date(),
		to: new Date(new Date().setDate(new Date().getDate() + 1)),
	});
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		adults: 1,
		children: 0,
		specialRequests: "",
		nights: "1",
	});
	const [latestBooking, setLatestBooking] = useState(null); // Ensure latestBooking is tracked

	// Reset form when room changes
	useEffect(() => {
		if (room) {
			setFormData((prev) => ({
				...prev,
				adults: room.guests || 1,
				children: 0,
				nights: "1",
			}));
		}
	}, [room]);

	// Update nights when dates change
	useEffect(() => {
		if (date.from && date.to) {
			const nights = Math.ceil((new Date(date.to) - new Date(date.from)) / (1000 * 60 * 60 * 24));
			setFormData((prev) => ({
				...prev,
				nights: nights.toString(),
			}));
		}
	}, [date]);

	/**
	 * Handles form input changes
	 * @param {Object} e - Event object
	 * @param {string} e.target.name - Name of the form field
	 * @param {string} e.target.value - New value of the form field
	 */
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	/**
	 * Determines the button state based on room status
	 * @returns {Object} Button configuration object
	 * @returns {string} returns.text - Button text
	 * @returns {string} returns.variant - Button variant
	 * @returns {Function} returns.onClick - Button click handler
	 */
	const getButtonState = () => {
		if (room?.secondaryStatus === "CLEANING") {
			return { text: "Under Cleaning", variant: "secondary", onClick: () => {} };
		}

		switch (room?.status) {
			case "AVAILABLE":
				return { text: "Book Now", variant: "default", onClick: () => handleBookNow() };
			case "BOOKED":
				return { text: "Check-in", variant: "default", onClick: () => handleCheckIn() };
			case "OCCUPIED":
				return { text: "Check-out", variant: "default", onClick: () => handleCheckOut() };
			case "MAINTENANCE":
				return { text: "Under Maintenance", variant: "secondary", onClick: () => {} };
			default:
				return { text: "Not Available", variant: "secondary", onClick: () => {} };
		}
	};

	/**
	 * Validates check-in and check-out dates
	 * @param {Date} checkIn - Check-in date
	 * @param {Date} checkOut - Check-out date
	 * @returns {number} Number of nights
	 * @throws {Error} If dates are invalid
	 */
	const validateDates = (checkIn, checkOut) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const checkInDate = new Date(checkIn);
		const checkOutDate = new Date(checkOut);

		checkInDate.setHours(0, 0, 0, 0);
		checkOutDate.setHours(0, 0, 0, 0);

		if (checkInDate < today) {
			throw new Error("Check-in date cannot be in the past");
		}
		if (checkOutDate.getTime() <= checkInDate.getTime()) {
			throw new Error("Check-out date must be after check-in date");
		}

		const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
		if (nights < 1) {
			throw new Error("Minimum stay is 1 night");
		}

		return nights;
	};

	/**
	 * Handles the room booking process
	 * @async
	 * @throws {Error} If booking creation fails
	 */
	const handleBookNow = async () => {
		if (!user) {
			toast.error("Please login to book a room");
			return;
		}

		if (!formData.firstName || !formData.lastName) {
			toast.error("Please enter guest details");
			return;
		}

		if (!date.from || !date.to) {
			toast.error("Please select check-in and check-out dates");
			return;
		}

		try {
			setIsLoading(true);
			const nights = validateDates(date.from, date.to);

			// Format dates for API
			const formattedCheckIn = new Date(date.from);
			const formattedCheckOut = new Date(date.to);
			formattedCheckIn.setHours(14, 0, 0, 0); // Set check-in time to 2 PM
			formattedCheckOut.setHours(11, 0, 0, 0); // Set check-out time to 11 AM

			// Debug log for booking details
			console.log("Attempting to book room:", {
				roomId: room._id,
				roomNumber: room.number,
				status: room.status,
				dates: { from: date.from, to: date.to },
			});

			const response = await fetch("/api/bookings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					roomId: room._id,
					customerId: user._id,
					checkInDate: formattedCheckIn.toISOString(),
					checkOutDate: formattedCheckOut.toISOString(),
					totalCost: room.price * nights,
					guestDetails: {
						firstName: formData.firstName,
						lastName: formData.lastName,
						adults: parseInt(formData.adults),
						children: parseInt(formData.children),
						specialRequests: formData.specialRequests,
					},
				}),
			});

			// Error handling
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create booking");
			}

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to create booking");
			}

			toast.success("Room booked successfully");
			setLatestBooking(data.booking);
			onClose();
			window.location.reload();
		} catch (error) {
			toast.error(error.message);
			console.error("Booking error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handles the check-in process for a booked room
	 * @async
	 * @throws {Error} If check-in process fails
	 */
	const handleCheckIn = async () => {
		if (!user) {
			toast.error("Please login to perform this action");
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetch(`/api/rooms/${room._id}/checkin`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to process check-in");
			}

			toast.success("Check-in successful");
			onClose();
			window.location.reload();
		} catch (error) {
			toast.error(error.message);
			console.error("Check-in error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handles the check-out process for an occupied room
	 * @async
	 * @throws {Error} If check-out process fails
	 */
	const handleCheckOut = async () => {
		if (!user) {
			toast.error("Please login to perform this action");
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetch(`/api/rooms/${room._id}/checkout`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to process check-out");
			}

			toast.success("Check-out successful");
			onClose();
			window.location.reload();
		} catch (error) {
			toast.error(error.message);
			console.error("Check-out error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelBooking = async () => {
		if (!user) {
			toast.error("Please login to perform this action");
			return;
		}

		try {
			setIsLoading(true);
			// Use room ID for the cancel endpoint
			const response = await fetch(`/api/rooms/${room._id}/cancel`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.error || "Failed to cancel booking");

			toast.success("Booking cancelled successfully");
			onClose();
			window.location.reload();
		} catch (error) {
			toast.error(error.message);
			console.error("Cancel booking error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const buttonState = getButtonState();

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="overflow-y-auto sm:w-[90%] sm:max-w-[1000px]">
				{/* - - - header section start - - - - - - - - - - - - - - - - - - - - -  */}
				<SheetHeader className="space-y-4 border-b pb-4">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-sm text-muted-foreground">{room?.type || "Standard"}</div>
							<SheetTitle>Room {room?.number}</SheetTitle>
						</div>
						<div className="flex gap-2">
							<Badge className={`${getStatusColors(room?.status, room?.secondaryStatus).primary} bg-opacity-90`}>
								{getStatusColors(room?.status, room?.secondaryStatus).text}
							</Badge>
						</div>
					</div>

					<div className="flex gap-8">
						<div className="flex items-center gap-2">
							<div className="rounded-lg bg-blue-50 p-2">
								<BedDouble className="h-5 w-5 text-blue-500" />
							</div>
							<div>
								<div className="text-sm text-muted-foreground">Type</div>
								<div>{room?.type || "Standard Room"}</div>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<div className="rounded-lg bg-blue-50 p-2">
								<Users className="h-5 w-5 text-blue-500" />
							</div>
							<div>
								<div className="text-sm text-muted-foreground">People</div>
								<div>{room?.guests} Guests</div>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<div className="rounded-lg bg-blue-50 p-2">
								<Hotel className="h-5 w-5 text-blue-500" />
							</div>
							<div>
								<div className="text-sm text-muted-foreground">Floor</div>
								<div>{room?.floor}</div>
							</div>
						</div>
					</div>
				</SheetHeader>
				{/* - - - header section end - - - - - - - - - - - - - - - - - - - - -  */}

				{/* - - - tabs section start - - - - - - - - - - - - - - - - - - - - -  */}
				<Tabs defaultValue="general" className="mt-4">
					<TabsList className="grid w-full grid-cols-3 bg-stone-200">
						<TabsTrigger value="general">General</TabsTrigger>
						<TabsTrigger value="order">Order</TabsTrigger>
						<TabsTrigger value="payment">Payment</TabsTrigger>
					</TabsList>

					{/* TODO: Scroll area doesn't work as intended when viewable height is much smaller than the specified height */}
					<ScrollArea className="my-4 h-[calc(100vh-300px)] rounded-lg border border-stone-200 p-4">
						{/* - - - tabs 1 (general) start - - - - - - - - - - - - - - - - - - - - -  */}
						<TabsContent value="general" className="space-y-4 px-4">
							{room?.customer ? (
								<div className="space-y-4">
									<div className="font-semibold">
										<div className="flex items-center justify-between gap-2 rounded-lg border p-2">
											<div className="gap-2 px-5">
												<p className="text-gray-500">Days of stay</p>
												<p>
													{format(new Date(room.customer.checkIn), "MMM d, yyyy")} - {format(new Date(room.customer.checkOut), "MMM d, yyyy")}
												</p>
											</div>
											<div className="gap-2 border-l border-stone-200 px-5">
												<p className="text-gray-500">Night</p>
												<p>#</p>
											</div>
											<div className="gap-2 border-l border-stone-200 px-5">
												<p className="text-gray-500">Adults</p>
												<p>#</p>
											</div>
											<div className="gap-2 border-l border-stone-200 px-5">
												<p className="text-gray-500">Children</p>
												<p>#</p>
											</div>
										</div>
									</div>
									<div className="grid gap-2">
										<div className="flex gap-4">
											<p>Guest name</p>
											<p className="font-semibold">{room.customer.name}</p>
										</div>

										{/* Add more customer details as needed */}
									</div>
								</div>
							) : (
								<div className="grid gap-4">
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
										<div className="grid gap-2">
											<Label>Nights</Label>
											<Input name="nights" type="number" value={formData.nights} onChange={handleInputChange} />
										</div>
										<div className="grid gap-2">
											<Label>Adults</Label>
											<Input name="adults" type="number" value={formData.adults} onChange={handleInputChange} />
										</div>
										<div className="grid gap-2">
											<Label>Children</Label>
											<Input name="children" type="number" value={formData.children} onChange={handleInputChange} />
										</div>
									</div>

									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<div className="grid gap-2">
											<Label>First Name</Label>
											<Input name="firstName" value={formData.firstName} onChange={handleInputChange} />
										</div>
										<div className="grid gap-2">
											<Label>Last Name</Label>
											<Input name="lastName" value={formData.lastName} onChange={handleInputChange} />
										</div>
									</div>

									<div className="grid gap-2">
										<div className="font-medium">Days of stay</div>
										<div className="overflow-x-auto">
											<Calendar
												mode="range"
												selected={date}
												onSelect={setDate}
												numberOfMonths={2}
												className="flex flex-col rounded-lg border p-4 sm:flex-row"
												classNames={{
													months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
													head_cell: "w-9 font-normal text-xs",
													cell: "h-9 w-9 text-center text-sm p-0 relative hover:bg-stone-100 rounded-md",
													day: "h-9 w-9 p-0 font-normal",
												}}
											/>
										</div>
									</div>
								</div>
							)}
						</TabsContent>
						{/* - - - tabs 1 (general) end - - - - - - - - - - - - - - - - - - - - -  */}

						{/* - - - tabs 2 (order) start - - - - - - - - - - - - - - - - - - - - -  */}
						<TabsContent value="order" className="space-y-4 px-4">
							<div className="space-y-4">
								<div className="font-medium">Order Details</div>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Item</TableHead>
											<TableHead>Quantity</TableHead>
											<TableHead>Price</TableHead>
											<TableHead>Total</TableHead>
										</TableRow>
									</TableHeader>

									<TableBody>
										<TableRow>
											<TableCell>
												Room {room?.number} ({room?.type || "Standard"})
											</TableCell>
											<TableCell>1 night</TableCell>
											<TableCell>KES {room?.price}</TableCell>
											<TableCell>KES {room?.price}</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Extra Bed</TableCell>
											<TableCell>1</TableCell>
											<TableCell>KES 500</TableCell>
											<TableCell>KES 500</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Breakfast</TableCell>
											<TableCell>2</TableCell>
											<TableCell>KES 250</TableCell>
											<TableCell>KES 500</TableCell>
										</TableRow>
									</TableBody>
								</Table>

								{/* TODO: Replace this with table footer above. Also use array map for the table data */}
								<div className="flex items-center justify-between font-medium">
									<span>Total</span>
									<span>KES {room?.price}</span>
								</div>
							</div>
							<div className="space-y-4">
								<div className="font-medium">Special Requests</div>
								<textarea
									name="specialRequests"
									value={formData.specialRequests}
									onChange={handleInputChange}
									className="h-24 w-full rounded-md border p-2 focus:outline focus:outline-black"
									placeholder="Enter any special requests or notes here..."
								></textarea>
							</div>
						</TabsContent>
						{/* - - - tabs 2 (order) end - - - - - - - - - - - - - - - - - - - - -  */}

						{/* - - - tabs 3 (payment) start - - - - - - - - - - - - - - - - - - - - -  */}
						<TabsContent value="payment" className="space-y-4 px-4">
							<div className="space-y-4">
								<div className="font-medium">Payment Details</div>
								<div className="grid gap-4">
									<div className="grid gap-2">
										<Label>Cardholder Name</Label>
										<Input />
									</div>

									<div className="grid gap-2">
										<Label>Card Number</Label>
										<div className="relative">
											<Input />
											<CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="grid gap-2">
											<Label>Expiry Date</Label>
											<Input placeholder="MM/YY" />
										</div>

										<div className="grid gap-2">
											<Label>CVV</Label>
											<Input type="password" maxLength={3} />
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div className="font-medium">Billing Address</div>
								<div className="grid gap-4">
									<div className="grid gap-2">
										<Label>Address</Label>
										<Input />
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="grid gap-2">
											<Label>City</Label>
											<Input />
										</div>
										<div className="grid gap-2">
											<Label>Postal Code</Label>
											<Input />
										</div>
									</div>

									<div className="grid gap-2">
										{/* TODO: This should be a Select component */}
										<Label>Country</Label>
										<Input />
									</div>
								</div>
							</div>
						</TabsContent>
						{/* - - - tabs 3 (payment) end - - - - - - - - - - - - - - - - - - - - -  */}
					</ScrollArea>
				</Tabs>
				{/* - - - tabs section end - - - - - - - - - - - - - - - - - - - - -  */}

				{/* - - - footer section start - - - - - - - - - - - - - - - - - - - - -  */}
				<div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-sm text-muted-foreground">Total Amount</div>
							<div className="text-2xl font-semibold">KES {room?.price}</div>
							{room?.status === "OCCUPIED" && (
								<Badge variant="outline" className="mt-1">
									Paid
								</Badge>
							)}
						</div>

						<div className="flex gap-2">
							{room?.status !== "AVAILABLE" && (
								<Button
									variant="outline"
									className="text-red-500"
									onClick={handleCancelBooking} // Add onClick handler
								>
									Cancel reservation
								</Button>
							)}

							<Button
								className={buttonState.variant === "default" ? "bg-teal-500 hover:bg-teal-600" : ""}
								variant={buttonState.variant}
								onClick={buttonState.onClick}
							>
								{buttonState.text}
							</Button>
						</div>
					</div>
				</div>
				{/* - - - footer section end - - - - - - - - - - - - - - - - - - - - -  */}
			</SheetContent>
		</Sheet>
	);
};

export default BookingSheet;
