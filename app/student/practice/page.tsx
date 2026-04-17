import { PracticeProblemCard } from "@/components/practice-problem-card";
import { practiceProblems } from "@/lib/practice-problems";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Practice Problems</h1>
          <p className="text-slate-600">Solve programming challenges and earn XP</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceProblems.map((problem) => (
            <PracticeProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      </div>
    </main>
  );
}