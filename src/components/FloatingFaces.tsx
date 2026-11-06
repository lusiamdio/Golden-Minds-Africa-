import React from 'react';
import { motion } from 'motion/react';
import mandelaImg from '../assets/images/mandela_ultra_realistic_1781190743154.jpg';
import nkrumahImg from '../assets/images/nkrumah_ultra_realistic_1781190758087.jpg';
import lumumbaImg from '../assets/images/lumumba_ultra_realistic_1781190771223.jpg';
import cheImg from '../assets/images/che_ultra_realistic_1781190785321.jpg';
import savimbiImg from '../assets/images/savimbi_ultra_realistic_1781190797387.jpg';
import womanFighterImg from '../assets/images/woman_fighter_ultra_realistic_1781190810892.jpg';

interface FloatingFacesProps {
  sectionIndex: number;
}

export default function FloatingFaces({ sectionIndex }: FloatingFacesProps) {
  // Define positions and images based on section index to give variety
  const faces = [
    { src: mandelaImg, alt: 'Nelson Mandela', side: 'left', y: '30%' },
    { src: nkrumahImg, alt: 'Kwame Nkrumah', side: 'right', y: '40%' },
    { src: lumumbaImg, alt: 'Patrice Lumumba', side: 'left', y: '50%' },
    { src: cheImg, alt: 'Che Guevara', side: 'right', y: '30%' },
    { src: savimbiImg, alt: 'Jonas Savimbi', side: 'left', y: '40%' },
    { src: womanFighterImg, alt: 'Woman Freedom Fighter', side: 'right', y: '50%' }
  ];

  // Pick exactly 1 face per section
  const faceSet = [faces[sectionIndex % faces.length]];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden lg:block">
      {faceSet.map((face, index) => {
        const isLeft = face.side === 'left';
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 0.3, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ opacity: 1, scale: 1.15, zIndex: 50 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              top: face.y,
              [isLeft ? 'left' : 'right']: isLeft ? '5%' : '5%',
            }}
            title={face.alt}
            className="w-24 h-24 xl:w-32 xl:h-32 rounded-full overflow-hidden border-2 border-[#cca568]/20 hover:border-[#cca568] hover:shadow-[0_0_30px_rgba(204,165,104,0.6)] cursor-pointer pointer-events-auto transition-all"
          >
             <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition-colors duration-300" />
            <img src={face.src} alt={face.alt} className="w-full h-full object-cover grayscale blur-[1px] hover:grayscale-0 hover:blur-none transition-all duration-300" />
          </motion.div>
        );
      })}
    </div>
  );
}
