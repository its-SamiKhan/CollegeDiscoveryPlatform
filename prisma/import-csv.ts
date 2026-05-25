import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as bcrypt from "bcryptjs";

// Initialize DB Client
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to generate slug
const getSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  const csvFilePath = path.join(__dirname, "colleges.csv");

  if (!fs.existsSync(csvFilePath)) {
    console.error("❌ Error: 'colleges.csv' not found inside the prisma/ folder.");
    console.log("👉 Please download a real college CSV dataset, rename it to 'colleges.csv', place it in the prisma/ directory, and run this script again.");
    process.exit(1);
  }

  console.log("🧹 1. Cleaning up database to wipe previous skewed classification...");
  await prisma.savedCollege.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.college.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.answer.deleteMany({});
  console.log("✅ Database successfully cleaned.");

  // Seed default users for discussions/reviews
  console.log("👤 2. Seeding default student and reviewer profiles...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const defaultUser = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "student@college.com",
      password: hashedPassword,
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    },
  });

  const reviewerUser1 = await prisma.user.create({
    data: {
      name: "Aman Verma",
      email: "aman@gmail.com",
      password: hashedPassword,
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80",
    },
  });

  const reviewerUser2 = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "priya@gmail.com",
      password: hashedPassword,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    },
  });
  console.log("✅ User profiles seeded successfully.");

  // Seed 90 Elite Colleges (Prisma schema-compliant & exact names for predictor matching)
  console.log("🎓 3. Seeding 90 Elite Universities (IITs, IIMs, AIIMS)...");
  
  const states = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal", "Gujarat"];
  
  const locationsByState: { [key: string]: string[] } = {
    "Delhi": ["New Delhi", "Dwarka", "Okhla"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
    "Karnataka": ["Bengaluru", "Mysore", "Manipal"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Trichy"],
    "Telangana": ["Hyderabad", "Warangal"],
    "Uttar Pradesh": ["Noida", "Kanpur", "Lucknow", "Varanasi"],
    "West Bengal": ["Kolkata", "Kharagpur"],
    "Gujarat": ["Ahmedabad", "Gandhinagar", "Surat"]
  };

  const engineeringFacilities = ["Wi-Fi", "Computer Labs", "Hostel", "Library", "Cafeteria", "Sports Complex", "Gym", "Auditorium", "Workshop Labs", "Smart Classrooms"];
  const mbaFacilities = ["Wi-Fi", "Seminar Hall", "Hostel", "Library", "Cafeteria", "Sports Complex", "AC Classrooms", "Auditorium", "Discussion Rooms", "Incubation Center"];
  const medicalFacilities = ["Wi-Fi", "Teaching Hospital", "Hostel", "Library", "Cafeteria", "Research Lab", "Gym", "Dissection Hall", "OPD Clinic", "Auditorium"];

  const engineeringCourses = ["B.Tech Computer Science", "B.Tech Electronics & Communication", "B.Tech Mechanical Engineering", "B.Tech Civil Engineering", "M.Tech Data Science", "M.Tech Artificial Intelligence"];
  const mbaCourses = ["MBA General", "MBA Finance", "MBA Marketing", "MBA Human Resources", "Executive MBA", "MBA Business Analytics"];
  const medicalCourses = ["MBBS", "BDS Dental Surgery", "MD Pediatrics", "MS General Surgery", "B.Sc Nursing", "MD General Medicine"];

  const engineeringImages = [
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
  ];

  const mbaImages = [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80",
  ];

  const medicalImages = [
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
  ];

  const eliteColleges: any[] = [];
  const eliteSlugs = new Set<string>();

  // 1. Generate 30 Engineering
  const engineeringNames = [
    "Indian Institute of Technology Delhi", "Indian Institute of Technology Bombay", "Indian Institute of Technology Madras",
    "Birla Institute of Technology and Science Pilani", "National Institute of Technology Trichy", "Vellore Institute of Technology",
    "Delhi Technological University", "College of Engineering Pune", "RV College of Engineering", "Ramaiah Institute of Technology",
    "PSG College of Technology", "Thapar Institute of Engineering and Technology", "Manipal Institute of Technology",
    "Jadavpur University Faculty of Engineering", "IIIT Hyderabad", "IIIT Delhi", "NIT Surathkal", "IIT Kanpur",
    "IIT Kharagpur", "IIT Roorkee", "NIT Warangal", "NIT Rourkela", "NIT Calicut", "IIIT Bangalore", "IIIT Allahabad",
    "PEC Technological University", "Anna University College of Engineering Guindy", "BITS Pilani Goa Campus",
    "BITS Pilani Hyderabad Campus", "Indian Institute of Technology Hyderabad"
  ];

  engineeringNames.forEach((name, idx) => {
    const state = states[idx % states.length];
    const locs = locationsByState[state];
    const location = locs[idx % locs.length] + ", " + state;
    const isTopTier = name.includes("IIT ") || name.includes("BITS ");
    const isMidTop = name.includes("NIT ") || name.includes("IIIT ") || name.includes("DTU");
    let fees = isTopTier ? 220000 : isMidTop ? 150000 : 110000;
    fees += (idx * 5000) % 30000;
    let rating = isTopTier ? 4.8 : isMidTop ? 4.4 : 4.0;
    rating = parseFloat((rating + (idx % 3) * 0.1).toFixed(1));
    if (rating > 5.0) rating = 4.9;
    let placementAvg = isTopTier ? 18.5 : isMidTop ? 12.0 : 7.5;
    placementAvg += parseFloat(((idx * 0.5) % 3).toFixed(1));
    let placementHighest = isTopTier ? 48.0 : isMidTop ? 32.0 : 18.0;
    placementHighest += (idx * 2) % 10;

    const slug = getSlug(name);
    eliteSlugs.add(slug);

    eliteColleges.push({
      name,
      slug,
      description: `${name} is an elite, premier engineering university delivering global technical research and outstanding placements.`,
      location,
      state,
      fees,
      rating,
      establishedYear: 1950 + (idx * 3) % 65,
      imageUrl: engineeringImages[idx % engineeringImages.length],
      placementAverage: placementAvg,
      placementHighest: placementHighest,
      courses: engineeringCourses,
      facilities: engineeringFacilities,
    });
  });

  // 2. Generate 30 MBA
  const mbaNames = [
    "Indian Institute of Management Ahmedabad", "Indian Institute of Management Bangalore", "Indian Institute of Management Calcutta",
    "XLRI Xavier School of Management", "Faculty of Management Studies Delhi", "SPJIMR Mumbai", "Management Development Institute Gurgaon",
    "Indian Institute of Management Lucknow", "Indian Institute of Management Kozhikode", "Indian Institute of Management Indore",
    "Symbiosis Institute of Business Management", "NMIMS School of Business Management", "IIFT Delhi",
    "Jamnalal Bajaj Institute of Management Studies", "Department of Management Studies IIT Delhi", "Shailesh J. Mehta School of Management IIT Bombay",
    "IMT Ghaziabad", "XIMB Bhubaneswar", "Great Lakes Institute of Management", "Goa Institute of Management",
    "Indian Institute of Management Mumbai", "Indian Institute of Management Shillong", "Indian Institute of Management Udaipur",
    "Indian Institute of Management Trichy", "Indian Institute of Management Raipur", "Indian Institute of Management Ranchi",
    "Tata Institute of Social Sciences Mumbai", "Vinod Gupta School of Management IIT Kharagpur", "SCMHRD Pune", "MICA Ahmedabad"
  ];

  mbaNames.forEach((name, idx) => {
    const state = states[(idx + 2) % states.length];
    const locs = locationsByState[state] || ["Mumbai", "Bengaluru", "New Delhi"];
    const location = locs[idx % locs.length] + ", " + state;
    const isTopTier = name.includes("IIM ") && (name.includes("Ahmedabad") || name.includes("Bangalore") || name.includes("Calcutta") || name.includes("XLRI") || name.includes("FMS"));
    const isMidTop = name.includes("IIM ") || name.includes("SPJIMR") || name.includes("MDI") || name.includes("JBIMS");
    let fees = isTopTier ? 1200000 : isMidTop ? 900000 : 600000;
    fees += (idx * 15000) % 100000;
    let rating = isTopTier ? 4.9 : isMidTop ? 4.5 : 4.1;
    rating = parseFloat((rating + (idx % 3) * 0.05).toFixed(2));
    if (rating > 5.0) rating = 4.95;
    let placementAvg = isTopTier ? 28.0 : isMidTop ? 22.0 : 12.5;
    placementAvg += parseFloat(((idx * 0.8) % 4).toFixed(1));
    let placementHighest = isTopTier ? 75.0 : isMidTop ? 55.0 : 28.0;
    placementHighest += (idx * 3) % 15;

    const slug = getSlug(name);
    eliteSlugs.add(slug);

    eliteColleges.push({
      name,
      slug,
      description: `${name} is a world-class business school, delivering case-study MBA pedagogy and top-tier global corporate networking.`,
      location,
      state,
      fees,
      rating,
      establishedYear: 1960 + (idx * 2) % 55,
      imageUrl: mbaImages[idx % mbaImages.length],
      placementAverage: placementAvg,
      placementHighest: placementHighest,
      courses: mbaCourses,
      facilities: mbaFacilities,
    });
  });

  // 3. Generate 30 Medical
  const medicalNames = [
    "All India Institute of Medical Sciences Delhi", "Christian Medical College Vellore", "King George's Medical University",
    "Armed Forces Medical College", "Maulana Azad Medical College", "Grant Medical College", "Bangalore Medical College and Research Institute",
    "Kasturba Medical College Manipal", "Madras Medical College", "JIPMER Puducherry", "Lady Hardinge Medical College",
    "St. John's Medical College", "Sanjay Gandhi Postgraduate Institute", "Vardhman Mahavir Medical College",
    "IMS BHU Varanasi", "Calcutta Medical College", "B.J. Medical College Ahmedabad", "Osmania Medical College",
    "Government Medical College Kozhikode", "AIIMS Jodhpur", "AIIMS Bhubaneswar", "AIIMS Bhopal", "AIIMS Patna",
    "AIIMS Raipur", "AIIMS Rishikesh", "Seth GS Medical College Mumbai", "Stanley Medical College Chennai",
    "SMS Medical College Jaipur", "B.J. Medical College Pune", "Government Medical College Nagpur"
  ];

  medicalNames.forEach((name, idx) => {
    const state = states[(idx + 4) % states.length];
    const locs = locationsByState[state] || ["New Delhi", "Pune", "Lucknow"];
    const location = locs[idx % locs.length] + ", " + state;
    const isTopTier = name.includes("AIIMS") || name.includes("CMC") || name.includes("AFMC");
    const isMidTop = name.includes("MAMC") || name.includes("KGMU") || name.includes("JIPMER") || name.includes("Vardhman");
    const isGovt = !name.includes("Kasturba") && !name.includes("St. John's") && !name.includes("Christian");
    let fees = isGovt ? 12000 : 450000;
    fees += (idx * 1000) % 5000;
    let rating = isTopTier ? 4.9 : isMidTop ? 4.5 : 4.0;
    rating = parseFloat((rating + (idx % 3) * 0.1).toFixed(1));
    if (rating > 5.0) rating = 4.9;
    let placementAvg = isTopTier ? 14.5 : isMidTop ? 10.0 : 6.8;
    placementAvg += parseFloat(((idx * 0.4) % 2).toFixed(1));
    let placementHighest = isTopTier ? 32.0 : isMidTop ? 22.0 : 14.0;
    placementHighest += (idx * 1.5) % 6;

    const slug = getSlug(name);
    eliteSlugs.add(slug);

    eliteColleges.push({
      name,
      slug,
      description: `${name} is a premier medical institute, supporting state-of-the-art clinical holdings, research modules, and multi-specialty hospital postings.`,
      location,
      state,
      fees,
      rating,
      establishedYear: 1910 + (idx * 4) % 100,
      imageUrl: medicalImages[idx % medicalImages.length],
      placementAverage: placementAvg,
      placementHighest: placementHighest,
      courses: medicalCourses,
      facilities: medicalFacilities,
    });
  });

  // Write Elite Colleges to DB
  for (const collegeData of eliteColleges) {
    const college = await prisma.college.create({
      data: collegeData,
    });

    // Seed mock reviews
    if (college.rating >= 4.5) {
      await prisma.review.create({
        data: {
          userId: reviewerUser1.id,
          collegeId: college.id,
          rating: Math.floor(college.rating),
          comment: `Absolutely world-class experience studying at ${college.name}. Outstanding pedagogy and top tier placements!`,
        },
      });

      await prisma.review.create({
        data: {
          userId: reviewerUser2.id,
          collegeId: college.id,
          rating: Math.round(college.rating) - 1 || 4,
          comment: `Excellent campus facilities and sports infrastructure. Highly recommend.`,
        },
      });
    }
  }
  console.log("✅ 90 Elite colleges, reviews, and ratings seeded successfully.");

  // Seed Q&A Discussions
  console.log("💬 4. Seeding discussions and Q&A boards...");
  const question1 = await prisma.question.create({
    data: {
      userId: defaultUser.id,
      title: "Is it worth joining private universities over NITs for B.Tech CS?",
      content: "I have got a rank in JEE Main that allows me to join mid-tier NITs (for civil or mechanical) or I can join top-tier private universities (like BITS Pilani or VIT Vellore) for Computer Science. Placements are my primary concern. What is your advice?",
    },
  });

  await prisma.answer.create({
    data: {
      userId: reviewerUser1.id,
      questionId: question1.id,
      content: "If placements are your primary concern and you are passionate about CS, BITS Pilani is an absolute no-brainer over core branches at mid NITs. The coding culture, zero-attendance policy, and startup ecosystem at BITS are world-class, comparable to top IITs. Core branches at mid-tier NITs might restrict your tech placement eligibility.",
    },
  });

  const question2 = await prisma.question.create({
    data: {
      userId: reviewerUser1.id,
      title: "What is the daily academic schedule like for an MBBS student at AIIMS Delhi?",
      content: "I am preparing for NEET and wanted some daily life motivation. What are the clinical posting hours, class timings, and exam frequencies at AIIMS Delhi?",
    },
  });

  await prisma.answer.create({
    data: {
      userId: reviewerUser2.id,
      questionId: question2.id,
      content: "Daily life is busy but incredibly rewarding! Typically, you have lectures from 8:00 AM to 12:00 PM, followed by clinical postings in the hospital wards from 1:00 PM to 4:30 PM. The caseload at AIIMS is massive, meaning you will see cases that other medical students only read about in textbooks. Postings are highly intensive, and you have weekly sub-stage exams!",
    },
  });
  console.log("✅ Discussions board populated.");

  // Import colleges from CSV
  console.log("📊 5. Parsing UGC/AISHE colleges from colleges.csv...");
  const rawData = fs.readFileSync(csvFilePath, "utf-8");
  const lines = rawData.split(/\r?\n/);
  
  const collegesToInsert: any[] = [];
  const processedSlugs = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row.trim()) continue;

    const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, "").trim());
    
    // col.name is at index 7 in the CSV structure
    const rawName = columns[7];
    if (!rawName) continue;

    const name = rawName.trim();
    const slug = getSlug(name);

    // Skip duplicates or if they are already in the elite seeded dataset
    if (processedSlugs.has(slug) || eliteSlugs.has(slug)) continue;
    processedSlugs.add(slug);

    const state = columns[11] || "Delhi";  // col.state is at index 11
    const city = columns[12] || "New Delhi";  // col.dist is at index 12

    // Dynamic stream classification
    const nameLower = name.toLowerCase();
    let category = "engineering";

    const isMba = nameLower.includes("management") || 
                  nameLower.includes("business") || 
                  nameLower.includes("commerce") || 
                  nameLower.includes("iim") || 
                  nameLower.includes("b-school") || 
                  nameLower.includes("mba") || 
                  nameLower.includes("pgdm") || 
                  nameLower.includes("admin") ||
                  nameLower.includes("corporate");

    const isMedical = nameLower.includes("medical") || 
                      nameLower.includes("dental") || 
                      nameLower.includes("nursing") || 
                      nameLower.includes("hospital") || 
                      nameLower.includes("aiims") || 
                      nameLower.includes("health") || 
                      nameLower.includes("ayur") || 
                      nameLower.includes("pharm") || 
                      nameLower.includes("medicine") || 
                      nameLower.includes("physio");

    const isEng = nameLower.includes("engineering") || 
                  nameLower.includes("technology") || 
                  nameLower.includes("iit") || 
                  nameLower.includes("nit") || 
                  nameLower.includes("iiit") || 
                  nameLower.includes("polytechnic") || 
                  nameLower.includes("computer");

    if (isMba) {
      category = "mba";
    } else if (isMedical) {
      category = "medical";
    } else if (isEng) {
      category = "engineering";
    } else {
      // Proportional distribution for general colleges
      const dist = i % 3;
      category = dist === 0 ? "engineering" : dist === 1 ? "mba" : "medical";
    }

    const isIIT = name.includes("IIT") || name.includes("Indian Institute of Technology") || name.includes("BITS");
    const isIIM = name.includes("IIM") || name.includes("Indian Institute of Management");
    const isAIIMS = name.includes("AIIMS");

    // Exact course maps matching COURSE_TYPE_MAPPING in src/app/api/colleges/route.ts
    const courses = category === "mba" 
      ? ["MBA General", "MBA Finance", "MBA Marketing", "MBA Human Resources", "MBA Business Analytics"] 
      : category === "medical" 
      ? ["MBBS", "BDS Dental Surgery", "MD Pediatrics", "MS General Surgery", "MD General Medicine"] 
      : ["B.Tech Computer Science", "B.Tech Electronics & Communication", "B.Tech Mechanical Engineering", "B.Tech Civil Engineering", "M.Tech Data Science"];

    const facilities = category === "mba"
      ? ["Wi-Fi", "Seminar Hall", "Hostel", "Library", "Cafeteria", "AC Classrooms", "Discussion Rooms"]
      : category === "medical"
      ? ["Wi-Fi", "Teaching Hospital", "Hostel", "Library", "Cafeteria", "Research Lab", "OPD Clinic"]
      : ["Wi-Fi", "Computer Labs", "Hostel", "Library", "Cafeteria", "Sports Complex", "Workshop Labs"];

    let fees = category === "mba" ? (isIIM ? 1200000 : 500000) : category === "medical" ? (isAIIMS ? 12000 : 400000) : (isIIT ? 220000 : 90000);
    let rating = isIIT || isIIM || isAIIMS ? 4.8 : 4.0;
    rating = parseFloat((rating + (i % 3) * 0.1).toFixed(1));
    if (rating > 5.0) rating = 4.9;

    const placementAvg = category === "mba" ? (isIIM ? 28.0 : 12.0) : category === "medical" ? 12.5 : (isIIT ? 18.5 : 6.5);
    const placementHighest = category === "mba" ? (isIIM ? 75.0 : 25.0) : category === "medical" ? 32.0 : (isIIT ? 48.0 : 15.0);

    collegesToInsert.push({
      id: crypto.randomUUID(),
      slug,
      name,
      description: `${name} is a verified higher education institution, providing registered courses under designated academic disciplines with dedicated faculty, research models, and placement opportunities.`,
      location: `${city}, ${state}`,
      state,
      fees,
      rating,
      establishedYear: parseInt(columns[3]) || 1950 + (i % 70), // col.year.est is at index 3
      imageUrl: category === "mba" 
        ? "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
        : category === "medical"
        ? "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?auto=format&fit=crop&w=800&q=80"
        : "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
      placementAverage: placementAvg,
      placementHighest: placementHighest,
      courses,
      facilities,
    });
  }

  console.log(`✅ Parsed ${collegesToInsert.length} unique colleges from CSV.`);
  console.log("⚡ Inserting in ultra-fast batches of 2,000 into your cloud database...");
  
  const batchSize = 2000;
  let totalInserted = 0;

  for (let i = 0; i < collegesToInsert.length; i += batchSize) {
    const batch = collegesToInsert.slice(i, i + batchSize);
    
    const result = await prisma.college.createMany({
      data: batch,
      skipDuplicates: true, 
    });

    totalInserted += result.count;
    console.log(`📈 Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(collegesToInsert.length / batchSize)} (${totalInserted} / ${collegesToInsert.length} saved)`);
  }

  console.log("🎉 SUCCESS! Seeding and bulk CSV import completed with 0 timeouts. Both datasets now coexist beautifully!");
}

main()
  .catch((e) => {
    console.error("❌ Import failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
