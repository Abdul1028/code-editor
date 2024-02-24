import React, { useState } from "react";
import OpenAI from "openai";

const AiOutputWindow = ({ outputDetails }) => {
  const apik = process.env.REACT_APP_OPENAI;

  const openai = new OpenAI({
    apiKey: apik,
    dangerouslyAllowBrowser: true
  });

  async function callGPT(promptt) {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ "role": "user", "content": promptt }],
      max_tokens: 200,
      format: "json" // Request response in JSON format
    });
    console.log(response);
    return response.choices[0].message.content;
  }
  const [solvedSolution, setSolvedSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = async () => {
    setIsLoading(true);
    try {
      const prompt = `Error: ${atob(outputDetails.stderr)}\nSolve the following code:\n${atob(outputDetails.source_code)}  Note : YOu have to respond in a json format with keys as suggestion,explanation,corrected_code for an instance {"suggestion":"suggestions need to be done in code","explanation","why the error occured","corrected_code":"correct code `;
      console.log(prompt);
      const res = await callGPT(prompt);
      setSolvedSolution(res);
    } catch (error) {
      console.error("Error fetching solution:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrors = async () => {
    console.log("workingd")
  }

  const getOutput = () => {
    let statusId = outputDetails?.status?.id;

    if (statusId === 6) {
      // compilation error
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          {atob(outputDetails?.compile_output)}
        </pre>
      );
    } else if (statusId === 3) {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-green-500">
          {atob(outputDetails.stdout) !== null
            ? `${atob(outputDetails.stdout)}`
            : null}
        </pre>
      );
    } else if (statusId === 5) {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          Time Limit Exceeded
        </pre>
      );
    } else {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          {atob(outputDetails?.stderr)}
        </pre>
      );
    }
  };

  const renderSolvedSolution = () => {
    if (!solvedSolution) return null;
    const { suggestion, explanation, corrected_code } = JSON.parse(solvedSolution);
    return (
      <div className="mt-4 text-sm">
        <p><strong>Suggestion:</strong> {suggestion}</p>
        <p><strong>Explanation:</strong> {explanation}</p>
        <p><strong>Corrected code:</strong> {corrected_code}</p>
      </div>
    );
  };

  return (
    <>
      {outputDetails.stderr ? (
        <button 
          onClick={handleButtonClick} 
          className="mt-2 px-4 py-2 rounded-md transition-colors duration-300 ease-in-out bg-blue-500 text-white hover:bg-green-500 hover:text-black"
        >
          Solve Errors
        </button>
      ) : (
        <p className="mt-2 text-sm text-gray-500">No Errors</p>
      )}
      <h1 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-2">
        Output
      </h1>
      <div className="w-full h-56 bg-[#1e293b] rounded-md text-white font-normal text-sm overflow-y-auto">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {solvedSolution ? (
              <>
                {renderSolvedSolution()}
              </>
            ) : (
              getOutput()
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AiOutputWindow;
