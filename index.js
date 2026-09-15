const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const SESSION_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.cline', 'data', 'sessions');

function findLastMessagesFile() {
  if (!fs.existsSync(SESSION_DIR)) return null;
  let lastFile = null;
  let lastMtime = 0;
  try {
    const dirs = fs.readdirSync(SESSION_DIR);
    for (const dir of dirs) {
      const dirPath = path.join(SESSION_DIR, dir);
      let stat;
      try { stat = fs.statSync(dirPath); } catch { continue; }
      if (!stat.isDirectory()) continue;
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.messages.json'));
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        let fileStat;
        try { fileStat = fs.statSync(filePath); } catch { continue; }
        if (fileStat.mtimeMs > lastMtime) {
          lastMtime = fileStat.mtimeMs;
          lastFile = filePath;
        }
      }
    }
  } catch {
    return null;
  }
  return lastFile;
}

function formatContent(content) {
  if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === 'object' && item !== null) {
        if (item.type === 'text') return item.text || '';
        if (item.type === 'image') return `[image: ${item.name || 'unknown'}]`;
        if (item.type === 'tool_result') return `[Tool Result]\n${typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}`;
        if (item.type === 'tool_use') return `[Tool Use: ${item.name}]\n${JSON.stringify(item.input, null, 2)}`;
        return String(item);
      }
      return String(item);
    }).join('\n');
  }
  return typeof content === 'string' ? content : String(content);
}

function getMessages(target, mode, count) {
  const messagesFile = findLastMessagesFile();
  if (!messagesFile) return { messages: [], error: 'No Cline sessions found. Start a Cline session first.' };

  let data;
  try {
    data = JSON.parse(fs.readFileSync(messagesFile, 'utf-8'));
  } catch (e) {
    return { messages: [], error: `Failed to read session: ${e.message}` };
  }

  const messages = data.messages || (Array.isArray(data) ? data : []);
  if (!messages.length) return { messages: [], error: 'No messages found in session.' };

  const filtered = messages.filter(msg => {
    if (!msg || !msg.role) return false;
    const role = msg.role.toLowerCase();
    if (target === 'assistant') return ['assistant', 'bot', 'ai'].includes(role);
    if (target === 'user') return ['user', 'human', 'prompt'].includes(role);
    return true; // pair: both
  });

  if (filtered.length === 0) return { messages: [], error: `No ${target} messages found.` };

  let selected;
  if (mode === 'all') {
    selected = filtered;
  } else {
    const n = parseInt(count, 10) || 1;
    selected = n > 0 ? filtered.slice(-Math.min(n, 50)) : [];
  }

  return { messages: selected, error: null };
}

function buildMarkdown(messages, target) {
  if (!messages.length) return '';
  const parts = messages.map(msg => {
    const content = formatContent(msg.content || '');
    const role = (msg.role || '').toLowerCase();
    if (target === 'pair') {
      if (['user', 'human', 'prompt'].includes(role)) return `**You:**\n${content}`;
      if (['assistant', 'bot', 'ai'].includes(role)) return `**Assistant:**\n${content}`;
    }
    return content;
  });
  return parts.filter(Boolean).join('\n\n');
}

function copyToClipboard(text) {
  return new Promise((resolve) => {
    // Try pbcopy (macOS)
    const proc = spawn('pbcopy', { stdio: ['pipe', 'ignore', 'ignore'] });
    proc.on('error', () => {
      // Try xclip (Linux)
      const proc2 = spawn('xclip', ['-selection', 'clipboard'], { stdio: ['pipe', 'ignore', 'ignore'] });
      proc2.on('error', () => resolve(false));
      proc2.on('exit', (code) => resolve(code === 0));
      proc2.write(text, 'utf-8');
      proc2.end();
    });
    proc.write(text, 'utf-8');
    proc.end();
  });
}

