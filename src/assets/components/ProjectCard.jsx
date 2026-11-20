
import { motion } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react";
import { Github } from "./BrandIcons";
import FuturisticButton from "./FuturisticButton";

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
              className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 transition-all hover:bg-blue-600/30 hover:text-white"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {project.github && project.github !== "#" && (
            <FuturisticButton
              href={project.github}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              size="sm"
              icon={Github}
            >
              GitHub
            </FuturisticButton>
          )}

          {project.demo && project.demo !== "#" && (
            <FuturisticButton
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              size="sm"
              icon={ExternalLink}
            >
              Live Demo
            </FuturisticButton>
          )}

          {project.caseStudy && (
            <FuturisticButton
              href={project.caseStudy}
              target="_blank"
              rel="noreferrer"
              download
              variant="ghost"
              size="sm"
              icon={FileText}
            >
              Case Study
            </FuturisticButton>
          )}
        </div>
      </div>
    </motion.div>
  );
}
