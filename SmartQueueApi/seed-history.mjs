import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017/smartqueue");

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const FIRST_NAMES = [
    "Nimal", "Kamala", "Sunil", "Anjali", "Rohan", "Tharindu", "Priya", "Chamara",
    "Dilani", "Sanjeewa", "Nadeesha", "Ruwan", "Ishara", "Lasantha", "Chathuri",
];
const LAST_NAMES = [
    "Perera", "Fernando", "Silva", "Jayasinghe", "Rajapaksa", "De Silva", "Wickramasinghe",
    "Bandara", "Gunawardena", "Mendis", "Weerasinghe", "Kumara",
];
const PRIORITY_REASONS = [
    "Elderly, 68 years old",
    "Pregnant, third trimester",
    "Wheelchair user",
    "Urgent medical appointment after this",
    "Recovering from surgery, difficulty standing",
];

const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];
const randomName = () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

const parseClockTime = (str) => {
    if (!str || /closed/i.test(str)) return null;
    const trimmed = str.trim();
    const m24 = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
    if (m24) return parseInt(m24[1], 10) * 60 + parseInt(m24[2], 10);
    const m12 = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed);
    if (!m12) return null;
    let h = parseInt(m12[1], 10);
    const min = parseInt(m12[2], 10);
    const period = m12[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + min;
};

async function main() {
    await client.connect();
    const db = client.db("smartqueue");

    const departments = await db.collection("departments").find({}).toArray();
    const services = await db.collection("services").find({}).toArray();
    const counters = await db.collection("counters").find({ isActive: true }).toArray();
    const existingTokenNumbers = new Set(
        (await db.collection("tokens").find({}, { projection: { tokenNumber: 1 } }).toArray()).map(
            (t) => t.tokenNumber,
        ),
    );

    const deptById = new Map(departments.map((d) => [String(d._id), d]));
    const countersByService = new Map();
    counters.forEach((c) => {
        const key = String(c.service.serviceId);
        if (!countersByService.has(key)) countersByService.set(key, []);
        countersByService.get(key).push(c);
    });

    const usedNumbers = new Set(existingTokenNumbers);
    const generateTokenNumber = (serviceName) => {
        const prefix = (serviceName.trim().charAt(0) || "T").toUpperCase();
        let num;
        let candidate;
        do {
            num = 1000 + rand(9000);
            candidate = `${prefix}-${num}`;
        } while (usedNumbers.has(candidate));
        usedNumbers.add(candidate);
        return candidate;
    };

    const tokensToInsert = [];
    const now = new Date();

    for (let dayOffset = 6; dayOffset >= 1; dayOffset -= 1) {
        const day = new Date(now);
        day.setDate(day.getDate() - dayOffset);
        const dayName = DAY_NAMES[day.getDay()];

        for (const service of services) {
            const dept = deptById.get(String(service.department.departmentId));
            const hours = dept?.operatingHours?.[dayName];
            const openMin = parseClockTime(hours?.open);
            const closeMin = parseClockTime(hours?.close);
            if (openMin === null || closeMin === null) continue; // closed this day

            const serviceCounters = countersByService.get(String(service._id)) ?? [];
            const tokenCount = 3 + rand(9); // 3-11 tokens per service per open day

            for (let i = 0; i < tokenCount; i += 1) {
                const minute = openMin + rand(Math.max(1, closeMin - openMin - service.duration));
                const bookedAt = new Date(day);
                bookedAt.setHours(0, 0, 0, 0);
                bookedAt.setMinutes(minute);

                const createdAt = new Date(bookedAt.getTime() - rand(30) * 60000);
                const isPriority = Math.random() < 0.15;
                const isCancelled = Math.random() < 0.12;

                const counter = serviceCounters.length ? pick(serviceCounters) : null;

                const doc = {
                    tokenNumber: generateTokenNumber(service.name),
                    service: { serviceId: service._id, serviceName: service.name },
                    citizen: { name: randomName() },
                    status: isCancelled ? "cancelled" : "completed",
                    priority: isPriority,
                    bookedDate: bookedAt,
                    queuePosition: 0,
                    satisfactionRating: 0,
                    createdAt,
                    updatedAt: bookedAt,
                    timing: {
                        estimatedWaitTime: 0,
                        actualWaitTime: 0,
                    },
                    __v: 0,
                };

                if (counter) {
                    doc.counter = { counterId: counter._id, counterName: counter.counterName };
                }

                if (isPriority) {
                    doc.priorityReason = pick(PRIORITY_REASONS);
                    doc.priorityStatus = Math.random() < 0.7 ? "accepted" : "rejected";
                } else {
                    doc.priorityStatus = "none";
                }

                if (!isCancelled) {
                    const waitMinutes = 5 + rand(35);
                    const serviceStart = new Date(createdAt.getTime() + waitMinutes * 60000);
                    const serviceEnd = new Date(
                        serviceStart.getTime() + (service.duration + rand(10) - 5) * 60000,
                    );
                    doc.timing.serviceStartTime = serviceStart;
                    doc.timing.serviceEndTime = serviceEnd;
                    doc.timing.actualWaitTime = waitMinutes;
                    doc.updatedAt = serviceEnd;
                }

                tokensToInsert.push(doc);
            }
        }
    }

    if (tokensToInsert.length === 0) {
        console.log("No tokens generated (check department operating hours).");
        await client.close();
        return;
    }

    const result = await db.collection("tokens").insertMany(tokensToInsert);
    console.log(`Inserted ${result.insertedCount} historical tokens across the last 6 days.`);

    const byDay = {};
    tokensToInsert.forEach((t) => {
        const key = t.createdAt.toISOString().slice(0, 10);
        byDay[key] = (byDay[key] || 0) + 1;
    });
    console.log("Per day:", byDay);

    await client.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
