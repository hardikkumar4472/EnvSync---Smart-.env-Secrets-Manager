import { useState } from 'react';
import {
  Terminal,
  Copy,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--color-text-primary)'}}>
          CLI Commands Reference
        </h1>
        <p style={{color: 'var(--color-text-light)'}}>
          Complete guide to all EnvSync CLI commands with examples and usage
        </p>
      </div>

      {/* Commands List */}
      <div className="space-y-4">
        {commands.map((command) => {
          const isExpanded = expandedCommand === command.id;
          return (
            <div
              key={command.id}
              className="rounded-xl shadow-md border overflow-hidden"
              style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}
            >
              {/* Command Header */}
              <button
                onClick={() =>
                  setExpandedCommand(isExpanded ? null : command.id)
                }
                className="w-full flex items-center justify-between p-6 transition-colors text-left"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgba(59, 151, 151, 0.1)'}}>
                    <Terminal className="w-5 h-5" style={{color: '#3B9797'}} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-mono" style={{color: 'var(--color-text-primary)'}}>
                      {command.name}
                    </h3>
                    <p className="text-sm mt-1" style={{color: 'var(--color-text-secondary)'}}>
                      {command.description}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" style={{color: 'var(--color-text-light)'}} />
                ) : (
                  <ChevronRight className="w-5 h-5" style={{color: 'var(--color-text-light)'}} />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-6 space-y-6" style={{borderTop: '1px solid #E2E8F0'}}>
                  {/* Syntax */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center" style={{color: 'var(--color-text-primary)'}}>
                      <Info className="w-4 h-4 mr-2" />
                      Syntax
                    </h4>
                    <div className="p-4 rounded-lg font-mono text-sm overflow-x-auto" style={{backgroundColor: '#132440', color: '#3B9797'}}>
                      <div className="flex items-center justify-between">
                        <code>{command.syntax}</code>
                        <button
                          onClick={() =>
                            copyToClipboard(command.syntax, `syntax-${command.id}`)
                          }
                          className="ml-4 transition-colors"
                          style={{color: 'var(--color-text-light)'}}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#718096'}
                        >
                          {copiedText === `syntax-${command.id}` ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  {command.options && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Options
                      </h4>
                      <p className="text-sm text-gray-700">{command.options}</p>
                    </div>
                  )}

                  {/* Required Options */}
                  {command.requiredOptions && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Required Options
                      </h4>
                      <div className="space-y-3">
                        {command.requiredOptions.map((option, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg p-4 border"
                            style={{backgroundColor: 'var(--color-bg-light)', borderColor: 'var(--color-text-light)'}}
                          >
                            <code className="text-sm font-mono font-semibold" style={{color: '#3B9797'}}>
                              {option.name}
                            </code>
                            <p className="text-sm text-gray-700 mt-1">
                              {option.description}
                            </p>
                            {option.format && (
                              <p className="text-xs text-gray-500 mt-1">
                                Format: {option.format}
                              </p>
                            )}
                            {option.validValues && (
                              <p className="text-xs text-gray-500 mt-1">
                                Valid values:{' '}
                                {option.validValues.map((v) => (
                                  <code
                                    key={v}
                                    className="bg-white px-1 py-0.5 rounded"
                                  >
                                    {v}
                                  </code>
                                ))}
                              </p>
                            )}
                            {option.example && (
                              <p className="text-xs text-gray-500 mt-1">
                                Example: <code>{option.example}</code>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prompts */}
                  {command.prompts && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Interactive Prompts
                      </h4>
                      <div className="space-y-2">
                        {command.prompts.map((prompt, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <span className="text-sm font-medium text-gray-700">
                              {idx + 1}. {prompt.label}:
                            </span>
                            <span className="text-sm text-gray-600">
                              {prompt.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Examples */}
                  {command.examples && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Examples
                      </h4>
                      <div className="space-y-4">
                        {command.examples.map((example, idx) => (
                          <div key={idx}>
                            {example.description && (
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                {example.description}
                              </p>
                            )}
                            <div className="p-4 rounded-lg font-mono text-sm overflow-x-auto" style={{backgroundColor: '#132440', color: '#3B9797'}}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400">$</span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      example.command,
                                      `example-${command.id}-${idx}`
                                    )
                                  }
                                  className="transition-colors"
                                  style={{color: 'var(--color-text-light)'}}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#718096'}
                                >
                                  {copiedText ===
                                  `example-${command.id}-${idx}` ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              <code>{example.command}</code>
                            </div>
                            {example.output && (
                              <div className="mt-2 border rounded-lg p-4 font-mono text-sm whitespace-pre-wrap" style={{backgroundColor: '#F8F9FA', borderColor: '#E2E8F0', color: '#4A5568'}}>
                                {example.output}
                              </div>
                            )}
                            {example.interaction && (
                              <div className="mt-2 border rounded-lg p-4 font-mono text-sm whitespace-pre-wrap" style={{backgroundColor: '#F8F9FA', borderColor: '#E2E8F0', color: '#4A5568'}}>
                                {example.interaction}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Output */}
                  {command.output && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Expected Output
                      </h4>
                      <div className="border rounded-lg p-4 font-mono text-sm whitespace-pre-wrap" style={{backgroundColor: '#F8F9FA', borderColor: '#E2E8F0', color: '#4A5568'}}>
                        {command.output}
                      </div>
                    </div>
                  )}

                  {/* Use Cases */}
                  {command.useCases && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Use Cases
                      </h4>
                      <ul className="space-y-2">
                        {command.useCases.map((useCase, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{color: '#3B9797'}} />
                            <span className="text-sm text-gray-700">
                              {useCase}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Roles */}
                  {command.roles && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        User Roles
                      </h4>
                      <div className="space-y-2">
                        {command.roles.map((role, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg p-3 border"
                            style={{backgroundColor: 'var(--color-bg-light)', borderColor: 'var(--color-text-light)'}}
                          >
                            <span className="text-sm font-semibold text-gray-900 capitalize">
                              {role.role}
                            </span>
                            <span className="text-sm text-gray-600">
                              {' '}
                              - {role.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Security Features */}
                  {command.securityFeatures && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-green-600" />
                        Security Features
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {command.securityFeatures.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-2 rounded-lg p-2 border"
                            style={{backgroundColor: 'rgba(59, 151, 151, 0.1)', borderColor: '#3B9797'}}
                          >
                            <CheckCircle className="w-4 h-4 flex-shrink-0" style={{color: '#3B9797'}} />
                            <span className="text-sm text-gray-700">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Access Control */}
                  {command.accessControl && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Access Control
                      </h4>
                      <div className="rounded-lg border overflow-hidden" style={{backgroundColor: 'var(--color-bg-light)', borderColor: 'var(--color-text-light)'}}>
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                                User Role
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                                Can Use
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {command.accessControl.map((item, idx) => (
                              <tr key={idx} className="border-t border-gray-200">
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {item.role}
                                </td>
                                <td className="px-4 py-2">
                                  {item.canUse ? (
                                    <span className="text-green-600 font-medium">
                                      ✓ Yes
                                    </span>
                                  ) : (
                                    <span className="text-red-600 font-medium">
                                      ✗ No
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Important Notes */}
                  {command.importantNotes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                        Important Notes
                      </h4>
                      <div className="space-y-2">
                        {command.importantNotes.map((note, idx) => (
                          <div
                            key={idx}
                            className="border rounded-lg p-3"
                            style={{backgroundColor: 'rgba(191, 9, 47, 0.05)', borderColor: '#BF092F'}}
                          >
                            <p className="text-sm" style={{color: '#BF092F'}}>
                              ⚠️ {note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {command.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Notes
                      </h4>
                      <ul className="space-y-2">
                        {command.notes.map((note, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-700">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Reference */}
      <div className="rounded-xl p-6 border-2" style={{background: 'linear-gradient(135deg, rgba(59, 151, 151, 0.05) 0%, rgba(59, 151, 151, 0.1) 100%)', borderColor: '#3B9797'}}>
        <h2 className="text-xl font-semibold mb-4" style={{color: 'var(--color-text-primary)'}}>
          Quick Reference
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg p-4" style={{backgroundColor: 'var(--color-bg-card)'}}>
            <h3 className="font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
              Most Common Commands
            </h3>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Login</span>
                <code style={{color: '#3B9797'}}>envsync login</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Check status</span>
                <code style={{color: '#3B9797'}}>envsync whoami</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Run app</span>
                <code className="text-blue-600">
                  envsync run --project ID --env dev npm start
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Logout</span>
                <code style={{color: '#3B9797'}}>envsync logout</code>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-4" style={{backgroundColor: 'var(--color-bg-card)'}}>
            <h3 className="font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
              Typical Workflow
            </h3>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>First time setup: <code style={{color: '#3B9797'}}>envsync login</code></li>
              <li>Verify login: <code style={{color: '#3B9797'}}>envsync whoami</code></li>
              <li>Use secrets: <code style={{color: '#3B9797'}}>envsync run --project ID --env dev npm start</code></li>
              <li>When done: <code style={{color: '#3B9797'}}>envsync logout</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CLICommands;

