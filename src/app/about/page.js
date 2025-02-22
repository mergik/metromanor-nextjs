"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Linkedin, Phone, Mail, Twitter, GithubIcon, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/navbar/Logo";
import { TEAMMEMBERS } from "./teamMembers";
import { RESOURCES } from "./resources";

/**
 * AboutPage component that displays information about the project and team members.
 * @returns {JSX.Element} The rendered AboutPage component.
 */
export default function AboutPage() {
	return (
		<div className="container mx-auto px-8 pb-8">
			{/* Metro Manor Logo */}
			<section className="mb-12 flex justify-center">
				<Logo />
			</section>

			{/* About Project Section */}
			<section className="mb-12">
				<h1 className="m-4 text-center text-3xl font-bold text-blue-700">About Us</h1>
				<Card>
					<CardContent className="p-6">
						<p className="mb-4 text-lg">
							Metro Manor is a sophisticated hotel management system built with Next.js, designed specifically for our urban boutique hotel. This comprehensive
							platform streamlines all aspects of our hotel operations, from reservations and room management to guest services and billing.
						</p>
						<p className="mb-4 text-lg">
							Leveraging the power of Next.js, our system offers lightning-fast performance, responsive design, and an intuitive interface for both staff and guests.
							It enables real-time updates on room availability, seamless check-in/check-out processes, and efficient handling of guest requests, ensuring a superior
							experience for our visitors.
						</p>
						<p className="text-lg">
							Metro Manor's management system is tailored to meet the unique needs of our hotel, enhancing our ability to provide personalized service and maintain
							our high standards of hospitality. From front desk operations to housekeeping coordination, our Next.js-powered solution empowers our team to deliver
							exceptional care to every guest who stays with us.
						</p>
					</CardContent>
				</Card>
			</section>

			{/* Our Development Team Section */}
			<section className="mb-12">
				<h2 className="m-4 text-center text-3xl font-bold text-blue-700">Our Development Team</h2>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{/* FETCH TEAM MEMBERS FROM TEAMMEMBERS.JS */}
					{TEAMMEMBERS.map((member, index) => (
						<Card key={index} className="overflow-hidden">
							<CardContent className="p-4">
								<div className="flex flex-col items-center">
									<Image src={`https://github.com/${member.github}.png`} alt={member.name} width={200} height={200} className="mb-4 rounded-lg" />
									<h2 className="mb-2 text-xl font-semibold">{member.name}</h2>
									<p className="mb-4 text-sm text-gray-600">{member.role}</p>
									<div className="mb-2 flex flex-wrap justify-center gap-4">
										{member.github && (
											<Link href={`https://github.com/${member.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
												<Github className="h-5 w-5" />
												<span className="sr-only">GitHub</span>
											</Link>
										)}
										{member.linkedin && (
											<Link href={`https://www.linkedin.com/in/${member.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
												<Linkedin className="h-5 w-5" />
												<span className="sr-only">LinkedIn</span>
											</Link>
										)}
										{member.twitter && (
											<Link href={`https://twitter.com/${member.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
												<Twitter className="h-5 w-5" />
												<span className="sr-only">Twitter</span>
											</Link>
										)}
										{member.email && member.email !== "#" && (
											<Link href={`mailto:${member.email}`} className="hover:text-primary">
												<Mail className="h-5 w-5" />
												<span className="sr-only">Email</span>
											</Link>
										)}
									</div>
									{member.whatsapp && member.whatsapp !== "#" && (
										<div className="mb-2 flex items-center">
											<Phone className="mr-2 h-4 w-4" />
											<span className="text-sm">{member.whatsapp}</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Credits and Resources Section */}
			<section className="mb-12">
				<h2 className="m-4 text-center text-3xl font-bold text-blue-700">Credits and Resources</h2>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{/* FETCH RESOURCES FROM RESOURCES.JS */}
					{RESOURCES.map((resource, index) => (
						<Card key={index} className="overflow-hidden">
							<CardContent className="p-4">
								<div className="flex flex-col items-center text-center">
									<h3 className="mb-2 text-xl font-semibold">{resource.name}</h3>
									<p className="mb-4 text-sm text-gray-600">{resource.description}</p>
									<Link href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
										Learn More
									</Link>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Back to top button */}
			<section className="flex justify-center">
				<Button
					className="flex items-center"
					onClick={() => {
						window.scrollTo({ top: 0, behavior: "smooth" });
					}}
				>
					<ChevronUp className="mr-2 h-4 w-4" />
					Back to top
				</Button>
			</section>
		</div>
	);
}
