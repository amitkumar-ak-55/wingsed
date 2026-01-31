// ===========================================
// Testimonials Data
// ===========================================
// 
// HOW TO ADD A NEW TESTIMONIAL:
// 1. Copy one of the existing testimonial objects below
// 2. Update the fields with real student data
// 3. Save the file - changes will reflect immediately
// 
// FIELDS:
// - id: Unique identifier (use numbers)
// - name: Student's full name
// - university: University they got admitted to
// - country: Country of the university
// - program: Program they're studying
// - quote: Their testimonial quote (keep it 1-3 sentences)
// - image: Optional - URL to their photo (or leave as null for initials)
// - videoUrl: Optional - YouTube/Vimeo URL for video testimonial
// 
// ===========================================

export interface Testimonial {
  id: number;
  name: string;
  university: string;
  country: string;
  program: string;
  quote: string;
  image: string | null;
  videoUrl: string | null;
}

export const testimonials: Testimonial[] = [
  // ===========================================
  // PLACEHOLDER TESTIMONIALS
  // Replace these with real student testimonials
  // ===========================================
  
  {
    id: 1,
    name: "Your Student Name",
    university: "University Name",
    country: "Country",
    program: "MS Computer Science",
    quote: "Add your student's testimonial here. Keep it genuine and specific about how WingsEd helped them.",
    image: null,
    videoUrl: null,
  },
  
  // Uncomment and fill these as you collect more testimonials:
  
  // {
  //   id: 2,
  //   name: "Student Name 2",
  //   university: "University Name",
  //   country: "Germany",
  //   program: "MBA",
  //   quote: "Their testimonial quote here...",
  //   image: null,
  //   videoUrl: null,
  // },
  
  // {
  //   id: 3,
  //   name: "Student Name 3",
  //   university: "University Name",
  //   country: "Australia",
  //   program: "MS Data Science",
  //   quote: "Their testimonial quote here...",
  //   image: "https://example.com/photo.jpg", // Optional photo URL
  //   videoUrl: "https://youtube.com/watch?v=xxx", // Optional video URL
  // },
];

// ===========================================
// Get testimonials for display
// (Filters out incomplete ones automatically)
// ===========================================
export function getActiveTestimonials(): Testimonial[] {
  return testimonials.filter(
    (t) => 
      t.name !== "Your Student Name" && 
      t.quote.length > 20
  );
}
