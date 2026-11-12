
export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="text-center mb-14">
      <p className="text-blue-400 uppercase tracking-[4px] text-sm mb-3">
        {subtitle}
      </p>

      <h2 className="text-3xl md:text-5xl font-bold">
        {title}
      </h2>

      <div className="w-20 h-1 bg-blue-500 mx-auto mt-5 rounded-full" />
    </div>
  );
}
