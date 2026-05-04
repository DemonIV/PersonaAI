export type HeadshotStyle = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  previewUrl: string;
};

export const HEADSHOT_STYLES: HeadshotStyle[] = [
  {
    id: 'corporate-grey',
    name: 'Corporate Grey',
    description: 'A classic professional look with a neutral grey studio background.',
    prompt: 'professional corporate studio headshot, grey textured backdrop, high-end studio lighting, business casual attire, polished commercial photography style',
    previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&h=1000&fit=crop'
  },
  {
    id: 'tech-office',
    name: 'Modern Tech Office',
    description: 'Contemporary blurred office background with natural depth of field.',
    prompt: 'professional modern headshot, blurred high-tech glass office background, soft natural sunlight, smart casual attire, shallow depth of field, vibrant tech-forward aesthetic',
    previewUrl: 'https://images.unsplash.com/photo-1559192823-91ff957df684?q=80&w=800&h=1000&fit=crop'
  },
  {
    id: 'outdoor-natural',
    name: 'Outdoor Natural',
    description: 'Warm, approachable look with natural outdoor lighting.',
    prompt: 'professional approachable headshot, blurred garden or park background, golden hour natural light, relaxed professional attire, soft bokeh, cinematic natural style',
    previewUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&h=1000&fit=crop'
  },
  {
    id: 'minimalist-white',
    name: 'Minimalist White',
    description: 'Clean, bright, and modern with a pure white background.',
    prompt: 'professional high-key headshot, pure white background, bright even lighting, colorful professional attire, clean minimalist aesthetic, sharp focus',
    previewUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=800&h=1000&fit=crop'
  },
  {
    id: 'black-gold',
    name: 'Executive Black & Gold',
    description: 'A prestigious, luxury style with deep black shadows and golden highlights.',
    prompt: 'luxury professional headshot, dramatic black studio background, golden rim lighting, high-end business attire, moody and sophisticated editorial style, sharp focus',
    previewUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&h=1000&fit=crop'
  }
];

export type Customization = {
  lighting: 'warm' | 'cool' | 'dramatic' | 'soft';
  background: 'solid' | 'blurred' | 'nature' | 'library';
  sharpness: number; // 0 to 100
  skinSmoothing: number; // 0 to 100
  clarity: number; // 0 to 100
};
