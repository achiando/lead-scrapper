export interface DentalClinic {
  id: string;
  name: string;
  category?: string;
  rating?: number;
  reviewsCount?: number;
  phone?: string;
  address?: string;
  websiteUrl?: string;
  mapEmbedUrl?: string;
  city?: string;
  createdAt: number;
  status?: 'new' | 'contacted' | 'negotiating' | 'closed';
  slug?: string;
  searchTerm?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const DENTAL_STOCK_IMAGES = {
  hero: [
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1200&auto=format&fit=crop",
  ],
  services: {
    cleaning: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=800&auto=format&fit=crop",
    filling: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=800&auto=format&fit=crop",
    extraction: "https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=800&auto=format&fit=crop",
    braces: "https://picsum.photos/seed/braces/800/600",
    whitening: "https://images.unsplash.com/photo-1468493858157-0da44aaf1d13?q=80&w=800&auto=format&fit=crop",
  },
  team: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop",
  gallery: [
    "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
  ],
  emergency: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
  exterior: "https://images.unsplash.com/photo-1629909608135-ca29ed9c4bb0?auto=format&fit=crop&w=800&q=80",
};

export const DEFAULT_SERVICES = [
  {
    title: "Teeth Cleaning",
    description: "Professional scaling and polishing to keep your smile bright and healthy.",
    image: DENTAL_STOCK_IMAGES.services.cleaning,
  },
  {
    title: "Tooth Filling",
    description: "High-quality composite fillings to restore damaged teeth seamlessly.",
    image: DENTAL_STOCK_IMAGES.services.filling,
  },
  {
    title: "Tooth Extraction",
    description: "Painless and safe removal of problematic or wisdom teeth.",
    image: DENTAL_STOCK_IMAGES.services.extraction,
  },
  {
    title: "Braces & Orthodontics",
    description: "Straighten your teeth and improve your bite with modern orthodontic solutions.",
    image: DENTAL_STOCK_IMAGES.services.braces,
  },
  {
    title: "Teeth Whitening",
    description: "Advanced whitening treatments for a dazzling, confident smile.",
    image: DENTAL_STOCK_IMAGES.services.whitening,
  },
];

export const BLOG_POSTS = [
  {
    id: "clean-teeth",
    title: "How to Keep Your Teeth Sparkling Clean",
    excerpt: "Discover the professional secrets to maintaining a healthy, white smile between dental visits.",
    date: "March 15, 2026",
    image: "https://picsum.photos/seed/teeth/800/600",
    content: `
      Maintaining oral hygiene is crucial for your overall health. Here are the top tips from our experts:
      
      1. Brush Twice a Day: Use a fluoride toothpaste and a soft-bristled brush. Spend at least two minutes brushing all surfaces of your teeth.
      2. Don't Forget to Floss: Flossing removes plaque from places your toothbrush can't reach, especially between tight teeth.
      3. Clean Your Tongue: Bacteria also lives on your tongue, which can cause bad breath. Give it a gentle scrub or use a tongue scraper.
      4. Limit Sugary Foods: Sugar is the primary food for plaque-causing bacteria. Try to rinse with water after eating sweets.
      5. Visit Your Dentist Regularly: Professional cleanings every 6 months are essential to catch issues early.
    `
  },
  {
    id: "gum-health",
    title: "The Secret to Healthy Gums",
    excerpt: "Gum health is just as important as tooth health. Learn how to prevent gum disease effectively.",
    date: "March 14, 2026",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=800&auto=format&fit=crop",
    content: `
      Healthy gums are the foundation of a healthy smile. Gum disease can lead to tooth loss if left untreated.
      
      - Watch for Bleeding: If your gums bleed when you brush, it's a sign of early gingivitis.
      - Use an Antibacterial Mouthwash: This helps kill bacteria that cause plaque and gum inflammation.
      - Massage Your Gums: Gentle stimulation can improve blood flow to the gum tissue.
      - Quit Smoking: Smoking is a major risk factor for gum disease and slows down healing.
      - Eat Vitamin C Rich Foods: Vitamin C helps maintain the connective tissue in your gums.
    `
  },
  {
    id: "sensitive-teeth",
    title: "Dealing with Sensitive Teeth",
    excerpt: "Does cold water make you wince? Here is why your teeth are sensitive and how to fix it.",
    date: "March 13, 2026",
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=800&auto=format&fit=crop",
    content: `
      Tooth sensitivity can be painful, but it's often manageable with the right care.
      
      - Use Desensitizing Toothpaste: These contain compounds that help block transmission of sensation from the tooth surface to the nerve.
      - Avoid Acidic Foods: Soda, citrus fruits, and wine can wear down tooth enamel over time.
      - Use a Soft Toothbrush: Hard bristles can aggravate sensitive areas and wear down enamel.
      - Don't Brush Too Hard: Aggressive brushing can lead to gum recession, exposing the sensitive root.
      - See Your Dentist: Sensitivity can sometimes be a sign of a cavity or a cracked tooth.
    `
  },
  {
    id: "pediatric-care",
    title: "Dental Care for Children",
    excerpt: "Starting good habits early is the key to a lifetime of healthy smiles for your kids.",
    date: "March 12, 2026",
    image: "https://images.unsplash.com/photo-1468493858157-0da44aaf1d13?q=80&w=800&auto=format&fit=crop",
    content: `
      Children's teeth require special attention to ensure they develop correctly.
      
      - Start Early: Begin cleaning your baby's gums with a soft cloth even before teeth appear.
      - First Visit by Age One: The first dental visit should happen when the first tooth appears or by their first birthday.
      - Supervise Brushing: Kids usually need help brushing until they are 7 or 8 years old.
      - Use the Right Amount of Fluoride: For kids under 3, use a tiny smear of fluoride toothpaste.
      - Make it Fun: Use a timer, a fun toothbrush, or a brushing app to keep them engaged.
    `
  },
  {
    id: "whitening-tips",
    title: "Safe Ways to Whiten Your Smile",
    excerpt: "Want a brighter smile? Here is what you need to know about professional vs. at-home whitening.",
    date: "March 11, 2026",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=800&auto=format&fit=crop",
    content: `
      A white smile is a confidence booster, but it's important to whiten safely.
      
      - Professional Whitening: This is the fastest and safest way to get results, supervised by a dentist.
      - Over-the-Counter Strips: These can be effective but may cause sensitivity if used incorrectly.
      - Avoid Staining Foods: Coffee, tea, and red wine are the biggest culprits for tooth discoloration.
      - Drink Through a Straw: This minimizes contact between staining liquids and your front teeth.
      - Brush After Staining Meals: If you can't brush, at least rinse your mouth with water.
    `
  },
  {
    id: "bad-breath",
    title: "How to Banish Bad Breath",
    excerpt: "Chronic bad breath can be embarrassing. Learn the common causes and how to stay fresh.",
    date: "March 10, 2026",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop",
    content: `
      Bad breath (halitosis) is usually caused by bacteria in the mouth.
      
      - Hydration is Key: A dry mouth lacks saliva, which is needed to wash away food particles and bacteria.
      - Clean Your Tongue: Most bad breath bacteria live on the back of the tongue.
      - Check Your Diet: Garlic and onions are obvious, but high-protein diets can also affect breath.
      - Replace Your Toothbrush: Change it every 3 months or after you've been sick.
      - Persistent Issues: If bad breath doesn't go away, it could be a sign of gum disease or an underlying health issue.
    `
  }
];
