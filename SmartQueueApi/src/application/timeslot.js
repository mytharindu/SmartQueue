import Service from "../infrastructure/entities/Service.js";
import Department from "../infrastructure/entities/Department.js";
import Counter from "../infrastructure/entities/Counter.js";
import Token from "../infrastructure/entities/Token.js";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// Fallback break window used when a department hasn't set its own.
const DEFAULT_BREAK_MINUTES = { start: 12 * 60, end: 13 * 60 }; // 12:00 - 13:00

const parse24h = (str) => {
    if (!str) return null;
    const match = /^(\d{1,2}):(\d{2})$/.exec(str.trim());
    if (!match) return null;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
};

const parseClockTime = (str) => {
    if (!str || /closed/i.test(str)) return null;
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(str.trim());
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
};

const minutesToClock = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const dayBoundsFor = (dateStr) => {
    const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
    const start = new Date(base);
    start.setHours(0, 0, 0, 0);
    const end = new Date(base);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const toLocalDateOnly = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

export const getServiceSlots = async (serviceId, dateStr) => {
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new Error("Service not found");
    }

    const department = await Department.findById(service.department.departmentId);
    const { start: dayStart, end: dayEnd } = dayBoundsFor(dateStr);
    const dayName = DAY_NAMES[dayStart.getDay()];
    const hours = department?.operatingHours?.[dayName];

    const openMin = parseClockTime(hours?.open);
    const closeMin = parseClockTime(hours?.close);
    const departmentClosed = hours ? openMin === null : false;

    const counters = await Counter.find({ "service.serviceId": serviceId, isActive: true });
    const capacityPerSlot = counters.length;

    const duration = service.duration || 30;
    const effectiveOpen = openMin ?? 9 * 60;
    const effectiveClose = closeMin ?? 17 * 60;

    const breakStart = parse24h(department?.breakTime?.start) ?? DEFAULT_BREAK_MINUTES.start;
    const breakEnd = parse24h(department?.breakTime?.end) ?? DEFAULT_BREAK_MINUTES.end;

    const slotTimes = [];
    if (!departmentClosed && capacityPerSlot > 0) {
        for (let t = effectiveOpen; t + duration <= effectiveClose; t += duration) {
            const overlapsBreak = breakEnd > breakStart && t < breakEnd && t + duration > breakStart;
            if (!overlapsBreak) {
                slotTimes.push(t);
            }
        }
    }

    const tokensThatDay = await Token.find({
        "service.serviceId": serviceId,
        bookedDate: { $gte: dayStart, $lte: dayEnd },
        status: { $ne: "cancelled" },
    });

    const bookedCounts = {};
    tokensThatDay.forEach((token) => {
        const bookedAt = new Date(token.bookedDate);
        const mins = bookedAt.getHours() * 60 + bookedAt.getMinutes();
        bookedCounts[mins] = (bookedCounts[mins] || 0) + 1;
    });

    const slots = slotTimes.map((mins) => {
        const booked = bookedCounts[mins] || 0;
        return {
            time: minutesToClock(mins),
            capacity: capacityPerSlot,
            booked,
            available: booked < capacityPerSlot,
        };
    });

    return {
        serviceId,
        date: toLocalDateOnly(dayStart),
        slotDurationMinutes: duration,
        countersAvailable: capacityPerSlot,
        isClosed: departmentClosed || capacityPerSlot === 0,
        breakWindow: { start: minutesToClock(breakStart), end: minutesToClock(breakEnd) },
        slots,
    };
};
