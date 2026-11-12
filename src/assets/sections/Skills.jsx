
import SectionTitle from "../components/SectionTitle";
import { skills } from "../data/skills";

export default function Skills() {
  return (
    <section id="skills" className="py-28 px-6 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto">

        <SectionTitle
          title="Technical Skills"
          subtitle="What I work with"
        />

        <div className="grid sm:grid-cols-2 gap-6">
          {skills.map((group) => (
            <div
              key={group.category}
              className="bg-[#111827] border border-white/10 p-7 rounded-2xl hover:border-blue-500/40 transition"
            >
              <h3 className="text-xl font-bold mb-6 text-blue-400">
                {group.category}
              </h3>

              <div className="flex flex-wrap gap-3">
                {group.items.map((skill) => (
                  <span
                    key={skill}
                    className="bg-[#1E293B] text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-blue-600 hover:text-white transition"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
