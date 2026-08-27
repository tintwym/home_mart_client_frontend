import { useState, useEffect } from 'react';
import {
    MapPin,
    Truck,
    Warehouse,
    Navigation,
    Clock,
    Compass,
    Zap,
    ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

type Point = {
    x: number;
    y: number;
    name: string;
    description: string;
};

type OrderDeliveryMapProps = {
    orderId: string;
    status: string;
};

export default function OrderDeliveryMap({
    orderId,
    status,
}: OrderDeliveryMapProps) {
    const { toast } = useToast();
    const [isPinging, setIsPinging] = useState(false);
    const [telemetryAge, setTelemetryAge] = useState(0);
    const [speed, setSpeed] = useState(() => (status === 'shipped' ? 55 : 0));
    const [latOffset, setLatOffset] = useState(0);

    // Seeded random generation based on orderId to give each order a unique route
    const getSeededValue = (str: string, index: number) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(Math.sin(hash + index));
    };

    const routeSeed = getSeededValue(orderId, 1);
    const weatherSeed = getSeededValue(orderId, 2);

    // Weather simulation
    const weather =
        weatherSeed > 0.6
            ? 'Sunny'
            : weatherSeed > 0.3
              ? 'Cloudy'
              : 'Light Rain';

    // Build the checkpoints
    const startX = 60;
    const startY = 160 + Math.floor(routeSeed * 40) - 20;
    const endX = 420;
    const endY = 100 + Math.floor(routeSeed * 40) - 20;

    const mid1X = startX + 90;
    const mid1Y = startY - 40;

    const mid2X = mid1X + 90;
    const mid2Y = mid1Y + 60;

    const mid3X = mid2X + 90;
    const mid3Y = mid2Y - 50;

    const checkpoints: Point[] = [
        {
            x: startX,
            y: startY,
            name: 'Origin Warehouse',
            description: 'Distribution Center Hub',
        },
        {
            x: mid1X,
            y: mid1Y,
            name: 'Regional Hub',
            description: 'Inbound sorting facility',
        },
        {
            x: mid2X,
            y: mid2Y,
            name: 'State Highway 12',
            description: 'Express route transit',
        },
        {
            x: mid3X,
            y: mid3Y,
            name: 'Local Delivery Hub',
            description: 'Outbound dispatch depot',
        },
        {
            x: endX,
            y: endY,
            name: 'Destination Address',
            description: 'Your delivery location',
        },
    ];

    // Determine current progress percentage and current segment based on status
    let progress = 0; // 0 to 1
    let statusText = 'Pending Dispatch';
    let eta = 'Within 3-5 Business Days';

    switch (status) {
        case 'pending':
            progress = 0.05;
            statusText = 'Awaiting courier pickup';
            eta = 'Est: 4 days';
            break;
        case 'processing':
            progress = 0.25;
            statusText = 'Order processing & packing';
            eta = 'Est: 3 days';
            break;
        case 'shipped':
            progress = 0.65;
            statusText = 'Transit between regional hubs';
            eta = 'Est: Tomorrow';
            break;
        case 'delivered':
            progress = 1.0;
            statusText = 'Delivered & signed';
            eta = 'Delivered';
            break;
        default:
            progress = 0.1;
    }

    // Live updating variables
    useEffect(() => {
        const timer = setInterval(() => {
            setTelemetryAge((prev) => prev + 1);
            if (status === 'shipped') {
                const currentSpeed =
                    55 + Math.floor(Math.sin(Date.now() / 5000) * 8);
                setSpeed(currentSpeed);
                setLatOffset(Math.sin(Date.now() / 2000) * 0.0003);
            } else {
                setSpeed(0);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [status]);

    // Calculate vehicle {x, y} along the piecewise linear checkpoints
    const getVehiclePosition = (
        p: number,
    ): { x: number; y: number; angle: number } => {
        if (p <= 0)
            return { x: checkpoints[0].x, y: checkpoints[0].y, angle: 0 };
        if (p >= 1)
            return {
                x: checkpoints[checkpoints.length - 1].x,
                y: checkpoints[checkpoints.length - 1].y,
                angle: 0,
            };

        const segmentCount = checkpoints.length - 1;
        const scaledProgress = p * segmentCount;
        const segmentIndex = Math.floor(scaledProgress);
        const segmentProgress = scaledProgress - segmentIndex;

        const p1 = checkpoints[segmentIndex];
        const p2 = checkpoints[segmentIndex + 1];

        const x = p1.x + (p2.x - p1.x) * segmentProgress;
        const y = p1.y + (p2.y - p1.y) * segmentProgress;

        // Calculate rotation angle
        const dy = p2.y - p1.y;
        const dx = p2.x - p1.x;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return { x, y, angle };
    };

    const vehiclePos = getVehiclePosition(progress);

    // Calculate simulated geographical coordinates based on route
    const baseLat = 34.0522 + routeSeed * 2 - 1;
    const baseLng = -118.2437 + routeSeed * 2 - 1;

    const currentLat = baseLat + progress * 0.5 + latOffset;
    const currentLng = baseLng + progress * 0.5;

    const handlePingDriver = () => {
        if (status === 'pending' || status === 'processing') {
            toast({
                title: 'Awaiting Dispatch',
                description:
                    'The driver has not been assigned yet. Telemetry will become active once shipped.',
                variant: 'default',
            });
            return;
        }
        if (status === 'delivered') {
            toast({
                title: 'Order Delivered',
                description:
                    'This delivery is complete. Safe receipt is archived.',
                variant: 'success',
            });
            return;
        }

        setIsPinging(true);
        setTelemetryAge(0);

        toast({
            title: 'Pinging Delivery Vehicle...',
            description: `Sending encrypted handshake to GPS Transponder #${orderId.toUpperCase().slice(-6)}.`,
            variant: 'default',
        });

        setTimeout(() => {
            setIsPinging(false);
            toast({
                title: 'Telemetry Synced Successfully',
                description: `Signal strength 98%. Current driver speed is ${speed} mph.`,
                variant: 'success',
            });
        }, 2200);
    };

    // Generating custom tracking logs
    const getLogs = () => {
        const logs = [];
        if (progress >= 0.05) {
            logs.push({
                time: '08:00 AM',
                text: 'Order confirmed and registered in warehouse system.',
            });
        }
        if (progress >= 0.25) {
            logs.push({
                time: '11:30 AM',
                text: 'Packed using sustainable packaging at sorting facility.',
            });
        }
        if (progress >= 0.65) {
            logs.push({
                time: '02:45 PM',
                text: `In transit. Dispatched on delivery vehicle.`,
            });
            logs.push({
                time: 'Live Updates',
                text: `Vehicle cruising at ${speed} mph in ${weather.toLowerCase()} conditions.`,
            });
        }
        if (progress >= 1.0) {
            logs.push({
                time: '04:15 PM',
                text: 'Arrived at destination. Signed and completed safely.',
            });
        }
        return logs.reverse();
    };

    return (
        <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-slate-50 p-4 dark:border-border/30 dark:bg-slate-900/60">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                    <Navigation className="size-4 animate-pulse text-emerald-500" />
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                        Interactive Route Tracker
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                        Telemetry:{' '}
                        {telemetryAge === 0
                            ? 'Just now'
                            : `${telemetryAge}s ago`}
                    </span>
                    <button
                        onClick={handlePingDriver}
                        disabled={isPinging}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold shadow-xs transition-all ${
                            isPinging
                                ? 'animate-pulse bg-amber-500 text-white'
                                : 'bg-primary text-primary-foreground hover:opacity-90'
                        }`}
                    >
                        <Zap
                            className={`size-3 ${isPinging ? 'animate-bounce' : ''}`}
                        />
                        {isPinging ? 'Pinging...' : 'Ping Driver'}
                    </button>
                </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-12">
                {/* SVG Map Canvas */}
                <div className="relative overflow-hidden rounded-lg border border-border/50 bg-white p-2 shadow-inner lg:col-span-8 dark:bg-slate-950">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50 dark:bg-[radial-gradient(#334155_1px,transparent_1px)]" />

                    {/* Radar ping ripple effect */}
                    {isPinging && (
                        <div
                            className="pointer-events-none absolute z-30 animate-ping rounded-full border-2 border-amber-400 bg-amber-400/10"
                            style={{
                                left: `${vehiclePos.x - 30}px`,
                                top: `${vehiclePos.y - 30}px`,
                                width: '60px',
                                height: '60px',
                            }}
                        />
                    )}

                    <svg
                        viewBox="0 0 480 260"
                        className="relative z-10 h-auto w-full select-none"
                    >
                        {/* Styled river background decor */}
                        <path
                            d="M 0,90 Q 120,80 200,140 T 480,110"
                            fill="none"
                            stroke="rgba(14, 165, 233, 0.15)"
                            strokeWidth="16"
                            strokeLinecap="round"
                        />
                        <path
                            d="M 100,0 Q 150,110 90,190 T 250,260"
                            fill="none"
                            stroke="rgba(14, 165, 233, 0.08)"
                            strokeWidth="8"
                            strokeLinecap="round"
                        />

                        {/* Alternate grid roads to make it feel like a real map */}
                        <line
                            x1="30"
                            y1="40"
                            x2="450"
                            y2="40"
                            stroke="rgba(148, 163, 184, 0.15)"
                            strokeWidth="4"
                            strokeDasharray="3 3"
                        />
                        <line
                            x1="30"
                            y1="220"
                            x2="450"
                            y2="220"
                            stroke="rgba(148, 163, 184, 0.15)"
                            strokeWidth="4"
                        />
                        <line
                            x1="120"
                            y1="30"
                            x2="120"
                            y2="230"
                            stroke="rgba(148, 163, 184, 0.15)"
                            strokeWidth="4"
                        />
                        <line
                            x1="360"
                            y1="30"
                            x2="360"
                            y2="230"
                            stroke="rgba(148, 163, 184, 0.15)"
                            strokeWidth="4"
                            strokeDasharray="5 5"
                        />

                        {/* Route Line Background (Dotted track) */}
                        <path
                            d={`M ${checkpoints.map((p) => `${p.x},${p.y}`).join(' L ')}`}
                            fill="none"
                            stroke="rgba(100, 116, 139, 0.2)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Route Line Progress Fill */}
                        <path
                            d={`M ${checkpoints.map((p) => `${p.x},${p.y}`).join(' L ')}`}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="480"
                            strokeDashoffset={480 - 480 * progress}
                            className="transition-all duration-1000 ease-out"
                        />

                        {/* Checkpoints pin rendering */}
                        {checkpoints.map((p, idx) => {
                            const isStart = idx === 0;
                            const isEnd = idx === checkpoints.length - 1;
                            const isPassed =
                                idx / (checkpoints.length - 1) <= progress;

                            return (
                                <g key={idx} className="group cursor-pointer">
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={isStart || isEnd ? '8' : '5'}
                                        fill={isPassed ? '#10b981' : '#cbd5e1'}
                                        stroke="#fff"
                                        strokeWidth="2"
                                        className="shadow-sm transition-colors duration-300"
                                    />
                                    {isStart && (
                                        <g
                                            transform={`translate(${p.x - 12}, ${p.y - 32}) scale(0.9)`}
                                        >
                                            <rect
                                                width="24"
                                                height="24"
                                                rx="4"
                                                fill="#64748b"
                                                className="shadow-xs"
                                            />
                                            <Warehouse className="m-1 size-4 text-white" />
                                        </g>
                                    )}
                                    {isEnd && (
                                        <g
                                            transform={`translate(${p.x - 12}, ${p.y - 32}) scale(0.9)`}
                                        >
                                            <rect
                                                width="24"
                                                height="24"
                                                rx="12"
                                                fill="#10b981"
                                                className="shadow-xs"
                                            />
                                            <MapPin className="m-1 size-4 text-white" />
                                        </g>
                                    )}
                                    <text
                                        x={p.x}
                                        y={p.y + 18}
                                        textAnchor="middle"
                                        className="fill-slate-700 text-[10px] font-bold dark:fill-slate-300"
                                    >
                                        {p.name === 'Destination Address'
                                            ? 'Home'
                                            : p.name}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Animated Truck/Vehicle */}
                        {progress < 1 && (
                            <g
                                transform={`translate(${vehiclePos.x}, ${vehiclePos.y}) rotate(${vehiclePos.angle})`}
                                className="transition-all duration-300 ease-out"
                            >
                                <g transform="translate(-14, -14)">
                                    <rect
                                        width="28"
                                        height="28"
                                        rx="6"
                                        fill="#3b82f6"
                                        stroke="#fff"
                                        strokeWidth="2"
                                        className="shadow-md"
                                    />
                                    <Truck className="m-1.5 size-4 text-white" />
                                </g>
                            </g>
                        )}
                    </svg>

                    {/* HUD / Location Label floating badge */}
                    <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-0.5 rounded-lg bg-black/75 px-3 py-1.5 font-mono text-[10px] text-white backdrop-blur-xs">
                        <span className="text-[8px] font-bold tracking-wider text-sky-400 uppercase">
                            Current Telemetry
                        </span>
                        <span>LAT: {currentLat.toFixed(5)}° N</span>
                        <span>LNG: {currentLng.toFixed(5)}° W</span>
                    </div>
                </div>

                {/* Tracking Logs Panel */}
                <div className="flex flex-col justify-between rounded-lg border border-border/50 bg-white p-4 shadow-sm lg:col-span-4 dark:bg-slate-950">
                    <div>
                        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Live Logistics Log
                        </span>

                        <div className="mt-3 space-y-4">
                            {getLogs().map((log, i) => (
                                <div
                                    key={i}
                                    className="relative border-l border-emerald-500/30 pb-1 pl-5 last:border-0"
                                >
                                    <div className="absolute top-1 -left-1.5 size-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
                                    <span className="block font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                        {log.time}
                                    </span>
                                    <p className="mt-0.5 text-xs leading-relaxed font-medium text-foreground">
                                        {log.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-border/40 pt-3">
                        <div className="flex items-center justify-between text-xs font-medium">
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="size-3.5" /> Est. Arrival:
                            </span>
                            <span className="font-bold text-foreground">
                                {eta}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium">
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <Compass className="size-3.5" /> Status:
                            </span>
                            <span className="font-bold text-sky-600 capitalize dark:text-sky-400">
                                {statusText}
                            </span>
                        </div>
                        {speed > 0 && (
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                    <Zap className="size-3.5" /> Cruise Speed:
                                </span>
                                <span className="font-mono font-bold text-foreground">
                                    {speed} mph
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-xs font-medium">
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <ShieldCheck className="size-3.5" /> Connection:
                            </span>
                            <span className="font-bold text-emerald-500">
                                Secure SSL
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
