function ensureArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return value
      .split(/[;,\n]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function SkillSection({ label, values }) {
  const items = ensureArray(values);

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-slate-200">{label}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No skills available.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((skill) => (
            <span
              key={`${label}-${skill}`}
              className="rounded-full border border-slate-600 bg-slate-700 px-3 py-1 text-xs text-slate-100"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export default function SkillCard({ profile }) {
  if (!profile) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-slate-300">
        Skill profile not available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-700/50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300">Profile Score</p>
          <p className="mt-2 text-3xl font-semibold text-blue-400">{profile.ProfileScore ?? 0}</p>
        </div>
        <div className="rounded-lg bg-slate-700/50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300">ATS Score</p>
          <p className="mt-2 text-3xl font-semibold text-blue-400">{profile.ATSScore ?? 0}</p>
        </div>
      </div>

      <SkillSection label="Technical Skills" values={profile.TechnicalSkills} />
      <SkillSection label="Soft Skills" values={profile.SoftSkills} />
      <SkillSection label="Tools" values={profile.Tools} />
      <SkillSection label="Certifications" values={profile.Certifications} />
    </div>
  );
}
