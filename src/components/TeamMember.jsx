import React from 'react';
import { motion } from 'framer-motion';

const TeamMember = ({ member, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 border"
      style={{
        background: 'linear-gradient(to right, #e0f2fe, #ffedd5, #fecaca)', // same as Home
        borderColor: '#e5e7eb', // fixed gray-100
      }}
    >
      {/* Bigger Image Section */}
      <div className="h-80 overflow-hidden">
        <img 
          src={member.image} 
          alt={member.name}
          className="w-full h-84 object-cover object-top transition-transform duration-500 hover:scale-110"
        />
      </div>

      {/* Details Section */}
      <div className="p-4">
        <h3 className="text-lg font-bold" style={{ color: '#111827' }}>
          {member.name}
        </h3>
        <p className="font-medium mb-1" style={{ color: '#4b5563' }}>
          {member.role}
        </p>
        <p className="text-sm" style={{ color: '#4b5563' }}>
          {member.bio}
        </p>
      </div>
    </motion.div>
  );
};

export default TeamMember;
