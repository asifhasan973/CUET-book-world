require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const User = require('./models/User');
const Announcement = require('./models/Announcement');

const MONGODB_URI = process.env.MONGODB_URI;
// Always-embed-friendly PDF (used to guarantee PDF viewer works for demo data)
const SAFE_DUMMY_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const seedBooks = [
  {
    title: 'Introduction to Algorithms',
    authors: ['Thomas H. Cormen', 'Charles E. Leiserson', 'Ronald L. Rivest', 'Clifford Stein'],
    publisher: 'MIT Press', year: 2022, isbn: '978-0262046305', edition: '4th',
    subject: ['Algorithms', 'Data Structures'], department: ['CSE'], yearLevel: [1, 2, 3, 4],
    totalCopies: 5, availableCopies: 3,
    description: 'A comprehensive introduction to the modern study of algorithms. It covers a broad range of algorithms in depth, yet makes their design and analysis accessible to all levels of readers.',
    coverImage: '/book-covers/intro-algorithms.svg',
    rating: 4.8, reviewCount: 24, isEbook: false,
  },
  {
    title: 'Computer Networks',
    authors: ['Andrew S. Tanenbaum', 'David J. Wetherall'],
    publisher: 'Pearson', year: 2021, isbn: '978-0132126953', edition: '6th',
    subject: ['Networks', 'Computer Science'], department: ['CSE'], yearLevel: [2, 3],
    totalCopies: 4, availableCopies: 2,
    description: 'The classic guide to computer networks, from physical layer to application layer protocols.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0132126958-L.jpg',
    rating: 4.5, reviewCount: 18, isEbook: false,
  },
  {
    title: 'Operating System Concepts',
    authors: ['Abraham Silberschatz', 'Peter Baer Galvin', 'Greg Gagne'],
    publisher: 'Wiley', year: 2021, isbn: '978-1119800361', edition: '10th',
    subject: ['Operating Systems'], department: ['CSE'], yearLevel: [2, 3],
    totalCopies: 4, availableCopies: 1,
    description: 'The definitive guide to OS fundamentals including process management, memory management, and file systems.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/1118063333-L.jpg',
    rating: 4.2, reviewCount: 15, isEbook: false,
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    authors: ['Stuart Russell', 'Peter Norvig'],
    publisher: 'Pearson', year: 2020, isbn: '978-0134610993', edition: '4th',
    subject: ['Artificial Intelligence', 'Machine Learning'], department: ['CSE'], yearLevel: [3, 4],
    totalCopies: 3, availableCopies: 3,
    description: 'The leading textbook in Artificial Intelligence covering intelligent agents, search, knowledge, planning, and learning.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0134610997-L.jpg',
    rating: 4.7, reviewCount: 20, isEbook: false,
  },
  {
    title: 'Database System Concepts',
    authors: ['Abraham Silberschatz', 'Henry F. Korth', 'S. Sudarshan'],
    publisher: 'McGraw Hill', year: 2019, isbn: '978-0078022159', edition: '7th',
    subject: ['Database', 'SQL'], department: ['CSE'], yearLevel: [2, 3],
    totalCopies: 5, availableCopies: 4,
    description: 'A comprehensive introduction to database system concepts, covering data models, languages, design, and implementation.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0078022150-L.jpg',
    rating: 4.3, reviewCount: 12, isEbook: false,
  },
  {
    title: 'Computer Organization and Architecture',
    authors: ['William Stallings'],
    publisher: 'Pearson', year: 2019, isbn: '978-0134997193', edition: '11th',
    subject: ['Architecture', 'Hardware'], department: ['CSE', 'EEE'], yearLevel: [1, 2],
    totalCopies: 6, availableCopies: 5,
    description: 'A clear, comprehensive presentation of the organization and architecture of modern-day computers.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0134997190-L.jpg',
    rating: 4.1, reviewCount: 10, isEbook: false,
  },
  {
    title: 'Discrete Mathematics and Its Applications',
    authors: ['Kenneth H. Rosen'],
    publisher: 'McGraw Hill', year: 2019, isbn: '978-1259676512', edition: '8th',
    subject: ['Mathematics', 'Discrete Mathematics'], department: ['CSE', 'EEE'], yearLevel: [1, 2],
    totalCopies: 8, availableCopies: 6,
    description: 'A precise, relevant, comprehensive approach to mathematical concepts used in computer science.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0073383090-L.jpg',
    rating: 4.4, reviewCount: 16, isEbook: false,
  },
  {
    title: 'The C Programming Language',
    authors: ['Brian W. Kernighan', 'Dennis M. Ritchie'],
    publisher: 'Prentice Hall', year: 1988, isbn: '978-0131103627', edition: '2nd',
    subject: ['Programming', 'C Language'], department: ['CSE', 'EEE'], yearLevel: [1],
    totalCopies: 10, availableCopies: 7,
    description: 'The original and definitive book on the C programming language, co-authored by its creator.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0131103628-L.jpg',
    rating: 4.9, reviewCount: 30, isEbook: false,
  },
  {
    title: 'Engineering Mathematics',
    authors: ['Erwin Kreyszig'],
    publisher: 'Wiley', year: 2011, isbn: '978-0470458365', edition: '10th',
    subject: ['Mathematics', 'Engineering'], department: ['CSE', 'EEE', 'CE', 'ME', 'URP'], yearLevel: [1, 2],
    totalCopies: 20, availableCopies: 12,
    description: 'A comprehensive reference for engineering mathematics covering calculus, linear algebra, complex analysis, and more.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0470458364-L.jpg',
    rating: 4.6, reviewCount: 22, isEbook: false,
  },
  {
    title: 'Fundamentals of Electric Circuits',
    authors: ['Charles K. Alexander', 'Matthew N.O. Sadiku'],
    publisher: 'McGraw Hill', year: 2021, isbn: '978-0078028229', edition: '7th',
    subject: ['Circuits', 'Electrical Engineering'], department: ['EEE'], yearLevel: [1, 2],
    totalCopies: 8, availableCopies: 5,
    description: 'The most widely used introductory circuits textbook, featuring clear explanations with practical applications.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0078028221-L.jpg',
    rating: 4.5, reviewCount: 14, isEbook: false,
  },
  {
    title: 'Structural Analysis',
    authors: ['R.C. Hibbeler'],
    publisher: 'Pearson', year: 2019, isbn: '978-0134610672', edition: '10th',
    subject: ['Structures', 'Civil Engineering'], department: ['CE'], yearLevel: [2, 3],
    totalCopies: 5, availableCopies: 3,
    description: 'A clear and thorough presentation of the theory and application of structural analysis.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0134610679-L.jpg',
    rating: 4.4, reviewCount: 8, isEbook: false,
  },
  {
    title: 'Thermodynamics: An Engineering Approach',
    authors: ['Yunus A. Cengel', 'Michael A. Boles'],
    publisher: 'McGraw Hill', year: 2019, isbn: '978-0073398174', edition: '9th',
    subject: ['Thermodynamics', 'Mechanical Engineering'], department: ['ME'], yearLevel: [2, 3],
    totalCopies: 6, availableCopies: 4,
    description: 'An intuitive approach to thermodynamics combining clear explanations with extensive solved examples.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0073398179-L.jpg',
    rating: 4.3, reviewCount: 11, isEbook: false,
  },

  // Additional printed books (demo data)
  {
    title: 'Compiler Design: Principles and Techniques (Demo)',
    authors: ['Sample Author'],
    publisher: 'CUET Bookworld',
    year: 2024,
    isbn: '978-0000000000',
    edition: '1st',
    subject: ['Compilers', 'Programming Languages'],
    department: ['CSE'],
    yearLevel: [3, 4],
    totalCopies: 6,
    availableCopies: 6,
    description: 'Demo book entry to expand the printed book list.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780131103627-L.jpg',
    rating: 4.4,
    reviewCount: 7,
    isEbook: false,
  },
  {
    title: 'Software Engineering Fundamentals (Demo)',
    authors: ['Sample Author'],
    publisher: 'CUET Bookworld',
    year: 2023,
    isbn: '978-0000000001',
    edition: '1st',
    subject: ['Software Engineering'],
    department: ['CSE'],
    yearLevel: [2, 3, 4],
    totalCopies: 8,
    availableCopies: 5,
    description: 'Demo book entry to expand the printed book list.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0132350882-L.jpg',
    rating: 4.3,
    reviewCount: 9,
    isEbook: false,
  },
  {
    title: 'Network Security Basics (Demo)',
    authors: ['Sample Author'],
    publisher: 'CUET Bookworld',
    year: 2022,
    isbn: '978-0000000002',
    edition: '1st',
    subject: ['Security', 'Networks'],
    department: ['CSE', 'EEE'],
    yearLevel: [3, 4],
    totalCopies: 7,
    availableCopies: 4,
    description: 'Demo book entry to expand the printed book list.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0132126958-L.jpg',
    rating: 4.2,
    reviewCount: 6,
    isEbook: false,
  },
  {
    title: 'Signals and Systems (Demo)',
    authors: ['Sample Author'],
    publisher: 'CUET Bookworld',
    year: 2021,
    isbn: '978-0000000003',
    edition: '1st',
    subject: ['Signals', 'Systems'],
    department: ['EEE'],
    yearLevel: [2, 3],
    totalCopies: 9,
    availableCopies: 7,
    description: 'Demo book entry to expand the printed book list.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0078028221-L.jpg',
    rating: 4.1,
    reviewCount: 5,
    isEbook: false,
  },
  // E-Books with real PDF links from open sources
  {
    title: 'Introduction to Algorithms (E-Book)',
    authors: ['Thomas H. Cormen', 'Charles E. Leiserson'],
    publisher: 'MIT Press', year: 2022,
    subject: ['Algorithms'], department: ['CSE'], yearLevel: [1, 2, 3, 4],
    totalCopies: 999, availableCopies: 999,
    description: 'Digital edition of the comprehensive algorithms textbook. Covers sorting, graph algorithms, dynamic programming, and more.',
    coverImage: '/book-covers/intro-algorithms.svg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.8, reviewCount: 45, isEbook: true, viewCount: 1240,
  },
  {
    title: 'Python for Data Science Handbook',
    authors: ['Jake VanderPlas'],
    publisher: "O'Reilly", year: 2023,
    subject: ['Programming', 'Data Science'], department: ['CSE'], yearLevel: [2, 3, 4],
    totalCopies: 999, availableCopies: 999,
    description: 'Essential tools for working with data in Python, including NumPy, Pandas, and Matplotlib.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/1098121228-L.jpg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.6, reviewCount: 32, isEbook: true, viewCount: 890,
  },
  {
    title: 'Deep Learning with Python',
    authors: ['François Chollet'],
    publisher: 'Manning', year: 2021,
    subject: ['Artificial Intelligence', 'Deep Learning'], department: ['CSE'], yearLevel: [3, 4],
    totalCopies: 999, availableCopies: 999,
    description: 'A practical introduction to deep learning with the Keras framework by the creator of Keras.',
    coverImage: '/book-covers/deep-learning-with-python.svg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.7, reviewCount: 28, isEbook: true, viewCount: 670,
  },
  {
    title: 'Clean Code',
    authors: ['Robert C. Martin'],
    publisher: 'Prentice Hall', year: 2008,
    subject: ['Programming', 'Software Engineering'], department: ['CSE'], yearLevel: [2, 3, 4],
    totalCopies: 999, availableCopies: 999,
    description: 'A handbook of agile software craftsmanship for writing clean, readable, and maintainable code.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0132350882-L.jpg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.5, reviewCount: 38, isEbook: true, viewCount: 1560,
  },
  {
    title: 'Think Python: How to Think Like a Computer Scientist',
    authors: ['Allen B. Downey'],
    publisher: "O'Reilly", year: 2024,
    subject: ['Programming', 'Python'], department: ['CSE'], yearLevel: [1, 2],
    totalCopies: 999, availableCopies: 999,
    description: 'An introduction to Python programming for beginners. Learn programming concepts through hands-on exercises.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/1491939362-L.jpg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.4, reviewCount: 22, isEbook: true, viewCount: 980,
  },
  {
    title: 'Linear Algebra Done Right',
    authors: ['Sheldon Axler'],
    publisher: 'Springer', year: 2024,
    subject: ['Mathematics', 'Linear Algebra'], department: ['CSE', 'EEE', 'ME'], yearLevel: [1, 2],
    totalCopies: 999, availableCopies: 999,
    description: 'A rigorous introduction to linear algebra focusing on vector spaces and linear maps rather than matrices and determinants.',
    coverImage: '/book-covers/linear-algebra-done-right.svg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.6, reviewCount: 15, isEbook: true, viewCount: 540,
  },

  // Additional e-books (demo data)
  {
    title: 'Algorithms in Practice (E-Book)',
    authors: ['Sample Author'],
    publisher: 'CUET Bookworld',
    year: 2024,
    subject: ['Algorithms'],
    department: ['CSE'],
    yearLevel: [2, 3, 4],
    totalCopies: 999,
    availableCopies: 999,
    description: 'Demo e-book entry to expand the digital library.',
    coverImage: 'https://covers.openlibrary.org/b/id/2341462-L.jpg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.4,
    reviewCount: 10,
    isEbook: true,
    viewCount: 420,
  },
  {
    title: 'Database Foundations (E-Book)',
    authors: ['Sample Author'],
    publisher: 'CUET Bookworld',
    year: 2024,
    subject: ['Database', 'SQL'],
    department: ['CSE'],
    yearLevel: [2, 3],
    totalCopies: 999,
    availableCopies: 999,
    description: 'Demo e-book entry to expand the digital library.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0078022150-L.jpg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.3,
    reviewCount: 8,
    isEbook: true,
    viewCount: 300,
  },
  {
    title: 'Operating Systems Essentials (E-Book)',
    authors: ['Sample Author'],
    publisher: 'CUET Bookworld',
    year: 2024,
    subject: ['Operating Systems'],
    department: ['CSE'],
    yearLevel: [2, 3],
    totalCopies: 999,
    availableCopies: 999,
    description: 'Demo e-book entry to expand the digital library.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/1118063333-L.jpg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.2,
    reviewCount: 6,
    isEbook: true,
    viewCount: 260,
  },
  {
    title: 'Discrete Mathematics Notes (E-Book)',
    authors: ['Sample Author'],
    publisher: 'CUET Bookworld',
    year: 2024,
    subject: ['Discrete Mathematics'],
    department: ['EEE', 'CE', 'CSE'],
    yearLevel: [1, 2],
    totalCopies: 999,
    availableCopies: 999,
    description: 'Demo e-book entry to expand the digital library.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0073383090-L.jpg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.1,
    reviewCount: 5,
    isEbook: true,
    viewCount: 210,
  },
  {
    title: 'Computer Architecture Brief (E-Book)',
    authors: ['Sample Author'],
    publisher: 'CUET Bookworld',
    year: 2024,
    subject: ['Architecture', 'Hardware'],
    department: ['EEE'],
    yearLevel: [2, 3],
    totalCopies: 999,
    availableCopies: 999,
    description: 'Demo e-book entry to expand the digital library.',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0134997190-L.jpg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.0,
    reviewCount: 4,
    isEbook: true,
    viewCount: 190,
  },
  {
    title: 'Data Structures Crash Course (E-Book)',
    authors: ['Sample Author'],
    publisher: 'CUET Bookworld',
    year: 2024,
    subject: ['Data Structures'],
    department: ['CSE'],
    yearLevel: [1, 2, 3],
    totalCopies: 999,
    availableCopies: 999,
    description: 'Demo e-book entry to expand the digital library.',
    coverImage: 'https://covers.openlibrary.org/b/id/2341462-L.jpg',
    ebookLink: SAFE_DUMMY_PDF,
    rating: 4.5,
    reviewCount: 12,
    isEbook: true,
    viewCount: 520,
  },
];

