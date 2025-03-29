"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { cn } from "../../../../../lib/utils";
import { GradientSpan } from "../../../../../components/GradientSpan";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function ApiIntegrationGuide() {
  const [activeStep, setActiveStep] = useState(0);
  const stepsRef = useRef<(HTMLElement | null)[]>([]);

  // Steps data
  const steps = [
    {
      id: "introduction",
      title: "Getting Started with Our API",
      description:
        "Our API allows you to seamlessly integrate your service with our platform. This guide will walk you through the process step by step.",
      image: "https://placehold.co/400x400?text=Image",
    },
    {
      id: "authentication",
      title: "Authentication Setup",
      description:
        "Before you can make API calls, you'll need to set up authentication using API keys.",
      image: "https://placehold.co/400x400?text=Image",
      code: `// Request your API key from the dashboard
const apiKey = "your_api_key_here";

// Include it in your request headers
const headers = {
  "Authorization": \`Bearer \${apiKey}\`,
  "Content-Type": "application/json"
};`,
    },
    {
      id: "endpoints",
      title: "Understanding API Endpoints",
      description:
        "Our API provides several endpoints for different functionalities. Here are the main ones you'll be using:",
      image: "https://placehold.co/400x400?text=Image",
      list: [
        "GET /api/v1/users - Retrieve user information",
        "POST /api/v1/transactions - Create a new transaction",
        "GET /api/v1/products - List all available products",
        "PUT /api/v1/settings - Update account settings",
      ],
    },
    {
      id: "integration",
      title: "Integrating with Your Service",
      description:
        "Now let's connect your service to our API using a simple client implementation.",
      image: "https://placehold.co/400x400?text=Image",
      code: `// Example API client implementation
class ApiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.example.com/v1";
  }

  async get(endpoint) {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      headers: {
        "Authorization": \`Bearer \${this.apiKey}\`,
        "Content-Type": "application/json"
      }
    });
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${this.apiKey}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// Usage
const client = new ApiClient("your_api_key_here");
const users = await client.get("/users");
console.log(users);`,
    },
    {
      id: "webhooks",
      title: "Setting Up Webhooks",
      description:
        "Webhooks allow our service to notify your application when events happen in real-time.",
      image: "https://placehold.co/400x400?text=Image",
      code: `// Example webhook handler (Express.js)
app.post('/webhooks', express.json(), (req, res) => {
  const event = req.body;

  // Verify webhook signature
  const signature = req.headers['x-webhook-signature'];
  if (!verifySignature(event, signature, webhookSecret)) {
    return res.status(401).send('Invalid signature');
  }

  // Handle different event types
  switch (event.type) {
    case 'transaction.created':
      handleNewTransaction(event.data);
      break;
    case 'user.updated':
      updateUserInfo(event.data);
      break;
    // Handle other event types
  }

  res.status(200).send('Webhook received');
});`,
    },
    {
      id: "testing",
      title: "Testing Your Integration",
      description:
        "Before going live, it's important to test your integration thoroughly using our sandbox environment.",
      image: "https://placehold.co/400x400?text=Image",
      list: [
        "Use sandbox API keys for testing (prefix: test_)",
        "Simulate different scenarios using our test endpoints",
        "Verify webhook delivery using the webhook tester in your dashboard",
        "Check error handling by triggering known error conditions",
      ],
    },
    {
      id: "going-live",
      title: "Going Live",
      description:
        "Once you've tested your integration and everything works as expected, you're ready to go live!",
      image: "https://placehold.co/400x400?text=Image",
      list: [
        "Switch to production API keys (prefix: live_)",
        "Update webhook URLs to your production endpoints",
        "Monitor API usage and performance in your dashboard",
        "Set up alerts for any critical errors or issues",
      ],
    },
  ];

  // Copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Scroll to a specific step
  const scrollToStep = (index: number) => {
    stepsRef.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  // Set up intersection observer to track active step
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepsRef.current.findIndex(
              (ref) => ref === entry.target,
            );
            if (index !== -1) {
              setActiveStep(index);
            }
          }
        });
      },
      { threshold: 0.5 },
    );

    stepsRef.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      stepsRef.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Side navigation */}
      <div className="hidden lg:block fixed top-20 right-20 bottom-4 w-[15%] overflow-auto py-8 px-4">
        <nav className="space-y-1">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => scrollToStep(index)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeStep === index
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50",
              )}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    "mr-3 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs",
                    activeStep > index
                      ? "bg-purple-600 text-white dark:bg-purple-700"
                      : activeStep === index
                        ? "border-2 border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-500"
                        : "border-2 border-gray-300 text-gray-500 dark:border-gray-700",
                  )}
                >
                  {activeStep > index ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="truncate">{step.title}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:pr-64">
        {/* Introduction section */}
        <section className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <GradientSpan>Power Apps </GradientSpan>
            integration
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Follow this guide to integrate your service with our powerful API
            platform. Scroll down to explore each step of the process.
          </p>
          <div className="mt-8 animate-bounce">
            <ChevronDown className="h-8 w-8 text-purple-600 dark:text-purple-500 mx-auto" />
          </div>
        </section>

        {/* Steps */}
        <div className="space-y-24 pb-24">
          {steps.map((step, index) => (
            <section
              key={step.id}
              ref={(el) => {
                stepsRef.current[index] = el;
              }}
              className="scroll-mt-20"
              id={step.id}
            >
              <div className="flex items-center mb-4">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center mr-3",
                    "bg-purple-600 text-white dark:bg-purple-700",
                  )}
                >
                  {index + 1}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    {step.description}
                  </p>

                  {step.list && (
                    <ul className="space-y-2 mb-6">
                      {step.list.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2 mt-0.5">
                            <Check className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {step.code && (
                    <Card className="border-0 p-4 rounded-lg relative font-mono text-sm overflow-hidden">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400"
                        onClick={() => copyToClipboard(step.code || "")}
                        aria-label="Copy code"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <SyntaxHighlighter
                        language="javascript"
                        style={dracula}
                        className="whitespace-pre-wrap overflow-x-auto rounded-md"
                      >
                        {step.code}
                      </SyntaxHighlighter>
                    </Card>
                  )}
                </div>

                <div className="order-first md:order-last">
                  <Image
                    src={step.image || "/placeholder.svg"}
                    alt={`Illustration for ${step.title}`}
                    width={600}
                    height={400}
                    className="rounded-lg shadow-md w-full object-cover"
                  />
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex justify-center mt-12">
                  <div className="h-12 border-l-2 border-dashed border-purple-300 dark:border-purple-800"></div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Final CTA */}
        <section className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-xl mx-auto">
            Now that you understand how to integrate with our API, it&apos;s
            time to create your account and start building your integration.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
            Create Developer Account
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </section>
      </main>

      {/* Mobile progress indicator */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 px-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {activeStep + 1} of {steps.length}
          </span>
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === activeStep
                    ? "bg-purple-600 dark:bg-purple-500"
                    : "bg-gray-300 dark:bg-gray-700",
                )}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
