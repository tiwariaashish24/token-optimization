'use client'

import { useState, useEffect } from 'react'
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
    
    if (!apiKey) {
      setError('Please set your OpenAI API key in the Settings tab')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/optimizer/optimize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey
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
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Token Optimizer</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Count, optimize, and manage your AI token usage efficiently
          </p>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="optimizer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="optimizer">Optimizer</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="optimizer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Token Counter & Optimizer</CardTitle>
                <CardDescription>
                  Count tokens in your text and optimize it to reduce costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text">Enter your text</Label>
                  <Textarea
                    id="text"
                    placeholder="Paste your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
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
                  >
                    {loading ? 'Counting...' : 'Count Tokens'}
                  </Button>
                  <Button 
                    onClick={handleOptimize} 
                    disabled={loading}
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

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
                <CardDescription>
                  Search through your past token counts and optimizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by text content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                  <CardTitle>Token Statistics</CardTitle>
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
                  <CardTitle>Optimization Statistics</CardTitle>
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
                <CardTitle>Settings</CardTitle>
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
                    Your API key is stored locally in your browser and never sent to our servers.
                  </p>
                </div>

                <Button onClick={saveApiKey}>Save API Key</Button>

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
