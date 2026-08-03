export const services = [
  { id: "passport", name: "Passport Application", office: "Department of Immigration", duration: 25, icon: "📘", docs: ["NIC", "Birth Certificate", "Photo"] },
  { id: "license", name: "Driving License", office: "Dept. of Motor Traffic", duration: 30, icon: "🚗", docs: ["NIC", "Medical Certificate"] },
  { id: "nic", name: "NIC Renewal", office: "Dept. for Registration of Persons", duration: 15, icon: "🪪", docs: ["Old NIC", "Birth Certificate"] },
  { id: "birth", name: "Birth Certificate", office: "Divisional Secretariat", duration: 20, icon: "📜", docs: ["Parent NICs", "Hospital Record"] },
  { id: "land", name: "Land Registry Extract", office: "Land Registry Office", duration: 35, icon: "🏛️", docs: ["NIC", "Deed Reference"] },
  { id: "business", name: "Business Registration", office: "Divisional Secretariat", duration: 40, icon: "💼", docs: ["NIC", "Address Proof", "Form-1"] },
];

export const counters = [
  { id: "C-01", name: "Counter 1", service: "Passport Application", officer: "K. Perera", current: "P-042", waiting: 8 },
  { id: "C-02", name: "Counter 2", service: "Driving License", officer: "S. Jayasinghe", current: "L-019", waiting: 12 },
  { id: "C-03", name: "Counter 3", service: "NIC Renewal", officer: "A. Fernando", current: "N-073", waiting: 4 },
  { id: "C-04", name: "Counter 4", service: "Birth Certificate", officer: "R. Silva", current: "B-028", waiting: 6 },
];

export const myTokens = [
  { id: "P-045", service: "Passport Application", date: "Today", time: "10:30 AM", counter: "Counter 1", position: 3, eta: 18, status: "waiting" },
  { id: "L-101", service: "Driving License", date: "Tomorrow", time: "9:00 AM", counter: "Counter 2", position: 1, eta: 0, status: "scheduled" },
];

export const queueHistory = [
  { day: "Mon", served: 142, avgWait: 18 },
  { day: "Tue", served: 168, avgWait: 22 },
  { day: "Wed", served: 195, avgWait: 28 },
  { day: "Thu", served: 178, avgWait: 24 },
  { day: "Fri", served: 210, avgWait: 32 },
  { day: "Sat", served: 95, avgWait: 12 },
];

export const officerQueue = [
  { token: "P-042", citizen: "Nimal R.", priority: false, waited: 22, status: "serving" },
  { token: "P-043", citizen: "Kamala D.", priority: true, waited: 8, status: "next" },
  { token: "P-044", citizen: "Sunil M.", priority: false, waited: 14, status: "waiting" },
  { token: "P-045", citizen: "Anjali P.", priority: false, waited: 10, status: "waiting" },
  { token: "P-046", citizen: "Rohan F.", priority: false, waited: 6, status: "waiting" },
  { token: "P-047", citizen: "Tharindu S.", priority: true, waited: 4, status: "waiting" },
];
