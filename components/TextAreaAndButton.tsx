"use client";
import { ChangeEvent, useState, KeyboardEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TextAreaAndButton() {
  const [prompt, setPrompt] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const submitGenerateText = async () => {
    if (prompt.trim() === "") return;

    router.push(`/image/${prompt}`);
  };

  const onInputChanged = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitGenerateText();
      textAreaRef.current?.blur();
    }
  };

  return (
    <>
      <div
        className="flex w-5/6 flex-col space-y-4 lg:w-1/2"
        id="form-container"
      >
        <label htmlFor="prompt" className="text-lg">
          Enter your prompt
        </label>
        <Textarea
          ref={textAreaRef}
          placeholder="Enter your promt here!"
          value={prompt}
          onChange={onInputChanged}
          className="h-48 resize-none rounded-lg bg-slate-600 p-2 text-white placeholder:text-white/50"
          onKeyDown={onKeyDown}
          autoFocus
        />
        <Button
          className="bg-blue-500 hover:bg-blue-700"
          onClick={submitGenerateText}
        >
          Generate
        </Button>
      </div>
    </>
  );
}