const seedUsers = [
  {
    firebaseUid: 'demo_student_uid',
    name: 'Rafiq Ahmed',
    email: 'student@cuet.ac.bd',
    studentId: '2204010',
    department: 'CSE',
    year: '3rd',
    role: 'student',
    status: 'active',
    borrowLimit: 3,
  },
  {
    firebaseUid: 'demo_librarian_uid',
    name: 'Dr. Nazrul Islam',
    email: 'librarian@cuet.ac.bd',
    studentId: 'LIB001',
    department: 'CSE',
    year: 'Faculty',
    role: 'librarian',
    status: 'active',
    borrowLimit: 6,
  },
  {
    firebaseUid: 'demo_admin_uid',
    name: 'Prof. Kamal Hossain',
    email: 'admin@cuet.ac.bd',
    studentId: 'ADM001',
    department: 'CSE',
    year: 'Faculty',
    role: 'admin',
    status: 'active',
    borrowLimit: 6,
  },
];

const seedAnnouncements = [
  {
    title: 'Library Holiday Notice',
    message: 'The CUET Library will remain closed on 21st February (International Mother Language Day). Regular services resume on 22nd February.',
    active: true,
    showOnHome: true,
  },
  {
    title: 'New E-Books Added',
    message: 'We have added new e-books to the digital library including Python for Data Science, Deep Learning with Python, and Think Python. Check them out!',
    active: true,
  },
  {
    title: 'Renewal Consultation Policy',
    message: 'Some renewals may require a short video consultation. If approved, join the meeting from Renew → Check Status.',
    active: true,
  },
  {
    title: 'Exam Week Extended Hours',
    message: 'During exam week, the reading room stays open until 9:00 PM (Sat–Thu). Please keep noise low and carry your CUET ID.',
    active: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Book.deleteMany({});
    await User.deleteMany({});
    await Announcement.deleteMany({});
    console.log('Cleared existing data.');

    // Seed books
    await Book.insertMany(seedBooks);
    console.log(`Seeded ${seedBooks.length} books.`);

    // Seed users
    await User.insertMany(seedUsers);
    console.log(`Seeded ${seedUsers.length} users.`);

    // Seed announcements
    await Announcement.insertMany(seedAnnouncements);
    console.log(`Seeded ${seedAnnouncements.length} announcements.`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Accounts:');
    console.log('  Student:   student@cuet.ac.bd   / Student@123');
    console.log('  Librarian: librarian@cuet.ac.bd / Librarian@123');
    console.log('  Admin:     admin@cuet.ac.bd     / Admin@123');
    console.log('\nNote: Create these accounts in Firebase Console with email/password auth.');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
