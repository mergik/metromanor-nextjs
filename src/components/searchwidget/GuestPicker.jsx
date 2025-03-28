import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "../ui/button";
import { MinusCircle, PlusCircle, Undo2 } from "lucide-react";

/**
 * GuestPicker component that allows users to select the number of guests.
 * @returns {JSX.Element} The rendered GuestPicker component.
 */
const GuestPicker = () => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className="inline-block">
					<Button variant="outline">Add Guests</Button>
				</div>
			</PopoverTrigger>
			<PopoverContent>
				{/* Adults */}
				<div className="my-5 flex w-full items-center justify-between border-b py-2">
					<div>
						<h2>Adults</h2>
						<p className="text-gray-500">Ages 13 or above</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" className="h-10 w-10 rounded-full p-0">
							<MinusCircle />
						</Button>
						<p>1</p>
						<Button variant="outline" className="h-10 w-10 rounded-full p-0">
							<PlusCircle />
						</Button>
					</div>
				</div>

				{/* Children */}
				<div className="my-5 flex w-full items-center justify-between border-b py-2">
					<div>
						<h2>Children</h2>
						<p className="text-gray-500">Ages 2 - 12</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" className="h-10 w-10 rounded-full p-0">
							<MinusCircle />
						</Button>
						<p>0</p>
						<Button variant="outline" className="h-10 w-10 rounded-full p-0">
							<PlusCircle />
						</Button>
					</div>
				</div>

				{/* Infants */}
				<div className="my-5 flex w-full items-center justify-between border-b py-2">
					<div>
						<h2>Infants</h2>
						<p className="text-gray-500">Under 2</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" className="h-10 w-10 rounded-full p-0">
							<MinusCircle />
						</Button>
						<p>0</p>
						<Button variant="outline" className="h-10 w-10 rounded-full p-0">
							<PlusCircle />
						</Button>
					</div>
				</div>

				{/* Pets */}
				<div className="my-5 flex w-full items-center justify-between py-2">
					<div>
						<h2>Pets</h2>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" className="h-10 w-10 rounded-full p-0">
							<MinusCircle />
						</Button>
						<p>0</p>
						<Button variant="outline" className="h-10 w-10 rounded-full p-0">
							<PlusCircle />
						</Button>
					</div>
				</div>

				<div className="flex w-full justify-end">
					<Button variant="outline" className="gap-2">
						<Undo2 />
						Reset
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default GuestPicker;
