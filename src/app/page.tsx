'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Upload, Search, FileText, Sparkles, Zap, Database, History, BarChart3, Settings, Moon, Sun, Monitor } from 'lucide-react'

export default function Home() {
  const [text, setText] = useState('')
  const [model, setModel] = useState('gpt-4')
  const [technique, setTechnique] = useState('general')
  const [tokenCount, setTokenCount] = useState<number | null>(null)
  const [optimizedText, setOptimizedText] = useState('')
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tokenHistory, setTokenHistory] = useState<any[]>([])
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([])
  const [tokenStats, setTokenStats] = useState<any>(null)
  const [optimizationStats, setOptimizationStats] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  
  // Document upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentQuery, setDocumentQuery] = useState('')
  const [documentAnalysis, setDocumentAnalysis] = useState<any>(null)
  const [documentLoading, setDocumentLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadHistory()
    loadSettings()
  }, [])

  const loadHistory = async () => {
    try {
      const [tokenRes, optRes] = await Promise.all([
        fetch('/api/optimizer/count'),
        fetch('/api/optimizer/optimize')
      ])
      
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json()
        setTokenHistory(tokenData.history || [])
        setTokenStats(tokenData.stats)
      }
      
      if (optRes.ok) {
        const optData = await optRes.json()
        setOptimizationHistory(optData.optimizations || [])
        setOptimizationStats(optData.stats)
      }
    } catch (err) {
      console.error('Failed to load history:', err)
    }
  }

  const loadSettings = () => {
    const savedKey = localStorage.getItem('openai_api_key')
    if (savedKey) setApiKey(savedKey)
  }

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey)
    setError('')
    alert('API Key saved successfully!')
  }

  const handleCountTokens = async () => {
    if (!text.trim()) {
      setError('Please enter some text')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/optimizer/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to count tokens')
      }
      
      setTokenCount(data.tokenCount)
      await loadHistory()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOptimize = async () => {
    if (!text.trim()) {
      setError('Please enter some text')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/optimizer/optimize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-api-key': apiKey } : {})
        },
        body: JSON.stringify({ text, model, technique })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to optimize text')
      }
      
      setOptimizedText(data.optimizedText)
      setOptimizationResult(data)
      await loadHistory()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setText(e.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const handleDocumentAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload a document first')
      return
    }
    
    if (!documentQuery.trim()) {
      setError('Please enter a query for the document')
      return
    }
    
    setDocumentLoading(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('query', documentQuery)
      
      const res = await fetch('/api/document/analyze', {
        method: 'POST',
        headers: apiKey ? { 'x-api-key': apiKey } : {},
        body: formData
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze document')
      }
      
      setDocumentAnalysis(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDocumentLoading(false)
    }
  }

  const filteredTokenHistory = tokenHistory.filter(item =>
    item.originalText.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredOptimizationHistory = optimizationHistory.filter(item =>
    item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.optimizedText.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Token Optimizer</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Count, optimize, and manage your AI token usage efficiently
            </p>
          </div>
          <ThemeSwitcher />
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="optimizer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="optimizer" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Optimizer
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="optimizer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Token Counter & Optimizer
                </CardTitle>
                <CardDescription>
                  Count tokens in your text and optimize it to reduce costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="text">Enter your text</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.json,.js,.ts,.py,.html,.css"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  <Textarea
                    id="text"
                    placeholder="Paste your text here or upload a file..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <FileText className="h-4 w-4" />
                      {selectedFile.name}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger id="model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-4-32k">GPT-4 32K</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technique">Optimization Technique</Label>
                    <Select value={technique} onValueChange={setTechnique}>
                      <SelectTrigger id="technique">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="compression">Compression</SelectItem>
                        <SelectItem value="summarization">Summarization</SelectItem>
                        <SelectItem value="code-optimization">Code Optimization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleCountTokens} 
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                  >
                    {loading ? 'Counting...' : 'Count Tokens'}
                  </Button>
                  <Button 
                    onClick={handleOptimize} 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Optimizing...' : 'Optimize Text'}
                  </Button>
                </div>

                {tokenCount !== null && (
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <div className="text-2xl font-bold">{tokenCount.toLocaleString()}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">tokens ({model})</div>
                  </div>
                )}

                {optimizedText && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="space-y-2">
                      <Label>Optimized Text</Label>
                      <Textarea
                        value={optimizedText}
                        readOnly
                        rows={8}
                        className="resize-none bg-zinc-50 dark:bg-zinc-900"
                      />
                    </div>

                    {optimizationResult && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Original Tokens</div>
                          <div className="text-xl font-bold">{optimizationResult.originalTokens}</div>
                        </div>
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Optimized Tokens</div>
                          <div className="text-xl font-bold">{optimizationResult.optimizedTokens}</div>
                        </div>
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Saved</div>
                          <div className="text-xl font-bold text-green-600">
                            {optimizationResult.tokenReduction} ({optimizationResult.reductionPercentage.toFixed(1)}%)
                          </div>
                        </div>
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Cost</div>
                          <div className="text-xl font-bold">
                            ${optimizationResult.cost?.totalCost?.toFixed(4) || '0.0000'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="document" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Analysis
                </CardTitle>
                <CardDescription>
                  Upload documents and analyze them with AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document">Upload Document</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.json,.js,.ts,.py,.html,.css,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{selectedFile.name}</span>
                      <Badge variant="secondary">{(selectedFile.size / 1024).toFixed(2)} KB</Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="query">Search Query</Label>
                  <div className="flex gap-2">
                    <Input
                      id="query"
                      placeholder="What would you like to know about this document?"
                      value={documentQuery}
                      onChange={(e) => setDocumentQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleDocumentAnalyze}
                      disabled={documentLoading || !selectedFile}
                    >
                      {documentLoading ? 'Analyzing...' : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {documentAnalysis && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="space-y-2">
                      <Label>Analysis Result</Label>
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg whitespace-pre-wrap">
                        {documentAnalysis.analysis}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">Document Tokens</div>
                        <div className="text-xl font-bold">{documentAnalysis.documentStats?.totalTokens?.toLocaleString()}</div>
                      </div>
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">Word Count</div>
                        <div className="text-xl font-bold">{documentAnalysis.documentStats?.wordCount?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  History
                </CardTitle>
                <CardDescription>
                  Search through your past token counts and optimizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      placeholder="Search by text content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="tokens">
                  <TabsList>
                    <TabsTrigger value="tokens">Token History</TabsTrigger>
                    <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tokens" className="space-y-4">
                    <ScrollArea className="h-[500px] rounded-md border">
                      <div className="p-4 space-y-3">
                        {filteredTokenHistory.length === 0 ? (
                          <div className="text-center text-zinc-500 py-8">
                            No token history found
                          </div>
                        ) : (
                          filteredTokenHistory.map((item) => (
                            <Card key={item.id}>
                              <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-sm line-clamp-2">{item.originalText}</p>
                                  </div>
                                  <Badge variant="secondary">{item.tokenCount} tokens</Badge>
                                </div>
                                <div className="text-xs text-zinc-500">
                                  {new Date(item.savedAt).toLocaleString()}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="optimizations" className="space-y-4">
                    <ScrollArea className="h-[500px] rounded-md border">
                      <div className="p-4 space-y-3">
                        {filteredOptimizationHistory.length === 0 ? (
                          <div className="text-center text-zinc-500 py-8">
                            No optimization history found
                          </div>
                        ) : (
                          filteredOptimizationHistory.map((item) => (
                            <Card key={item.id}>
                              <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex-1 space-y-2">
                                    <p className="text-sm font-medium">Original:</p>
                                    <p className="text-sm line-clamp-2 text-zinc-600">{item.originalText}</p>
                                    <p className="text-sm font-medium">Optimized:</p>
                                    <p className="text-sm line-clamp-2 text-zinc-600">{item.optimizedText}</p>
                                  </div>
                                  <div className="text-right space-y-1">
                                    <Badge variant="secondary">{item.technique}</Badge>
                                    <div className="text-sm">
                                      <span className="text-zinc-500">{item.originalTokens}</span>
                                      {' → '}
                                      <span className="text-green-600">{item.optimizedTokens}</span>
                                    </div>
                                    <div className="text-xs text-green-600 font-medium">
                                      -{item.tokenReduction} ({item.reductionPercentage.toFixed(1)}%)
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-zinc-500">
                                  {new Date(item.createdAt).toLocaleString()} • {item.model}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Token Statistics
                  </CardTitle>
                  <CardDescription>Overview of your token usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tokenStats ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Records</div>
                          <div className="text-2xl font-bold">{tokenStats.totalRecords}</div>
                        </div>
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Tokens</div>
                          <div className="text-2xl font-bold">{tokenStats.totalTokens.toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Average Tokens</div>
                          <div className="text-2xl font-bold">{tokenStats.averageTokens.toFixed(0)}</div>
                        </div>
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Max Tokens</div>
                          <div className="text-2xl font-bold">{tokenStats.maxTokens.toLocaleString()}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-zinc-500 py-8">
                      No statistics available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Optimization Statistics
                  </CardTitle>
                  <CardDescription>Overview of your optimization results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {optimizationStats ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Optimizations</div>
                          <div className="text-2xl font-bold">{optimizationStats.totalOptimizations}</div>
                        </div>
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Tokens Saved</div>
                          <div className="text-2xl font-bold text-green-600">
                            {optimizationStats.totalTokensSaved.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Avg Reduction</div>
                          <div className="text-2xl font-bold">
                            {optimizationStats.averageReduction.toFixed(1)}%
                          </div>
                        </div>
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">Best Reduction</div>
                          <div className="text-2xl font-bold text-green-600">
                            {optimizationStats.bestReduction.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-zinc-500 py-8">
                      No statistics available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </CardTitle>
                <CardDescription>
                  Configure your API keys and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenAI API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-zinc-500">
                    Optional: save a personal key in this browser. It is sent to the app when used; otherwise the server uses OPENAI_API_KEY.
                  </p>
                </div>

                <Button onClick={saveApiKey} className="w-full">Save API Key</Button>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">Current Token Summary</h3>
                  {tokenStats && (
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Tokens Saved:</span>
                        <span className="font-bold text-green-600">
                          {optimizationStats?.totalTokensSaved?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Records:</span>
                        <span className="font-bold">{tokenStats.totalRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Average Reduction:</span>
                        <span className="font-bold">
                          {optimizationStats?.averageReduction?.toFixed(1) || 0}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
