"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Code2, Upload, Check, FileCode } from "lucide-react";

export interface PracticeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  language: string;
  xp_reward: number;
  problem_statement: string;
  examples?: string;
}

interface PracticeProblemCardProps {
  problem: PracticeProblem;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-100 text-green-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Hard":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function PracticeProblemCard({ problem }: PracticeProblemCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSolutionLogged, setIsSolutionLogged] = useState(false);
  const [loggedFileName, setLoggedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if solution has been logged for this problem
    const loggedSolutions = JSON.parse(localStorage.getItem("loggedSolutions") || "{}");
    const loggedSolution = loggedSolutions[problem.id];
    if (loggedSolution) {
      setIsSolutionLogged(true);
      setLoggedFileName(loggedSolution.fileName);
    }
  }, [problem.id]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(true);
      
      // Save to localStorage
      const loggedSolutions = JSON.parse(localStorage.getItem("loggedSolutions") || "{}");
      loggedSolutions[problem.id] = {
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      };
      localStorage.setItem("loggedSolutions", JSON.stringify(loggedSolutions));
      setIsSolutionLogged(true);
      setLoggedFileName(file.name);

      // Reset success state after 2 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setSelectedFile(null);
      }, 2000);
    }
  };

  const handleLogSolution = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Card
        className={`cursor-pointer transition-all h-full ${
          isSolutionLogged
            ? "bg-gray-50 opacity-60 hover:shadow-md border-gray-300"
            : "hover:shadow-lg"
        }`}
        onClick={() => setIsOpen(true)}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <CardTitle className="text-base">{problem.title}</CardTitle>
                {isSolutionLogged && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 text-white text-xs">Logged</Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      <FileCode className="h-3 w-3" />
                      <span className="truncate max-w-[150px]" title={loggedFileName || ""}>{loggedFileName}</span>
                    </div>
                  </div>
                )}
              </div>
              <CardDescription className="mt-2">{problem.description}</CardDescription>
            </div>
            <Code2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge className={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
            <Badge variant="outline">{problem.language}</Badge>
            <Badge variant="secondary">+{problem.xp_reward} XP</Badge>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl">{problem.title}</DialogTitle>
                <DialogDescription className="mt-2">{problem.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge className={getDifficultyColor(problem.difficulty)}>
                {problem.difficulty}
              </Badge>
              <Badge variant="outline">{problem.language}</Badge>
              <Badge variant="secondary">+{problem.xp_reward} XP</Badge>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Problem Statement</h3>
              <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                {problem.problem_statement}
              </div>
            </div>

            {problem.examples && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Examples</h3>
                <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">
                  {problem.examples}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button
                onClick={handleLogSolution}
                className={`${
                  uploadSuccess
                    ? "bg-green-600 hover:bg-green-700"
                    : isSolutionLogged
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {uploadSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Solution Logged
                  </>
                ) : isSolutionLogged ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Solution Already Logged
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Log Solution
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.rb,.go,.rs,.php"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
