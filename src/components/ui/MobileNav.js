"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, Thermometer, Settings } from "lucide-react";

export default function MobileNav() {
    const pathname = usePathname();

    // Hide nav on non-dashboard pages
    const hiddenRoutes = ["/login", "/", "/offline", "/demo"];
    if (hiddenRoutes.includes(pathname)) {
        return null;
    }

    const navItems = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: Home,
            gradient: "from-blue-600 via-blue-700 to-cyan-600",
            glow: "shadow-blue-500/50",
            activeText: "text-blue-400",
            inactiveIcon: "text-gray-400",
        },
        {
            name: "Alerts",
            href: "/dashboard/alerts",
            icon: Bell,
            gradient: "from-orange-500 via-red-500 to-rose-500",
            glow: "shadow-orange-500/50",
            activeText: "text-orange-400",
            inactiveIcon: "text-gray-400",
        },
        {
            name: "Temp",
            href: "/dashboard/temperature",
            icon: Thermometer,
            gradient: "from-cyan-500 via-teal-500 to-emerald-500",
            glow: "shadow-cyan-500/50",
            activeText: "text-cyan-400",
            inactiveIcon: "text-gray-400",
        },
        {
            name: "Settings",
            href: "/dashboard/settings",
            icon: Settings,
            gradient: "from-purple-600 via-fuchsia-600 to-pink-600",
            glow: "shadow-purple-500/50",
            activeText: "text-purple-400",
            inactiveIcon: "text-gray-400",
        },
    ];

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B1E4A] border-t border-white/15 md:hidden pb-safe"
            style={{ boxShadow: '0 -8px 32px rgba(5, 10, 36, 0.8)' }}
        >
            <div className="flex items-center justify-around h-[72px] px-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex flex-col items-center justify-center w-full h-full py-1.5 transition-all duration-200 active:scale-90"
                        >
                            {isActive ? (
                                <div
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg ${item.glow} ring-2 ring-white/20 mb-0.5`}
                                    style={{ boxShadow: `0 4px 15px rgba(0,0,0,0.3)` }}
                                >
                                    <Icon size={20} strokeWidth={2.5} className="text-white" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-0.5">
                                    <Icon size={20} strokeWidth={1.5} className={item.inactiveIcon} />
                                </div>
                            )}
                            <span className={`text-[11px] ${isActive ? `${item.activeText} font-bold` : 'text-gray-500 font-medium'}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
