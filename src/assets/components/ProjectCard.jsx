
import { motion } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react";
import { Github } from "./BrandIcons";

const spring = { type: "spring", stiffness: 300, damping: 22 };

export default function ProjectCard({ project }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={spring}
      className="group relative p-1 rounded-2xl border border-transparent bg-[#111827]/50 backdrop-blur-sm transition-all hover:border-blue-500/40 hover:shadow-[0_0_50px_rgba(59,130,246,0.2)]"
    >
      <div className="inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-blue-500/30 to-violet-500/30 mask-[linear-gradient(0,0)_0_0_padding-box_0_0_-webkit-mask] -webkit-mask-composite destination-out" />
      <div className="relative overflow-hidden rounded-xl group-hover:rounded-[1.5rem] transition-rounded">
        <motion.img
          src={project.image}
          alt={project.title}
          loading="lazy"
          decoding="async"
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full h-52 object-cover"
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 text-white tracking-tight">
          {project.title}
        </h3>

        <p className="text-gray-400 text-sm leading-relaxed mb-5">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 transition-all hover:bg-blue-600/30 hover:text-white"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-4">
          {project.github && project.github !== "#" && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 font-medium transition-all hover:text-blue-400 hover:border-blue-500/40 hover:bg-white/10"
            >
              <Github size={16} /> GitHub
            </a>
          )}

          {project.demo && project.demo !== "#" && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 font-medium transition-all hover:text-blue-400 hover:border-blue-500/40 hover:bg-white/10"
            >
              <ExternalLink size={16} /> Live Demo
            </a>
          )}

          {project.caseStudy && (
            <a
              href={project.caseStudy}
              target="_blank"
              rel="noreferrer"
              download
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 font-medium transition-all hover:text-blue-400 hover:border-blue-500/40 hover:bg-white/10"
            >
              <FileText size={16} /> Case Study
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
