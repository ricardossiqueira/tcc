import React from "react";

export default function Hero() {
  return (
    <div className="flex flex-col justify-center items-center mt-[5%]">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-JetBrainsMono ">
          Create Intelligent Python Functions
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Generate AI-powered microservices, ready to integrate with low-code
          platforms.
        </p>

        <button className="px-6 py-3 text-white font-semibold rounded-md transition duration-300 hover:text-shadow-neon-text">
          Try it out!
        </button>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-6 text-center max-w-4xl">
        <div className="border from-white/5 to-black/5 bg-gradient-to-bl backdrop-blur-sm p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-2">1. Write the Function</h3>
          <p className="text-gray-400">
            Create the Python function with the logic your application needs.
          </p>
        </div>
        <div className="border from-white/5 to-black/5 bg-gradient-to-bl backdrop-blur-sm p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-2">
            2. Configure Parameters
          </h3>
          <p className="text-gray-400">
            Define inputs, outputs, and additional parameters to customize.
          </p>
        </div>
        <div className="border from-white/5 to-black/5 bg-gradient-to-bl backdrop-blur-sm p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-2">
            3. Publish and Integrate
          </h3>
          <p className="text-gray-400">
            Generate an API to consume the service on any platform.
          </p>
        </div>
      </div>
    </div>
  );
}
