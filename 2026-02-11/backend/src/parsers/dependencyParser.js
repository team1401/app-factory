/**
 * Parse dependency files into a normalized format
 */

/**
 * Parse package.json (npm)
 * @param {object} parsed
 * @returns {Array} dependencies
 */
function parseNpm(parsed) {
  const deps = [];
  const allDeps = {
    ...parsed.dependencies,
    ...parsed.devDependencies
  };

  for (const [name, version] of Object.entries(allDeps)) {
    // Clean version string (remove ^, ~, >=, etc.)
    const cleanVersion = version.replace(/^[\^~>=<]+/, '').split(' ')[0];
    deps.push({
      name,
      version: cleanVersion,
      ecosystem: 'npm'
    });
  }

  return deps;
}

/**
 * Parse requirements.txt (pip)
 * @param {string} content
 * @returns {Array} dependencies
 */
function parsePip(content) {
  const deps = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Parse package==version or package>=version
    const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*[=><~!]+\s*([0-9.]+)/);
    if (match) {
      deps.push({
        name: match[1],
        version: match[2],
        ecosystem: 'PyPI'
      });
    } else {
      // Package without version
      const pkgMatch = trimmed.match(/^([a-zA-Z0-9_-]+)/);
      if (pkgMatch) {
        deps.push({
          name: pkgMatch[1],
          version: 'latest',
          ecosystem: 'PyPI'
        });
      }
    }
  }

  return deps;
}

/**
 * Parse go.mod (Go)
 * @param {string} content
 * @returns {Array} dependencies
 */
function parseGo(content) {
  const deps = [];
  const lines = content.split('\n');
  let inRequire = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'require (') {
      inRequire = true;
      continue;
    }

    if (trimmed === ')') {
      inRequire = false;
      continue;
    }

    // Single-line require or inside require block
    if (trimmed.startsWith('require ') || inRequire) {
      const match = trimmed.match(/([^\s]+)\s+v([0-9.]+(?:-[a-zA-Z0-9.]+)?)/);
      if (match) {
        deps.push({
          name: match[1],
          version: match[2],
          ecosystem: 'Go'
        });
      }
    }
  }

  return deps;
}

/**
 * Parse Gemfile (Ruby)
 * @param {string} content
 * @returns {Array} dependencies
 */
function parseGemfile(content) {
  const deps = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Parse gem 'name', '~> version'
    const match = trimmed.match(/gem\s+['"]([^'"]+)['"]\s*,\s*['"]([~>=<\s0-9.]+)['"]/);
    if (match) {
      const cleanVersion = match[2].replace(/^[~>=<\s]+/, '').trim();
      deps.push({
        name: match[1],
        version: cleanVersion,
        ecosystem: 'RubyGems'
      });
    } else {
      // Gem without version
      const simpleMatch = trimmed.match(/gem\s+['"]([^'"]+)['"]/);
      if (simpleMatch) {
        deps.push({
          name: simpleMatch[1],
          version: 'latest',
          ecosystem: 'RubyGems'
        });
      }
    }
  }

  return deps;
}

/**
 * Parse dependency file based on filename
 * @param {string} content - File content
 * @param {string} fileName - File name
 * @returns {Array} dependencies
 */
function parse(content, fileName) {
  try {
    const lowerName = fileName.toLowerCase();

    // npm (package.json)
    if (lowerName === 'package.json') {
      const parsed = JSON.parse(content);
      return parseNpm(parsed);
    }

    // pip (requirements.txt)
    if (lowerName.includes('requirements') && lowerName.endsWith('.txt')) {
      return parsePip(content);
    }

    // Go (go.mod)
    if (lowerName === 'go.mod') {
      return parseGo(content);
    }

    // Ruby (Gemfile)
    if (lowerName === 'gemfile') {
      return parseGemfile(content);
    }

    throw new Error(`Unsupported file format: ${fileName}`);
  } catch (error) {
    throw new Error(`Failed to parse ${fileName}: ${error.message}`);
  }
}

module.exports = {
  parse,
  parseNpm,
  parsePip,
  parseGo,
  parseGemfile
};
