import { execSync } from 'child_process'
import * as fs from 'fs'

interface ESLintIssue {
  filePath: string
  line: number
  message: string
  ruleId: string
  severity: number
}

function parseEslintOutput(output: string): ESLintIssue[] {
  const issues: ESLintIssue[] = []
  const lines = output.split('\n')
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    const match = line.match(/^(.+?):(\d+):\d+: (.+?) \[(.+?)\]$/)
    if (match) {
      const [, filePath, lineNum, message, ruleId] = match
      issues.push({
        filePath,
        line: parseInt(lineNum, 10),
        message,
        ruleId,
        severity: message.toLowerCase().includes('error') ? 2 : 1
      })
    }
  }
  
  return issues
}

function needsUseClient(content: string): boolean {
  const clientSidePatterns = [
    'useState',
    'useEffect',
    'useRef',
    'useCallback',
    'useMemo',
    'useContext',
    'useReducer',
    'useImperativeHandle',
    'useLayoutEffect',
    'useDebugValue',
    'useId',
    'onClick',
    'onChange',
    'onSubmit',
    'addEventListener',
    'window.',
    'document.',
    'localStorage',
    'sessionStorage',
    '<form',
    '<input',
    '<button',
    'fetch(',
    'new FormData',
    'new URLSearchParams',
    'navigator.',
    'history.',
    'location.'
  ]
  
  return clientSidePatterns.some(pattern => content.includes(pattern))
}

function fixParsingErrors(content: string): string {
  // Move 'use client' to top if it exists but isn't at the top
  const hasUseClient = content.includes("'use client'") || content.includes('"use client"')
  const needsClientDirective = needsUseClient(content)
  
  // Remove existing 'use client' directive if it exists
  let newContent = content.replace(/(['"])use client\1\s*/g, '')
  
  // Add 'use client' at the top if needed
  if (hasUseClient || needsClientDirective) {
    newContent = "'use client'\n\n" + newContent
  }
  
  // Fix malformed imports
  const importLines: string[] = []
  const otherLines: string[] = []
  let currentImport = ''
  let inImportBlock = false
  
  newContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    
    // Handle import statements
    if (trimmedLine.startsWith('import ')) {
      if (currentImport) {
        importLines.push(currentImport)
        currentImport = ''
      }
      if (trimmedLine.includes('{') && !trimmedLine.includes('}')) {
        inImportBlock = true
        currentImport = line
      } else {
        // Remove semicolons from import statements
        importLines.push(line.replace(/;$/, ''))
      }
    } else if (inImportBlock) {
      if (trimmedLine.includes('}')) {
        inImportBlock = false
        currentImport += ' ' + trimmedLine
        // Remove semicolons from import statements
        importLines.push(currentImport.replace(/;$/, ''))
        currentImport = ''
      } else {
        currentImport += ' ' + trimmedLine
      }
    } else {
      // Remove semicolons from TypeScript interfaces and type definitions
      if (trimmedLine.startsWith('interface ') || trimmedLine.startsWith('type ')) {
        const lines = line.split('\n')
        otherLines.push(...lines.map(l => l.replace(/;$/, '')))
      } else {
        otherLines.push(line)
      }
    }
  })
  
  if (currentImport) {
    importLines.push(currentImport)
  }
  
  // Fix interface and type definitions
  const fixedOtherLines = otherLines.map(line => {
    if (line.trim().match(/^(interface|type)\s+\w+/)) {
      // Remove semicolons from interface and type properties
      return line.replace(/;(\s*)$/g, '$1')
    }
    return line
  })
  
  // Combine imports and other lines
  return [...importLines, '', ...fixedOtherLines].join('\n')
}

function fixUnusedVars(content: string): string {
  // Implementation for fixing unused variables
  return content
}

function fixReactHookDeps(content: string): string {
  // Implementation for fixing React Hook dependencies
  return content
}

try {
  console.log('Running ESLint...')
  const eslintOutput = execSync('npx eslint . --ext .ts,.tsx').toString()
  const issues = parseEslintOutput(eslintOutput)
  
  // Group issues by file
  const issuesByFile = new Map<string, ESLintIssue[]>()
  for (const issue of issues) {
    const fileIssues = issuesByFile.get(issue.filePath) || []
    fileIssues.push(issue)
    issuesByFile.set(issue.filePath, fileIssues)
  }
  
  // Process each file
  for (const [filePath, fileIssues] of Array.from(issuesByFile)) {
    console.log(`Processing ${filePath}...`)
    const content = fs.readFileSync(filePath, 'utf8')
    let newContent = content
    
    // Apply fixes based on issue types
    if (fileIssues.some((issue: ESLintIssue) => issue.message.includes('Parsing error'))) {
      newContent = fixParsingErrors(newContent)
    }
    
    if (fileIssues.some((issue: ESLintIssue) => issue.message.includes('is defined but never used'))) {
      newContent = fixUnusedVars(newContent)
    }
    
    if (fileIssues.some((issue: ESLintIssue) => issue.message.includes('React Hook'))) {
      newContent = fixReactHookDeps(newContent)
    }
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent)
      console.log(`Updated ${filePath}`)
    }
  }
  
  console.log('Completed processing files.')
} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}