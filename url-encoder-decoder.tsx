"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, RotateCcw, ArrowUpDown, Trash2, Plus, Edit3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

export default function Component() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [activeTab, setActiveTab] = useState("encode")
  const { toast } = useToast()

  const [urlToParse, setUrlToParse] = useState("")
  const [parsedUrl, setParsedUrl] = useState<{
    baseUrl: string
    params: Array<{ key: string; value: string; id: string }>
  } | null>(null)
  const [editingParam, setEditingParam] = useState<string | null>(null)

  const handleEncode = () => {
    try {
      const encoded = encodeURIComponent(input)
      setOutput(encoded)
    } catch (error) {
      toast({
        title: "Encoding Error",
        description: "Failed to encode the input text.",
        variant: "destructive",
      })
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(input)
      setOutput(decoded)
    } catch (error) {
      toast({
        title: "Decoding Error",
        description: "Invalid URL encoding. Please check your input.",
        variant: "destructive",
      })
    }
  }

  const handleProcess = () => {
    if (!input.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some text to process.",
        variant: "destructive",
      })
      return
    }

    if (activeTab === "encode") {
      handleEncode()
    } else {
      handleDecode()
    }
  }

  const handleCopy = async () => {
    if (!output) return

    try {
      await navigator.clipboard.writeText(output)
      toast({
        title: "Copied!",
        description: "Result copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
  }

  const handleSwap = () => {
    setInput(output)
    setOutput(input)
    setActiveTab(activeTab === "encode" ? "decode" : "encode")
  }

  const exampleUrls = {
    encode: [
      "https://example.com/search?q=hello world",
      "https://site.com/path with spaces/file.html",
      "mailto:user@domain.com?subject=Hello & Welcome",
    ],
    decode: [
      "https%3A//example.com/search%3Fq%3Dhello%20world",
      "https%3A//site.com/path%20with%20spaces/file.html",
      "mailto%3Auser%40domain.com%3Fsubject%3DHello%20%26%20Welcome",
    ],
  }

  const loadExample = (example: string) => {
    setInput(example)
    setOutput("")
  }

  const parseUrl = () => {
    if (!urlToParse.trim()) {
      toast({
        title: "Empty URL",
        description: "Please enter a URL to parse.",
        variant: "destructive",
      })
      return
    }

    try {
      // Handle both encoded and decoded URLs
      let urlToProcess = urlToParse

      // If it looks like an encoded URL, decode it first
      if (urlToParse.includes("%")) {
        try {
          urlToProcess = decodeURIComponent(urlToParse)
        } catch {
          // If decoding fails, use original
        }
      }

      const url = new URL(urlToProcess)
      const params: Array<{ key: string; value: string; id: string }> = []

      url.searchParams.forEach((value, key) => {
        params.push({
          key,
          value,
          id: Math.random().toString(36).substr(2, 9),
        })
      })

      setParsedUrl({
        baseUrl: `${url.protocol}//${url.host}${url.pathname}`,
        params,
      })
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL with protocol (http:// or https://).",
        variant: "destructive",
      })
    }
  }

  const updateParam = (id: string, key: string, value: string) => {
    if (!parsedUrl) return

    setParsedUrl({
      ...parsedUrl,
      params: parsedUrl.params.map((param) => (param.id === id ? { ...param, key, value } : param)),
    })
  }

  const deleteParam = (id: string) => {
    if (!parsedUrl) return

    setParsedUrl({
      ...parsedUrl,
      params: parsedUrl.params.filter((param) => param.id !== id),
    })
  }

  const addParam = () => {
    if (!parsedUrl) return

    const newParam = {
      key: "",
      value: "",
      id: Math.random().toString(36).substr(2, 9),
    }

    setParsedUrl({
      ...parsedUrl,
      params: [...parsedUrl.params, newParam],
    })
    setEditingParam(newParam.id)
  }

  const reconstructUrl = () => {
    if (!parsedUrl) return ""

    const url = new URL(parsedUrl.baseUrl)
    parsedUrl.params.forEach((param) => {
      if (param.key.trim()) {
        url.searchParams.set(param.key, param.value)
      }
    })

    return url.toString()
  }

  const getDecodedUrl = () => {
    const encodedUrl = reconstructUrl()
    if (!encodedUrl) return ""
    
    try {
      return decodeURIComponent(encodedUrl)
    } catch {
      return encodedUrl // fallback to encoded version if decoding fails
    }
  }

  const copyReconstructedUrl = async () => {
    const reconstructedUrl = reconstructUrl()
    if (!reconstructedUrl) return

    try {
      await navigator.clipboard.writeText(reconstructedUrl)
      toast({
        title: "Copied!",
        description: "Reconstructed URL copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const loadUrlToEncoder = (url: string) => {
    setInput(url)
    setOutput("")
    setActiveTab("encode")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            URL Encoder & Decoder
          </h1>
          <p className="text-lg text-gray-600">Encode and decode URLs and text for web-safe transmission</p>
        </div>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm">
                <TabsTrigger 
                  value="encode" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white/90"
                >
                  🔒 Encode
                </TabsTrigger>
                <TabsTrigger 
                  value="decode" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 text-white/90"
                >
                  🔓 Decode
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="input" className="text-gray-700 font-medium">
                {activeTab === "encode" ? "🔤 Text to Encode" : "🔗 Text to Decode"}
              </Label>
              <Textarea
                id="input"
                placeholder={
                  activeTab === "encode" ? "Enter URL or text to encode..." : "Enter encoded text to decode..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                className="resize-none border-2 border-blue-200 focus:border-blue-500 bg-white/70"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleProcess} 
                className={`flex-1 min-w-[120px] font-medium ${
                  activeTab === "encode" 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" 
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                }`}
              >
                {activeTab === "encode" ? "🔒 Encode" : "🔓 Decode"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSwap} 
                size="icon" 
                disabled={!output}
                className="border-purple-300 hover:bg-purple-50 hover:border-purple-500"
              >
                <ArrowUpDown className="h-4 w-4 text-purple-600" />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClear} 
                size="icon"
                className="border-gray-300 hover:bg-gray-50 hover:border-gray-500"
              >
                <RotateCcw className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="output" className="text-gray-700 font-medium">✨ Result</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy} 
                  disabled={!output} 
                  className="h-8 px-2 hover:bg-green-50 hover:text-green-600"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                id="output"
                value={output}
                readOnly
                rows={4}
                className="resize-none bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200"
                placeholder="Result will appear here..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              🔧 Query Parameter Parser
            </CardTitle>
            <CardDescription className="text-purple-100">
              Parse URLs to view and edit individual query parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="url-parse" className="text-gray-700 font-medium">🌐 URL to Parse</Label>
              <div className="flex gap-2">
                <Input
                  id="url-parse"
                  placeholder="https://example.com/search?q=hello&category=web&page=1"
                  value={urlToParse}
                  onChange={(e) => setUrlToParse(e.target.value)}
                  className="flex-1 border-2 border-purple-200 focus:border-purple-500 bg-white/70"
                />
                <Button 
                  onClick={parseUrl}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Parse
                </Button>
              </div>
            </div>

            {parsedUrl && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">🏠 Base URL</Label>
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md font-mono text-sm break-all border-2 border-blue-200">
                    {parsedUrl.baseUrl}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700 font-medium">
                      📝 Query Parameters ({parsedUrl.params.length})
                    </Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addParam}
                      className="border-green-300 hover:bg-green-50 hover:border-green-500 text-green-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Parameter
                    </Button>
                  </div>

                  {parsedUrl.params.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                      No query parameters found. Click "Add Parameter" to add one.
                    </div>
                  ) : (
                    <div className="border-2 border-indigo-200 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm">
                        <div className="col-span-4">Parameter</div>
                        <div className="col-span-6">Value</div>
                        <div className="col-span-2">Actions</div>
                      </div>
                      {parsedUrl.params.map((param, index) => (
                        <div
                          key={param.id}
                          className={`grid grid-cols-12 gap-2 p-3 border-t-2 border-indigo-100 ${
                            index % 2 === 0 ? "bg-white" : "bg-gradient-to-r from-indigo-50 to-purple-50"
                          }`}
                        >
                          <div className="col-span-4">
                            {editingParam === param.id ? (
                              <Input
                                value={param.key}
                                onChange={(e) => updateParam(param.id, e.target.value, param.value)}
                                onBlur={() => setEditingParam(null)}
                                onKeyDown={(e) => e.key === "Enter" && setEditingParam(null)}
                                className="h-8 border-2 border-blue-300 focus:border-blue-500"
                                autoFocus
                              />
                            ) : (
                              <div
                                className="font-mono text-sm py-1 px-2 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                                onClick={() => setEditingParam(param.id)}
                              >
                                {param.key || <span className="text-gray-400 italic">empty</span>}
                              </div>
                            )}
                          </div>
                          <div className="col-span-6">
                            <Input
                              value={param.value}
                              onChange={(e) => updateParam(param.id, param.key, e.target.value)}
                              className="h-8 font-mono text-sm border-2 border-gray-300 focus:border-indigo-500"
                              placeholder="Parameter value"
                            />
                          </div>
                          <div className="col-span-2 flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingParam(param.id)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteParam(param.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                                 <div className="space-y-2">
                   <Label className="text-gray-700 font-medium">🔧 Reconstructed URL</Label>
                   <div className="flex gap-2">
                     <div className="flex-1 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-md font-mono text-sm break-all border-2 border-green-200">
                       {getDecodedUrl()}
                     </div>
                     <Button 
                       variant="outline" 
                       onClick={copyReconstructedUrl}
                       className="border-green-300 hover:bg-green-50 hover:border-green-500 text-green-600"
                     >
                       <Copy className="h-4 w-4 mr-1" />
                       Copy
                     </Button>
                     <Button 
                       variant="outline" 
                       onClick={() => loadUrlToEncoder(reconstructUrl())}
                       className="border-blue-300 hover:bg-blue-50 hover:border-blue-500 text-blue-600"
                     >
                       Encode This
                     </Button>
                   </div>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50/50">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              💡 Examples
            </CardTitle>
            <CardDescription className="text-yellow-100">
              Click on any example to load it into the input field
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="encode" className="space-y-3">
                <h4 className="font-medium text-sm text-gray-600 flex items-center gap-2">
                  🔒 URLs to Encode:
                </h4>
                <div className="space-y-2">
                  {exampleUrls.encode.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => loadExample(example)}
                      className="w-full text-left p-3 rounded-md border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all text-sm font-mono hover:border-green-400 hover:shadow-md"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="decode" className="space-y-3">
                <h4 className="font-medium text-sm text-gray-600 flex items-center gap-2">
                  🔓 Encoded URLs to Decode:
                </h4>
                <div className="space-y-2">
                  {exampleUrls.decode.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => loadExample(example)}
                      className="w-full text-left p-3 rounded-md border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all text-sm font-mono break-all hover:border-orange-400 hover:shadow-md"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/50">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              📚 About URL Encoding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600 p-6">
            <p className="leading-relaxed">
              <strong className="text-indigo-600">URL Encoding</strong> (also called percent-encoding) converts characters into a format that can be
              transmitted over the Internet. Special characters are replaced with a percent sign followed by two
              hexadecimal digits.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                <h4 className="font-medium text-blue-700 mb-2">🔤 Common Encodings:</h4>
                <ul className="space-y-1 font-mono text-xs">
                  <li className="flex justify-between"><span>Space</span><span className="text-blue-600">%20</span></li>
                  <li className="flex justify-between"><span>&</span><span className="text-blue-600">%26</span></li>
                  <li className="flex justify-between"><span>?</span><span className="text-blue-600">%3F</span></li>
                  <li className="flex justify-between"><span>=</span><span className="text-blue-600">%3D</span></li>
                  <li className="flex justify-between"><span>@</span><span className="text-blue-600">%40</span></li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                <h4 className="font-medium text-green-700 mb-2">🚀 Use Cases:</h4>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2"><span className="text-green-500">•</span> Query parameters in URLs</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">•</span> Form data submission</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">•</span> API requests</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">•</span> Email links with subjects</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
