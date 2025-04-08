import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

function fixUnusedImports(filePath: string): void {
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const importLines = lines.filter((line: string) => line.trim().startsWith('import'))
  const otherLines = lines.filter((line: string) => !line.trim().startsWith('import'))
  
  // Remove unused imports
  const usedImports = importLines.filter((line: string) => {
    const matches = line.match(/\{([^}]+)\}/)
    if (!matches) return true
    
    const imports = matches[1].split(',').map((i: string) => i.trim())
    return imports.some(imp => {
      const searchPattern = new RegExp(`\\b${imp}\\b`)
      return otherLines.some(l => searchPattern.test(l))
    })
  })
  
  const newContent = [...usedImports, '', ...otherLines].join('\n')
  writeFileSync(filePath, newContent)
}

function fixUnusedVariables(filePath: string): void {
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  
  // Remove unused function parameters
  const newLines = lines.map((line: string) => {
    const functionMatch = line.match(/function\s+\w+\s*\((.*?)\)/)
    if (functionMatch) {
      const params = functionMatch[1].split(',').map(p => p.trim())
      const usedParams = params.filter(param => {
        const paramName = param.split(':')[0].trim()
        return lines.some(l => l !== line && l.includes(paramName))
      })
      return line.replace(functionMatch[1], usedParams.join(', '))
    }
    return line
  })
  
  writeFileSync(filePath, newLines.join('\n'))
}

function processDirectory(dir: string): void {
  const files = readdirSync(dir)
  
  for (const file of files) {
    const fullPath = join(dir, file)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory()) {
      processDirectory(fullPath)
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      console.log(`Processing ${fullPath}`)
      fixUnusedImports(fullPath)
      fixUnusedVariables(fullPath)
    }
  }
}

// Run ESLint fix
try {
  execSync('npx eslint . --ext .ts,.tsx --fix', { stdio: 'inherit' })
} catch (error) {
  console.error('ESLint fix failed:', error)
}

// Process all TypeScript files
processDirectory('app')
processDirectory('components')
processDirectory('lib')

console.log('Finished processing files') 