import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to determine if the device is mobile based on screen width.
 * @returns {boolean} True if the device is mobile, otherwise false.
 */
export function useIsMobile() {
	const [isMobile, setIsMobile] = React.useState(undefined);

	React.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);

	return !!isMobile;
}
