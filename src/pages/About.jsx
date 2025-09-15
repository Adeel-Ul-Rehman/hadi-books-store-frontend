import React from "react";
import { motion } from "framer-motion";
import Title from "../components/Title";
import TeamMember from "../components/TeamMember";
import { assets } from "../assets/assets";

const About = () => {
  const team = [
    {
      id: 1,
      name: "Hadeed Haider (Hadi)",
      role: "Founder & CEO",
      bio: "Book enthusiast with over 5 years in the books industry.",
      image: assets.hadi,
    },
    {
      id: 2,
      name: "Adeel Ul Rehman",
      role: "Head of Operations",
      bio: "Ensures our books reach you in perfect condition and on time.",
      image: assets.adeel,
    },
    {
      id: 3,
      name: "Abdullah Gujjer",
      role: "Head Buyer",
      bio: "Curates our collection to bring you the best books available.",
      image: assets.abd,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 dark:from-gray-800 dark:via-gray-900 dark:to-black"
    >
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Title text1="OUR" text2="STORY" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            At Hadi Books Store, we believe every book is a doorway ✨ to
            knowledge, to imagination, and to worlds waiting to be discovered.
          </motion.p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mb-20">
          {/* Left Box */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 p-6 flex flex-col justify-center h-96"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-6">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To connect readers with books that inspire, educate, and
              entertain. We believe in the transformative power of reading and
              strive to make quality literature accessible to everyone.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Our carefully curated selection includes everything from timeless
              classics to contemporary bestsellers, ensuring there's something
              for every type of reader.
            </p>
          </motion.div>

          {/* Right Box */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 h-96"
          >
            <img
              src={assets.shop}
              alt="Our Mission"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <h3 className="text-white text-xl font-bold">
                Curating Knowledge Since 2010
              </h3>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-200 mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Quality",
                description:
                  "We source only the best books from reputable publishers and authors.",
                icon: "⭐",
              },
              {
                title: "Community",
                description:
                  "We support local authors and host book clubs to foster reading communities.",
                icon: "🤝",
              },
              {
                title: "Sustainability",
                description:
                  "We use eco-friendly packaging and support book recycling programs.",
                icon: "🌱",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 p-6"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-200 mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {team.map((member, index) => (
              <TeamMember key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
