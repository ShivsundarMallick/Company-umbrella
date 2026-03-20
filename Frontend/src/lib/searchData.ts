import supremeCourtImg from "@/assets/supreme-court.jpg";
import parliamentImg from "@/assets/parliament.jpg";
import redFortImg from "@/assets/red-fort.jpg";
import indiaMapImg from "@/assets/india-map.jpg";

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  type: "article" | "pdf" | "video" | "note" | "link" | "quickie" | "compact";
  image?: string;
  route: string;
  tags?: string[];
  likes?: string;
  comments?: number;
}

// Consolidated searchable data from all pages
export const searchableData: SearchItem[] = [
  // Index page articles (from User)
  {
    id: "1",
    image: supremeCourtImg,
    title: "Judicial Review",
    subtitle: "Supreme Court's Power of Judicial Review",
    description: "Understanding how the Supreme Court of India exercises its power to review laws and constitutional amendments, ensuring they align with the Constitution's basic structure doctrine.",
    tags: ["POLITY", "UPSC", "MAINS"],
    type: "article",
    route: "/",
    likes: "2.4k",
    comments: 12,
  },
  {
    id: "2",
    image: parliamentImg,
    title: "Parliamentary System",
    subtitle: "Lok Sabha vs Rajya Sabha: Key Differences",
    description: "A comprehensive comparison of India's two houses of Parliament - their composition, powers, and roles in the legislative process of the world's largest democracy.",
    tags: ["POLITY", "IAS", "PRELIMS"],
    type: "article",
    route: "/",
    likes: "1.8k",
    comments: 8,
  },
  {
    id: "3",
    image: indiaMapImg,
    title: "Monsoon Patterns",
    subtitle: "Indian Monsoon and Agricultural Impact",
    description: "Exploring how the southwest and northeast monsoons shape India's climate, agriculture, and economy. Understanding the role of Western Ghats in rainfall distribution.",
    tags: ["GEOGRAPHY", "ENVIRONMENT", "NCERT"],
    type: "article",
    route: "/",
    likes: "1.5k",
    comments: 6,
  },
  {
    id: "4",
    image: redFortImg,
    title: "Current Affairs Weekly",
    subtitle: "Important Events This Week",
    description: "Weekly digest of important national and international events crucial for UPSC preparation covering politics, economy, and international relations.",
    tags: ["CURRENT AFFAIRS", "UPSC", "PRELIMS"],
    type: "article",
    route: "/",
    likes: "3.2k",
    comments: 24,
  },
  {
    id: "5",
    image: supremeCourtImg,
    title: "UPSC Strategy Guide",
    subtitle: "Complete Preparation Roadmap",
    description: "Expert tips and strategies for UPSC Civil Services preparation including time management, resource selection, and answer writing techniques.",
    tags: ["STRATEGY", "IAS", "MAINS"],
    type: "article",
    route: "/",
    likes: "4.1k",
    comments: 56,
  },
  {
    id: "6",
    image: parliamentImg,
    title: "Economic Survey Analysis",
    subtitle: "Key Highlights and Trends",
    description: "In-depth analysis of the Economic Survey focusing on GDP growth, fiscal policy, and key economic indicators relevant for UPSC.",
    tags: ["ECONOMY", "CURRENT AFFAIRS", "MAINS"],
    type: "article",
    route: "/",
    likes: "2.1k",
    comments: 18,
  },
  {
    id: "7",
    image: redFortImg,
    title: "Ancient Indian History",
    subtitle: "Mauryan Empire Administration",
    description: "Detailed study of Mauryan administrative system, Ashoka's Dhamma, and the decline of the empire for UPSC History preparation.",
    tags: ["HISTORY", "NCERT", "PRELIMS"],
    type: "article",
    route: "/",
    likes: "1.9k",
    comments: 14,
  },
  {
    id: "8",
    image: indiaMapImg,
    title: "Ethics Case Studies",
    subtitle: "GS Paper 4 Preparation",
    description: "Real-world ethical dilemmas and their analysis with model answers for UPSC Mains GS Paper 4.",
    tags: ["ETHICS", "MAINS", "IAS"],
    type: "article",
    route: "/",
    likes: "2.8k",
    comments: 32,
  },
  {
    id: "9",
    image: supremeCourtImg,
    title: "Essay Writing Guide",
    subtitle: "High-Scoring Essay Techniques",
    description: "Master the art of essay writing for UPSC with structured approaches, examples, and practice topics.",
    tags: ["ESSAY", "MAINS", "STRATEGY"],
    type: "article",
    route: "/",
    likes: "3.5k",
    comments: 42,
  },
  {
    id: "10",
    image: parliamentImg,
    title: "Interview Preparation",
    subtitle: "Personality Test Tips",
    description: "Comprehensive guide for UPSC interview preparation including mock questions, body language tips, and DAF analysis.",
    tags: ["INTERVIEW", "IAS", "STRATEGY"],
    type: "article",
    route: "/",
    likes: "2.6k",
    comments: 28,
  },
  {
    id: "11",
    image: indiaMapImg,
    title: "Science & Technology",
    subtitle: "Recent Developments in Space Tech",
    description: "Latest developments in Indian space program, nuclear technology, and biotechnology for UPSC Science section.",
    tags: ["SCIENCE", "CURRENT AFFAIRS", "PRELIMS"],
    type: "article",
    route: "/",
    likes: "1.7k",
    comments: 11,
  },

  // Compact Articles
  {
    id: "101",
    image: parliamentImg,
    title: "Mughal Empire",
    subtitle: "Akbar's Administrative Reforms",
    tags: ["HISTORY", "NCERT"],
    type: "compact",
    route: "/",
  },
  {
    id: "102",
    image: indiaMapImg,
    title: "River Systems",
    subtitle: "Ganga-Brahmaputra Basin",
    tags: ["GEOGRAPHY", "ENVIRONMENT"],
    type: "compact",
    route: "/",
  },

  // Quickies
  {
    id: "quickie-1",
    title: "The Mughal Empire's Administrative System",
    subtitle: "History of Mughal administration",
    type: "quickie",
    image: redFortImg,
    route: "/quickies",
    tags: ["History", "Mughal", "Administration"],
  },
  {
    id: "quickie-2",
    title: "Indian Parliament: Structure & Functions",
    subtitle: "Understanding parliamentary system",
    type: "quickie",
    image: parliamentImg,
    route: "/quickies",
    tags: ["Politics", "Democracy", "Constitution"],
  },
  {
    id: "quickie-3",
    title: "The Supreme Court of India",
    subtitle: "Guardian of the Constitution",
    type: "quickie",
    image: supremeCourtImg,
    route: "/quickies",
    tags: ["Judiciary", "Law", "Justice"],
  },

  // Resources - PDFs
  {
    id: "pdf-1",
    title: "Indian Polity Notes - Part 1",
    type: "pdf",
    route: "/resources",
    tags: ["Polity", "Notes", "PDF"],
  },
  {
    id: "pdf-2",
    title: "Indian Polity Notes - Part 2",
    type: "pdf",
    route: "/resources",
    tags: ["Polity", "Notes", "PDF"],
  },

  // Resources - Videos
  {
    id: "video-1",
    title: "Constitution Basics - Video Lecture",
    type: "video",
    route: "/resources",
    tags: ["Constitution", "Video", "Lecture"],
  },
];

export const searchContent = (query: string): SearchItem[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return searchableData.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(lowerQuery);
    const subtitleMatch = item.subtitle?.toLowerCase().includes(lowerQuery);
    const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
    const typeMatch = item.type.toLowerCase().includes(lowerQuery);

    return titleMatch || subtitleMatch || tagMatch || typeMatch;
  });
};
