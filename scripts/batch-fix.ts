import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

interface FileIssue {
  file: string
  issues: Array<{
    line: number
    type: string
    name: string
  }>
}

function parseEslintOutput(output: string): FileIssue[] {
  const fileIssues: FileIssue[] = []
  const lines = output.split('\n')
  
  let currentFile: FileIssue | null = null
  
  for (const line of lines) {
    // Match file path at start of error message
    const fileMatch = line.match(/^([^:]+):(\d+):(\d+)\s+warning\s+'([^']+)' is defined but never used/)
    
    if (fileMatch) {
      const [, filePath, lineNum, , name] = fileMatch
      
      if (!currentFile || currentFile.file !== filePath) {
        currentFile = {
          file: filePath,
          issues: []
        }
        fileIssues.push(currentFile)
      }
      
      currentFile.issues.push({
        line: parseInt(lineNum),
        type: 'unused',
        name
      })
    }
  }
  
  return fileIssues
}

function fixUnusedImports(filePath: string, issues: Array<{line: number, name: string}>): void {
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  
  // Group issues by line number
  const issuesByLine = issues.reduce((acc, issue) => {
    if (!acc[issue.line]) {
      acc[issue.line] = []
    }
    acc[issue.line].push(issue.name)
    return acc
  }, {} as Record<number, string[]>)
  
  // Process each line with issues
  const newLines = lines.map((line, index) => {
    const lineNumber = index + 1
    const unusedNames = issuesByLine[lineNumber]
    
    if (!unusedNames) return line
    
    // Handle import statements
    if (line.includes('import')) {
      const importMatch = line.match(/import\s*{([^}]+)}\s*from\s*['"]([^'"]+)['"]/)
      if (importMatch) {
        const [, imports, source] = importMatch
        const importNames = imports.split(',').map(i => i.trim())
        const usedImports = importNames.filter(name => !unusedNames.includes(name))
        
        if (usedImports.length === 0) {
          return '' // Remove entire import if all imports are unused
        }
        
        return `import { ${usedImports.join(', ')} } from '${source}'`
      }
    }
    
    return line
  }).filter(line => line !== '')
  
  writeFileSync(filePath, newLines.join('\n'))
}

function fixUnusedVariables(filePath: string, issues: Array<{line: number, name: string}>): void {
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  
  // Group issues by line number
  const issuesByLine = issues.reduce((acc, issue) => {
    if (!acc[issue.line]) {
      acc[issue.line] = []
    }
    acc[issue.line].push(issue.name)
    return acc
  }, {} as Record<number, string[]>)
  
  // Process each line with issues
  const newLines = lines.map((line, index) => {
    const lineNumber = index + 1
    const unusedNames = issuesByLine[lineNumber]
    
    if (!unusedNames) return line
    
    // Handle destructuring assignments
    const destructureMatch = line.match(/const\s*{([^}]+)}\s*=/)
    if (destructureMatch) {
      const [, vars] = destructureMatch
      const varNames = vars.split(',').map(v => v.trim())
      const usedVars = varNames.filter(name => !unusedNames.includes(name))
      
      if (usedVars.length === 0) {
        return '' // Remove entire line if all variables are unused
      }
      
      return line.replace(destructureMatch[1], usedVars.join(', '))
    }
    
    // Handle function parameters
    const functionMatch = line.match(/function\s+\w+\s*\((.*?)\)/)
    if (functionMatch) {
      const [, params] = functionMatch
      const paramNames = params.split(',').map(p => p.trim())
      const usedParams = paramNames.filter(param => {
        const paramName = param.split(':')[0].trim()
        return !unusedNames.includes(paramName)
      })
      
      return line.replace(functionMatch[1], usedParams.join(', '))
    }
    
    return line
  }).filter(line => line !== '')
  
  writeFileSync(filePath, newLines.join('\n'))
}

// First, save ESLint output to a file
const eslintCmd = 'npx eslint . --ext .ts,.tsx > eslint-output.txt'
console.log('Running ESLint and saving output...')
try {
  execSync(eslintCmd)
} catch (error) {
  // ESLint will exit with code 1 if there are any warnings/errors
  // We still want to process the output file
}

// Read ESLint output from file
console.log('Reading ESLint output...')
const eslintOutput = readFileSync('eslint-output.txt', 'utf8')
const fileIssues = parseEslintOutput(eslintOutput)

// Process each file
for (const { file, issues } of fileIssues) {
  console.log(`Processing ${file}...`)
  
  try {
    // Split issues into imports and variables
    const importIssues = issues.filter(i => i.type === 'unused')
    const variableIssues = issues.filter(i => i.type === 'unused')
    
    if (importIssues.length > 0) {
      fixUnusedImports(file, importIssues)
    }
    
    if (variableIssues.length > 0) {
      fixUnusedVariables(file, variableIssues)
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error)
  }
}

console.log('Finished processing all files') 