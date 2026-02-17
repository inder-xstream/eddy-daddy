import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const adConfig = {
  isEnabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
  exoclick: {
    sidebarZoneId: process.env.NEXT_PUBLIC_EXOCLICK_ZONE_SIDEBAR,
    footerZoneId: process.env.NEXT_PUBLIC_EXOCLICK_ZONE_FOOTER,
    mobileZoneId: process.env.NEXT_PUBLIC_EXOCLICK_ZONE_MOBILE,
  },
};