function parseArgs(text) {
  // text is like "copy-last user 3" or "copy-last pair all" or just "copy-last"
  const parts = text.trim().split(/\s+/).filter(Boolean);
  // Remove the command prefix if present
  const args = parts[0] === '/copy-last' ? parts.slice(1) : parts;

  let target = 'assistant';
  let count = '1';
  let mode = 'last';

  if (args.length === 0) return { target, count, mode };

  const first = args[0].toLowerCase();

  const validTargets = ['assistant', 'assist', 'bot', 'ai', 'user', 'human', 'prompt', 'me', 'pair', 'exchange', 'both', 'all'];
  const isTarget = validTargets.includes(first);
  const isCount = /^\d+$/.test(first);
  const isAll = first === 'all';

  if (isTarget) {
    target = ['assist', 'bot', 'ai', 'me'].includes(first) ? 'assistant' : first;
    if (args.length >= 2) {
      const second = args[1].toLowerCase();
      if (second === 'all') {
        mode = 'all';
      } else if (/^\d+$/.test(second)) {
        count = second;
        mode = 'count';
      }
    }
  } else if (isCount) {
    count = first;
    mode = 'count';
  } else if (isAll) {
    mode = 'all';
  } else if (args.length >= 2) {
    const second = args[1].toLowerCase();
    if (validTargets.includes(second)) {
      target = second;
    } else if (/^\d+$/.test(second)) {
      count = second;
      mode = 'count';
    } else if (second === 'all') {
      mode = 'all';
    }
  }

  return { target, count, mode };
}

async function executeCopy(text) {
  const { target, count, mode } = parseArgs(text || '');
  const { messages, error } = getMessages(target, mode, count);
  if (error || !messages.length) {
    return {
      content: error || `No messages found for target '${target}'.`,
      title: 'Copy Last: Error',
    };
  }

  const md = buildMarkdown(messages, target);
  const copied = await copyToClipboard(md);

  return {
    content: copied
      ? `📋 Copied ${messages.length} ${target} message(s) to clipboard (${md.length} chars).`
      : `📋 Would copy ${messages.length} ${target} message(s) to clipboard (${md.length} chars).\n\n${md}`,
    title: `Copy Last: ${target} ${mode === 'count' ? count + 'msgs' : mode === 'all' ? 'all' : 'last'}`,
  };
}

const plugin = {
  name: 'cline-copy-last',
  manifest: {
    capabilities: ['hooks', 'commands'],
  },
  async setup(api, ctx) {
    // Try to register as a slash command if API supports it
    try {
      if (api.registerCommand) {
        api.registerCommand({
          name: 'copy-last',
          description: 'Copy the last Cline session message to clipboard as markdown',
          handler: async (args) => {
            const text = args?.prompt || args?.text || args?.message || '';
            const result = await executeCopy(text);
            return result;
          },
        });
        ctx?.logger?.log?.('[cline-copy-last] Command registered via api.registerCommand');
      }
    } catch (e) {
      ctx?.logger?.log?.(`[cline-copy-last] registerCommand not available: ${e.message}`);
    }
  },
  hooks: {
    async beforeModel(context) {
    try {
      const prompt = context?.prompt ?? context?.input ?? context?.messages;
      if (!prompt) return;

      let text = '';
      if (typeof prompt === 'string') {
        text = prompt;
      } else if (Array.isArray(prompt)) {
        const last = prompt[prompt.length - 1];
        if (last && typeof last === 'object') {
          text = last.content || '';
        }
      } else if (prompt && typeof prompt === 'object') {
        text = prompt.content || prompt.message || '';
      }

      if (typeof text !== 'string' || !text.startsWith('/copy-last')) return;

      const result = await executeCopy(text);

      return {
        messages: [{
          role: 'assistant',
          content: result.content,
        }],
      };
    } catch (e) {
      return {
        messages: [{
          role: 'assistant',
          content: `[cline-copy-last] Error: ${e.message}`,
        }],
      };
    }
  },
  },
};

module.exports = plugin;
module.exports.default = plugin;
module.exports.agentPlugin = plugin;
