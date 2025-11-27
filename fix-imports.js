const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define replacements
const replacements = [
  // Location imports
  {
    pattern: /from ['"]\.\.\/data\/mock-locations['"]/g,
    replacement: "from '@/lib/mock-data'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/data\/mock-locations['"]/g,
    replacement: "from '@/lib/mock-data'"
  },
  // Recipe imports
  {
    pattern: /from ['"]\.\.\/data\/mock-recipes['"]/g,
    replacement: "from '@/lib/mock-data'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/data\/mock-recipes['"]/g,
    replacement: "from '@/lib/mock-data'"
  },
  {
    pattern: /from ["']@\/app\/\(main\)\/operational-planning\/recipe-management\/recipes\/data\/mock-recipes["']/g,
    replacement: "from '@/lib/mock-data'"
  },
  // Fix combined imports  - split Location type
  {
    pattern: /import \{ mockLocations, Location \} from ['"]@\/lib\/mock-data['"]/g,
    replacement: "import { Location } from '@/lib/types'\nimport { mockLocations } from '@/lib/mock-data'"
  },
  {
    pattern: /import \{ Location \} from ['"]@\/lib\/mock-data['"]/g,
    replacement: "import { Location } from '@/lib/types'"
  },
  // Fix combined Recipe imports - split types
  {
    pattern: /import \{ Recipe, Ingredient, PreparationStep, mockRecipes \} from ['"]@\/lib\/mock-data['"]/g,
    replacement: "import { Recipe, Ingredient, PreparationStep } from '@/lib/types'\nimport { mockRecipes } from '@/lib/mock-data'"
  },
  {
    pattern: /import \{ Recipe, mockRecipes \} from ['"]@\/lib\/mock-data['"]/g,
    replacement: "import { Recipe } from '@/lib/types'\nimport { mockRecipes } from '@/lib/mock-data'"
  },
  {
    pattern: /import \{ Recipe, mockIngredients, mockBaseRecipes \} from ['"]@\/lib\/mock-data['"]/g,
    replacement: "import { Recipe } from '@/lib/types'\nimport { mockIngredients, mockBaseRecipes } from '@/lib/mock-data'"
  },
  {
    pattern: /import \{ Recipe \} from ['"]@\/lib\/mock-data['"]/g,
    replacement: "import { Recipe } from '@/lib/types'"
  },
  {
    pattern: /import \{ Recipe, RecipeYieldVariant \} from ['"]@\/lib\/mock-data['"]/g,
    replacement: "import { Recipe, RecipeYieldVariant } from '@/lib/types'"
  }
];

// Workflow-specific replacements
const workflowReplacements = [
  {
    pattern: /from ['"]\.\/workflow-configuration\/data\/mockData['"]/g,
    replacement: "from '@/lib/mock-data'"
  },
  {
    pattern: /from ['"]\.\.\/data\/mockData['"]/g,
    replacement: "from '@/lib/mock-data'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/role-assignment\/data\/mockData['"]/g,
    replacement: "from '@/lib/mock-data'"
  },
  {
    pattern: /from ['"]\.\/data\/mockData['"]/g,
    replacement: "from '@/lib/mock-data'"
  }
];

// Merge all replacements
const allReplacements = [...replacements, ...workflowReplacements];

// Find all files in the affected directories
const directories = [
  'app/(main)/system-administration/location-management',
  'app/(main)/operational-planning/recipe-management/recipes',
  'app/(main)/system-administration/system-integrations/pos/mapping/recipes',
  'app/(main)/system-administration/workflow'
];

let filesFixed = 0;

directories.forEach(dir => {
  const files = glob.sync(`${dir}/**/*.{ts,tsx}`, { nodir: true });

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    allReplacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      filesFixed++;
      console.log(`Fixed: ${file}`);
    }
  });
});

console.log(`\nTotal files fixed: ${filesFixed}`);
