import { useState } from 'react';
import {
  Terminal,
  Copy,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Shield,
  Code,
  ArrowRight
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

const CLICommands = () => {
  const [expandedCommand, setExpandedCommand] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const commands = [
    {
      id: 'version',
      name: 'envsync --version',
      description: 'Display the current version of EnvSync CLI',
      syntax: 'envsync --version',
      options: 'None',
      examples: [
        {
          command: 'envsync --version',
          output: '1.0.0',
        },
      ],
      useCases: [
        'Check installed CLI version',
        'Verify CLI installation',
        'Troubleshooting',
      ],
    },
    {
      id: 'help',
      name: 'envsync --help',
      description: 'Display help information for all available commands',
      syntax: 'envsync --help',
      options: 'None',
      examples: [
        {
          command: 'envsync --help',
          output: `Usage: envsync [options] [command]

Runtime-only secret injection CLI

Options:
  -V, --version      output the version number
  -h, --help         display help for command

Commands:
  login              Login to EnvSync
  whoami             Show current user
  logout             Logout
  run [options]      Run command with runtime secrets
  help [command]     display help for command`,
        },
      ],
      useCases: ['Learn available commands', 'Quick reference', 'First-time users'],
    },
    {
      id: 'login',
      name: 'envsync login',
      description:
        'Authenticate with the EnvSync server and save JWT token locally',
      syntax: 'envsync login',
      options: 'None (interactive prompts)',
      prompts: [
        { label: 'Email', description: 'Your registered email address' },
        { label: 'Password', description: 'Your account password' },
      ],
      examples: [
        {
          command: 'envsync login',
          interaction: `Email: user@example.com
Password: ******
✓ Logged in successfully`,
        },
      ],
      useCases: [
        'First-time setup',
        'After logout',
        'Token expired',
        'Switching accounts',
      ],
      notes: [
        'Token is stored locally in JSON format',
        'Token expires based on server configuration (default: 7 days)',
        'Password is masked with ******',
      ],
    },
    {
      id: 'whoami',
      name: 'envsync whoami',
      description: 'Display information about the currently logged-in user',
      syntax: 'envsync whoami',
      options: 'None',
      examples: [
        {
          command: 'envsync whoami',
          output: 'Logged in as: user@example.com (role: admin)',
        },
        {
          command: 'envsync whoami',
          output: 'Not logged in',
          description: 'When not logged in',
        },
      ],
      useCases: [
        'Verify login status',
        'Check current user role',
        'Confirm correct account',
        'Debugging authentication issues',
      ],
      roles: [
        { role: 'admin', description: 'Full access to all features' },
        {
          role: 'developer',
          description: 'Can use runtime injection, cannot view secrets',
        },
        { role: 'viewer', description: 'Read-only access' },
      ],
    },
    {
      id: 'logout',
      name: 'envsync logout',
      description:
        'Clear the stored authentication token and logout from EnvSync',
      syntax: 'envsync logout',
      options: 'None',
      examples: [
        {
          command: 'envsync logout',
          output: '✓ Logged out successfully',
        },
      ],
      useCases: [
        'Switching accounts',
        'Security best practice (logout when done)',
        'Clearing expired tokens',
        'Troubleshooting authentication',
      ],
      notes: [
        'Does not invalidate token on server (stateless JWT)',
        'Can logout multiple times without error',
        'Must login again to use protected commands',
      ],
    },
    {
      id: 'run',
      name: 'envsync run',
      description:
        'Run a command with environment variables injected from EnvSync at runtime. Secrets are decrypted in memory and never written to disk.',
      syntax:
        'envsync run --project <PROJECT_ID> --env <ENVIRONMENT> <COMMAND> [ARGS...]',
      requiredOptions: [
        {
          name: '--project <PROJECT_ID>',
          description: 'The MongoDB ObjectId of your project',
          format: '24-character hexadecimal string',
          example: '<YOUR_PROJECT_ID>',
        },
        {
          name: '--env <ENVIRONMENT>',
          description: 'The environment to load secrets from',
          validValues: ['dev', 'staging', 'prod'],
        },
      ],
      examples: [
        {
          command:
            'envsync run --project <YOUR_PROJECT_ID> --env dev node server.js',
          description: 'Run Node.js Application',
        },
        {
          command:
            'envsync run --project <YOUR_PROJECT_ID> --env prod npm start',
          description: 'Run npm Script',
        },
        {
          command:
            'envsync run --project <YOUR_PROJECT_ID> --env dev npm run dev',
          description: 'Run with npm Development Script',
        },
        {
          command:
            'envsync run --project <YOUR_PROJECT_ID> --env prod python app.py',
          description: 'Run Python Application',
        },
      ],
      output: `⚠️  SECURITY NOTICE:
   Secrets are being injected into your application.
   Logging or exposing these secrets is against security policy.
   All secret access is audited and monitored.

✓ Injected 4 secret(s): DATABASE_URL, API_KEY, JWT_SECRET, PORT

[Your application output follows...]`,
      useCases: [
        'Local Development',
        'Staging Testing',
        'Production Deployment',
        'Multiple Services',
        'CI/CD Pipelines',
      ],
      securityFeatures: [
        'Secrets decrypted in memory only',
        'Never written to disk',
        'Automatic garbage collection',
        'Complete audit trail on server',
        'Security warning displayed',
        'Secret keys shown, values hidden',
      ],
      accessControl: [
        { role: 'Admin', canUse: true },
        { role: 'Developer', canUse: true },
        { role: 'Viewer', canUse: false },
      ],
      importantNotes: [
        'Secrets are accessible in the application',
        'Server must be running',
        'Must be logged in',
        'Project and secrets must exist',
      ],
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,1)]" />
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Secure Shell / Interface</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">CLI Protocols</h1>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Code className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] uppercase font-black tracking-widest text-white/60 font-mono">ENVSYNC_V1.0.0</span>
          </div>
        </div>

        {/* Commands List */}
        <div className="space-y-4">
          {commands.map((command) => {
            const isExpanded = expandedCommand === command.id;
            return (
              <div
                key={command.id}
                className={`hero-glass-card overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-purple-500/30' : ''}`}
              >
                {/* Command Header */}
                <button
                  onClick={() => setExpandedCommand(isExpanded ? null : command.id)}
                  className={`w-full flex items-center justify-between p-6 text-left transition-all ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center space-x-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isExpanded ? 'bg-purple-500/20 border-purple-500/30 shadow-lg shadow-purple-500/20' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                      <Terminal className={`w-6 h-6 ${isExpanded ? 'text-purple-400' : 'text-white/40'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-tight font-mono">
                        {command.name}
                      </h3>
                      <p className="text-xs font-medium text-white/40 mt-1 uppercase tracking-wider">
                        {command.description}
                      </p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-white/10 text-white' : 'text-white/30'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-8 space-y-10 border-t border-white/5 bg-black/20">
                    {/* Syntax Block */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/60">Operation Syntax</h4>
                      </div>
                      <div className="p-6 rounded-2xl bg-black/60 border border-white/10 font-mono text-sm relative group">
                        <div className="flex items-center justify-between">
                          <code className="text-cyan-400 font-bold whitespace-nowrap overflow-x-auto custom-scrollbar pr-10">{command.syntax}</code>
                          <button
                            onClick={() => copyToClipboard(command.syntax, `syntax-${command.id}`)}
                            className="absolute right-6 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white border border-white/5"
                          >
                            {copiedText === `syntax-${command.id}` ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content Section Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Left Column: Requirements & Prompts */}
                      <div className="space-y-8">
                        {command.requiredOptions && (
                          <div className="space-y-4">
                            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/60 flex items-center space-x-2">
                              <Zap className="w-4 h-4 text-purple-400" />
                              <span>Required Modifiers</span>
                            </h4>
                            <div className="space-y-3">
                              {command.requiredOptions.map((option, idx) => (
                                <div
                                  key={idx}
                                  className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 hover:border-purple-500/20 transition-all"
                                >
                                  <code className="text-xs font-bold text-purple-400">
                                    {option.name}
                                  </code>
                                  <p className="text-xs font-medium text-white/60">
                                    {option.description}
                                  </p>
                                  {option.format && (
                                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest pt-2">
                                      Format: {option.format}
                                    </p>
                                  )}
                                  {option.validValues && (
                                    <div className="flex items-center space-x-2 pt-1">
                                      {option.validValues.map((v) => (
                                        <code key={v} className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-cyan-400/70 border border-white/5">
                                          {v}
                                        </code>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {command.prompts && (
                          <div className="space-y-4">
                            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/60">Interactive Queries</h4>
                            <div className="space-y-2">
                              {command.prompts.map((prompt, idx) => (
                                <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                  <span className="text-[10px] font-black text-cyan-500">{idx + 1}</span>
                                  <span className="text-xs font-bold text-white/80">{prompt.label}:</span>
                                  <span className="text-xs text-white/40">{prompt.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {command.useCases && (
                          <div className="space-y-4">
                            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/60">Operational Context</h4>
                            <div className="flex flex-wrap gap-2">
                              {command.useCases.map((useCase, idx) => (
                                <span key={idx} className="px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-black text-emerald-400/80 uppercase tracking-widest flex items-center space-x-2">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>{useCase}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Examples & Output */}
                      <div className="space-y-8">
                        {command.examples && (
                          <div className="space-y-4">
                            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/60">Execution Examples</h4>
                            <div className="space-y-6">
                              {command.examples.map((example, idx) => (
                                <div key={idx} className="space-y-3">
                                  {example.description && (
                                    <p className="text-xs font-black text-white/70 flex items-center space-x-2 italic">
                                      <ChevronRight className="w-3 h-3 text-purple-500" />
                                      <span>{example.description}</span>
                                    </p>
                                  )}
                                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 font-mono text-xs relative group/ex overflow-hidden">
                                     <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/40" />
                                    <div className="flex items-center justify-between mb-3 text-white/20">
                                      <span className="font-bold tracking-widest text-[10px]">TERMINAL_STDOUT</span>
                                      <button
                                        onClick={() => copyToClipboard(example.command, `example-${command.id}-${idx}`)}
                                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <code className="text-white font-medium block pr-4">
                                      <span className="text-purple-500 mr-2">$</span>
                                      {example.command}
                                    </code>
                                    {example.output && (
                                      <div className="mt-4 p-4 rounded-xl bg-black/40 text-emerald-400/80 leading-relaxed border border-white/5 italic">
                                        {example.output}
                                      </div>
                                    )}
                                    {example.interaction && (
                                      <div className="mt-4 p-4 rounded-xl bg-black/40 text-cyan-400/80 leading-relaxed border border-white/5">
                                        {example.interaction}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {command.securityFeatures && (
                          <div className="space-y-4">
                            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/60 flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-emerald-400" />
                              <span>Hardened Layer</span>
                            </h4>
                            <ul className="grid grid-cols-1 gap-2">
                              {command.securityFeatures.map((feature, idx) => (
                                <li key={idx} className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  <span className="text-[11px] font-bold text-white/70">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Important Warnings */}
                    {command.importantNotes && (
                      <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-4">
                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-red-500 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>Critical Directives</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {command.importantNotes.map((note, idx) => (
                            <div key={idx} className="flex items-start space-x-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                              <p className="text-xs font-bold text-white/50 leading-relaxed">{note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Workflow Guide */}
        <div className="hero-glass-card p-10 border-l-8 border-cyan-500/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-40 h-40 text-cyan-500" />
          </div>
          
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8 flex items-center space-x-3">
            <Zap className="w-6 h-6 text-cyan-400" />
            <span>Operational Workflow</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {[
              { s: 'Authentication', d: 'envsync login', i: '01' },
              { s: 'Identification', d: 'envsync whoami', i: '02' },
              { s: 'Vault Extraction', d: 'envsync run ...', i: '03' },
              { s: 'Session Termination', d: 'envsync logout', i: '04' }
            ].map((step, i) => (
              <div key={i} className="space-y-3">
                <div className="text-[10px] font-black text-cyan-500/50 uppercase tracking-[0.5em]">{step.i}</div>
                <h4 className="text-white font-bold">{step.s}</h4>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <code className="text-[11px] font-mono text-cyan-400">{step.d}</code>
                </div>
                {i < 3 && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-white/10" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CLICommands;
