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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">URL Encoder & Decoder</h1>
        <p className="text-muted-foreground">Encode and decode URLs and text for web-safe transmission</p>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">Encode</TabsTrigger>
              <TabsTrigger value="decode">Decode</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">{activeTab === "encode" ? "Text to Encode" : "Text to Decode"}</Label>
            <Textarea
              id="input"
              placeholder={
                activeTab === "encode" ? "Enter URL or text to encode..." : "Enter encoded text to decode..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleProcess} className="flex-1 min-w-[120px]">
              {activeTab === "encode" ? "Encode" : "Decode"}
            </Button>
            <Button variant="outline" onClick={handleSwap} size="icon" disabled={!output}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleClear} size="icon">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="output">Result</Label>
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output} className="h-8 px-2">
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <Textarea
              id="output"
              value={output}
              readOnly
              rows={4}
              className="resize-none bg-muted"
              placeholder="Result will appear here..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Query Parameter Parser</CardTitle>
          <CardDescription>Parse URLs to view and edit individual query parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url-parse">URL to Parse</Label>
            <div className="flex gap-2">
              <Input
                id="url-parse"
                placeholder="https://example.com/search?q=hello&category=web&page=1"
                value={urlToParse}
                onChange={(e) => setUrlToParse(e.target.value)}
                className="flex-1"
              />
              <Button onClick={parseUrl}>Parse</Button>
            </div>
          </div>

          {parsedUrl && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Base URL</Label>
                <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">{parsedUrl.baseUrl}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Query Parameters ({parsedUrl.params.length})</Label>
                  <Button variant="outline" size="sm" onClick={addParam}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Parameter
                  </Button>
                </div>

                {parsedUrl.params.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No query parameters found. Click "Add Parameter" to add one.
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                      <div className="col-span-4">Parameter</div>
                      <div className="col-span-6">Value</div>
                      <div className="col-span-2">Actions</div>
                    </div>
                    {parsedUrl.params.map((param, index) => (
                      <div
                        key={param.id}
                        className={`grid grid-cols-12 gap-2 p-3 border-t ${index % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
                      >
                        <div className="col-span-4">
                          {editingParam === param.id ? (
                            <Input
                              value={param.key}
                              onChange={(e) => updateParam(param.id, e.target.value, param.value)}
                              onBlur={() => setEditingParam(null)}
                              onKeyDown={(e) => e.key === "Enter" && setEditingParam(null)}
                              className="h-8"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="font-mono text-sm py-1 px-2 rounded cursor-pointer hover:bg-accent"
                              onClick={() => setEditingParam(param.id)}
                            >
                              {param.key || <span className="text-muted-foreground italic">empty</span>}
                            </div>
                          )}
                        </div>
                        <div className="col-span-6">
                          <Input
                            value={param.value}
                            onChange={(e) => updateParam(param.id, param.key, e.target.value)}
                            className="h-8 font-mono text-sm"
                            placeholder="Parameter value"
                          />
                        </div>
                        <div className="col-span-2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingParam(param.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteParam(param.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
                <Label>Reconstructed URL</Label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm break-all">{reconstructUrl()}</div>
                  <Button variant="outline" onClick={copyReconstructedUrl}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={() => loadUrlToEncoder(reconstructUrl())}>
                    Encode This
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Examples</CardTitle>
          <CardDescription>Click on any example to load it into the input field</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="encode" className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">URLs to Encode:</h4>
              <div className="space-y-2">
                {exampleUrls.encode.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => loadExample(example)}
                    className="w-full text-left p-3 rounded-md border bg-card hover:bg-accent transition-colors text-sm font-mono"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="decode" className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Encoded URLs to Decode:</h4>
              <div className="space-y-2">
                {exampleUrls.decode.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => loadExample(example)}
                    className="w-full text-left p-3 rounded-md border bg-card hover:bg-accent transition-colors text-sm font-mono break-all"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About URL Encoding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>URL Encoding</strong> (also called percent-encoding) converts characters into a format that can be
            transmitted over the Internet. Special characters are replaced with a percent sign followed by two
            hexadecimal digits.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Common Encodings:</h4>
              <ul className="space-y-1 font-mono text-xs">
                <li>Space → %20</li>
                <li>& → %26</li>
                <li>? → %3F</li>
                <li>= → %3D</li>
                <li>@ → %40</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Use Cases:</h4>
              <ul className="space-y-1">
                <li>• Query parameters in URLs</li>
                <li>• Form data submission</li>
                <li>• API requests</li>
                <li>• Email links with subjects</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
