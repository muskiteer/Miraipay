'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  Code2, 
  Zap, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  DollarSign,
  Shield,
  Rocket,
  FileCode,
  TestTube,
  Lightbulb
} from 'lucide-react'

export default function ToolGuidePage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-12 w-12 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">Tool Creation Guide</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Learn how to build X402-compatible tools that work seamlessly with Miraipay's AI agent
            and earn MNEE tokens from every interaction.
          </p>
        </div>

        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <Rocket className="h-8 w-8 text-purple-400" />
            Quick Start
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Build Your API</h3>
              <p className="text-gray-300">
                Create a REST API endpoint that performs a useful function. 
                Can be anything from data retrieval to complex computations.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Add X402 Protocol</h3>
              <p className="text-gray-300">
                Implement the X402 payment protocol to accept MNEE micropayments. 
                Return 402 status with payment headers.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Register & Earn</h3>
              <p className="text-gray-300">
                Submit your tool to Miraipay's registry. Once approved, 
                earn MNEE tokens every time the AI agent uses your tool.
              </p>
            </div>
          </div>
        </section>

        {/* X402 Protocol */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-400" />
            Understanding X402 Protocol
          </h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
            <p className="text-gray-300 mb-6 text-lg">
              X402 is an HTTP extension that enables seamless micropayments for API usage. 
              It's built on HTTP 402 Payment Required status code with additional headers for payment details.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 rounded-full p-2 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Step 1: Initial Request</h4>
                  <p className="text-gray-300">Client calls your API without payment</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 rounded-full p-2 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Step 2: Payment Required Response</h4>
                  <p className="text-gray-300">Your API returns 402 with payment details in headers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 rounded-full p-2 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Step 3: Payment Processing</h4>
                  <p className="text-gray-300">Client transfers MNEE tokens to your wallet address</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 rounded-full p-2 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Step 4: Retry with Proof</h4>
                  <p className="text-gray-300">Client retries request with X-Payment-Proof header (transaction hash)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 rounded-full p-2 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Step 5: Service Delivery</h4>
                  <p className="text-gray-300">Your API validates payment and returns the response</p>
                </div>
              </div>
            </div>

            {/* Code Example 1 */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-400">Python (FastAPI) Example</span>
                <button
                  onClick={() => copyToClipboard(`from fastapi import APIRouter, HTTPException, Header, Response
from typing import Optional

router = APIRouter()

@router.post("/your-tool")
async def your_tool_endpoint(
    data: YourRequestModel,
    x_payment_proof: Optional[str] = Header(None),
    response: Response = None
):
    # Check for payment proof
    if not x_payment_proof:
        response.status_code = 402
        response.headers["X-Accept-Payment"] = "MNEE"
        response.headers["X-Payment-Address"] = "0xYourWalletAddress"
        response.headers["X-Payment-Amount"] = "1.5"  # Price in MNEE
        response.headers["X-Payment-Network"] = "ethereum"
        response.headers["X-Payment-Contract"] = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF"
        
        raise HTTPException(
            status_code=402,
            detail={
                "error": "Payment Required",
                "message": "Please pay 1.5 MNEE to use this tool",
                "payment_address": "0xYourWalletAddress",
                "amount": "1.5",
                "currency": "MNEE"
            }
        )
    
    # Validate payment proof (transaction hash)
    if not x_payment_proof.startswith("0x") or len(x_payment_proof) != 66:
        raise HTTPException(status_code=400, detail="Invalid transaction hash")
    
    # Your tool logic here
    result = perform_your_service(data)
    
    return {"success": True, "data": result}`, 1)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {copiedIndex === 1 ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
{`from fastapi import APIRouter, HTTPException, Header, Response
from typing import Optional

router = APIRouter()

@router.post("/your-tool")
async def your_tool_endpoint(
    data: YourRequestModel,
    x_payment_proof: Optional[str] = Header(None),
    response: Response = None
):
    # Check for payment proof
    if not x_payment_proof:
        response.status_code = 402
        response.headers["X-Accept-Payment"] = "MNEE"
        response.headers["X-Payment-Address"] = "0xYourWalletAddress"
        response.headers["X-Payment-Amount"] = "1.5"  # Price in MNEE
        response.headers["X-Payment-Network"] = "ethereum"
        response.headers["X-Payment-Contract"] = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF"
        
        raise HTTPException(
            status_code=402,
            detail={
                "error": "Payment Required",
                "message": "Please pay 1.5 MNEE to use this tool",
                "payment_address": "0xYourWalletAddress",
                "amount": "1.5",
                "currency": "MNEE"
            }
        )
    
    # Validate payment proof (transaction hash)
    if not x_payment_proof.startswith("0x") or len(x_payment_proof) != 66:
        raise HTTPException(status_code=400, detail="Invalid transaction hash")
    
    # Your tool logic here
    result = perform_your_service(data)
    
    return {"success": True, "data": result}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Tool Metadata Format */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <FileCode className="h-8 w-8 text-purple-400" />
            Tool Metadata Format
          </h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
            <p className="text-gray-300 mb-6">
              When registering your tool on Miraipay, provide this JSON metadata:
            </p>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-400">Tool Registration JSON</span>
                <button
                  onClick={() => copyToClipboard(`{
  "name": "Weather Forecast API",
  "description": "Get 7-day weather forecast for any city worldwide with detailed hourly breakdowns",
  "category": "Data & Information",
  "endpoint": "https://your-api.com/api/weather/forecast",
  "method": "POST",
  "price": "0.5",
  "parameters": [
    {
      "name": "city",
      "type": "string",
      "description": "City name (e.g., 'Toronto', 'New York')",
      "required": true
    },
    {
      "name": "days",
      "type": "integer",
      "description": "Number of forecast days (1-7)",
      "required": false,
      "default": 7
    },
    {
      "name": "units",
      "type": "string",
      "description": "Temperature units: 'celsius' or 'fahrenheit'",
      "required": false,
      "default": "celsius"
    }
  ],
  "return_type": {
    "type": "object",
    "properties": {
      "city": "string",
      "forecast": "array of daily forecasts",
      "temperature_unit": "string"
    }
  },
  "example_request": {
    "city": "Toronto",
    "days": 5,
    "units": "celsius"
  },
  "example_response": {
    "city": "Toronto",
    "forecast": [
      {
        "date": "2025-01-15",
        "high": 5,
        "low": -2,
        "condition": "Partly Cloudy"
      }
    ]
  }
}`, 2)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {copiedIndex === 2 ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
{`{
  "name": "Weather Forecast API",
  "description": "Get 7-day weather forecast for any city worldwide with detailed hourly breakdowns",
  "category": "Data & Information",
  "endpoint": "https://your-api.com/api/weather/forecast",
  "method": "POST",
  "price": "0.5",
  "parameters": [
    {
      "name": "city",
      "type": "string",
      "description": "City name (e.g., 'Toronto', 'New York')",
      "required": true
    },
    {
      "name": "days",
      "type": "integer",
      "description": "Number of forecast days (1-7)",
      "required": false,
      "default": 7
    },
    {
      "name": "units",
      "type": "string",
      "description": "Temperature units: 'celsius' or 'fahrenheit'",
      "required": false,
      "default": "celsius"
    }
  ],
  "return_type": {
    "type": "object",
    "properties": {
      "city": "string",
      "forecast": "array of daily forecasts",
      "temperature_unit": "string"
    }
  },
  "example_request": {
    "city": "Toronto",
    "days": 5,
    "units": "celsius"
  },
  "example_response": {
    "city": "Toronto",
    "forecast": [
      {
        "date": "2025-01-15",
        "high": 5,
        "low": -2,
        "condition": "Partly Cloudy"
      }
    ]
  }
}`}
              </pre>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2">
                <Code2 className="h-5 w-5 text-purple-400 mt-1" />
                <div>
                  <span className="text-white font-semibold">name:</span>
                  <span className="text-gray-300 ml-2">Short, descriptive name (50 chars max)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Code2 className="h-5 w-5 text-purple-400 mt-1" />
                <div>
                  <span className="text-white font-semibold">description:</span>
                  <span className="text-gray-300 ml-2">Detailed explanation of what your tool does (500 chars max)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Code2 className="h-5 w-5 text-purple-400 mt-1" />
                <div>
                  <span className="text-white font-semibold">category:</span>
                  <span className="text-gray-300 ml-2">Data & Information, Communication, Finance, Entertainment, Productivity, Development</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Code2 className="h-5 w-5 text-purple-400 mt-1" />
                <div>
                  <span className="text-white font-semibold">price:</span>
                  <span className="text-gray-300 ml-2">Cost in MNEE tokens per API call</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testing Your Tool */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <TestTube className="h-8 w-8 text-purple-400" />
            Testing Your Tool
          </h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Manual Testing with cURL</h3>
            
            <div className="relative mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-400">Step 1: Test without payment</span>
                <button
                  onClick={() => copyToClipboard(`curl -X POST https://your-api.com/api/your-tool \\
  -H "Content-Type: application/json" \\
  -d '{"param1": "value1"}' \\
  -v`, 3)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {copiedIndex === 3 ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
{`curl -X POST https://your-api.com/api/your-tool \\
  -H "Content-Type: application/json" \\
  -d '{"param1": "value1"}' \\
  -v`}
              </pre>
              <p className="text-gray-400 text-sm mt-2">Should return 402 with payment headers</p>
            </div>

            <div className="relative mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-400">Step 2: Test with mock payment proof</span>
                <button
                  onClick={() => copyToClipboard(`curl -X POST https://your-api.com/api/your-tool \\
  -H "Content-Type: application/json" \\
  -H "X-Payment-Proof: 0xabc123def456..." \\
  -d '{"param1": "value1"}'`, 4)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {copiedIndex === 4 ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
{`curl -X POST https://your-api.com/api/your-tool \\
  -H "Content-Type: application/json" \\
  -H "X-Payment-Proof: 0xabc123def456..." \\
  -d '{"param1": "value1"}'`}
              </pre>
              <p className="text-gray-400 text-sm mt-2">Should return your tool's response</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mt-6">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Best Practices
              </h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Always validate the transaction hash format (0x followed by 64 hex chars)</li>
                <li>• In production, verify the payment on-chain before delivering service</li>
                <li>• Include detailed error messages for common failure cases</li>
                <li>• Test with the Miraipay AI agent before going live</li>
                <li>• Monitor your wallet for incoming MNEE payments</li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
              <h4 className="text-white font-semibold mb-2">Common Pitfalls</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Forgetting to set response status to 402 (not 400 or 403)</li>
                <li>• Not including all required payment headers in 402 response</li>
                <li>• Incorrect MNEE contract address in X-Payment-Contract header</li>
                <li>• Not handling missing X-Payment-Proof header gracefully</li>
                <li>• Setting price too high (users will avoid expensive tools)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing Guidelines */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-purple-400" />
            Pricing Guidelines
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <div className="bg-green-500/20 rounded-lg p-3 mb-4 inline-block">
                <Zap className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Simple Tools</h3>
              <div className="text-3xl font-bold text-purple-400 mb-2">0.1 - 1.0 MNEE</div>
              <p className="text-gray-300 text-sm mb-3">
                Basic data retrieval, simple calculations, quick lookups
              </p>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Weather lookups</li>
                <li>• Currency conversion</li>
                <li>• Time zone checks</li>
                <li>• Simple math operations</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <div className="bg-blue-500/20 rounded-lg p-3 mb-4 inline-block">
                <Code2 className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Standard Tools</h3>
              <div className="text-3xl font-bold text-purple-400 mb-2">1.0 - 5.0 MNEE</div>
              <p className="text-gray-300 text-sm mb-3">
                Moderate complexity, external API calls, data processing
              </p>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Email sending</li>
                <li>• Image processing</li>
                <li>• Database queries</li>
                <li>• Content generation</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <div className="bg-purple-500/20 rounded-lg p-3 mb-4 inline-block">
                <Rocket className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Complex Tools</h3>
              <div className="text-3xl font-bold text-purple-400 mb-2">5.0 - 20.0 MNEE</div>
              <p className="text-gray-300 text-sm mb-3">
                High computation, AI/ML models, real-time services
              </p>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• AI image generation</li>
                <li>• Video transcoding</li>
                <li>• Real-time booking</li>
                <li>• Complex analytics</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <ExternalLink className="h-8 w-8 text-purple-400" />
            Resources & Links
          </h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
            <div className="grid md:grid-cols-2 gap-6">
              <a 
                href="https://etherscan.io/token/0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-purple-500/20"
              >
                <ExternalLink className="h-6 w-6 text-purple-400" />
                <div>
                  <div className="text-white font-semibold">MNEE Token Contract</div>
                  <div className="text-gray-400 text-sm">View on Etherscan</div>
                </div>
              </a>
              
              <a 
                href="https://github.com/bitcoin-dev-project/bips/pull/1521"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-purple-500/20"
              >
                <ExternalLink className="h-6 w-6 text-purple-400" />
                <div>
                  <div className="text-white font-semibold">X402 Protocol Spec</div>
                  <div className="text-gray-400 text-sm">Official documentation</div>
                </div>
              </a>
              
              <a 
                href="/api/demo/x402-example"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-purple-500/20"
              >
                <Code2 className="h-6 w-6 text-purple-400" />
                <div>
                  <div className="text-white font-semibold">Demo API Endpoint</div>
                  <div className="text-gray-400 text-sm">Live X402 example</div>
                </div>
              </a>
              
              <a 
                href="/create-tool"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-purple-500/20"
              >
                <Rocket className="h-6 w-6 text-purple-400" />
                <div>
                  <div className="text-white font-semibold">Submit Your Tool</div>
                  <div className="text-gray-400 text-sm">Register on Miraipay</div>
                </div>
              </a>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
              <h3 className="text-xl font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-gray-300">
                Join our developer community for support, code examples, and discussions about 
                building X402-compatible tools. We're here to help you succeed!
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
