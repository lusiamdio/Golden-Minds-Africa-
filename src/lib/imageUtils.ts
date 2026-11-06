/**
 * Utility functions for client-side image processing, compression, and presets.
 */

export const PRESET_AVATARS = [
  {
    id: 'avatar-1',
    name: 'Amina Mensah (Ghana)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    title: 'Policy Fellow • West Africa'
  },
  {
    id: 'avatar-2',
    name: 'Kofi Boateng (Rwanda)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    title: 'Tech Sovereignty Lead • East Africa'
  },
  {
    id: 'avatar-3',
    name: 'Fatima Zahra (Morocco)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
    title: 'Trade & AfCFTA Fellow • North Africa'
  },
  {
    id: 'avatar-4',
    name: 'Thabo Mokoena (South Africa)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
    title: 'Energy Transition Fellow • Southern Africa'
  },
  {
    id: 'avatar-5',
    name: 'Chiamaka Eze (Nigeria)',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&h=400&q=80',
    title: 'Civic Innovation Fellow • West Africa'
  },
  {
    id: 'avatar-6',
    name: 'Jean-Luc Habimana (Burundi)',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&h=400&q=80',
    title: 'Diplomatic Strategy Fellow • Central Africa'
  }
];

export const PRESET_COVERS = [
  {
    id: 'cover-1',
    name: 'Pan-African Summit & Diplomatic Hall',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&h=500&q=85',
    category: 'Institutional'
  },
  {
    id: 'cover-2',
    name: 'Modern African Innovation & Tech City',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&h=500&q=85',
    category: 'Innovation'
  },
  {
    id: 'cover-3',
    name: 'African Savannah & Golden Horizon',
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&h=500&q=85',
    category: 'Heritage'
  },
  {
    id: 'cover-4',
    name: 'Golden Minds Diplomatic Green & Gold Crest',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&h=500&q=85',
    category: 'Governance'
  },
  {
    id: 'cover-5',
    name: 'Solar Energy & Sustainable Infrastructure',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1600&h=500&q=85',
    category: 'Energy'
  }
];

/**
 * Compress an uploaded file into a base64 data URL with max dimension constraints.
 * Ensures instant real-time preview and safe storage in browser localStorage.
 */
export async function compressImageFile(file: File, maxDimension = 1000, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Apply smooth interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
