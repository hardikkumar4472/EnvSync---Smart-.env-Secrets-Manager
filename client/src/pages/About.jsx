import { Link } from 'react-router-dom';
import { Shield, Lock, Zap, FileText, ArrowRight, CheckCircle, Code, Database, Key, BookOpen, Moon, Sun } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useTheme } from '../contexts/ThemeContext';

const About = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [heroRef, heroVisible] = useScrollAnimation({ once: true });
  const [featuresRef, featuresVisible] = useScrollAnimation({ once: true });
  const [problemRef, problemVisible] = useScrollAnimation({ once: true });
  const [howItWorksRef, howItWorksVisible] = useScrollAnimation({ once: true });
  const [keyFeaturesRef, keyFeaturesVisible] = useScrollAnimation({ once: true });
  const [ctaRef, ctaVisible] = useScrollAnimation({ once: true });

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom, var(--color-bg-light) 0%, var(--color-bg-light) 100%)'}}>
      {/* Header */}
      <header className="shadow-sm border-b" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center gradient-primary">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{color: 'var(--color-text-primary)'}}>EnvSync</h1>
                <p className="text-xs" style={{color: 'var(--color-text-light)'}}>Secure Secret Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg transition-all"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(77, 179, 179, 0.1)' : 'rgba(22, 71, 106, 0.1)',
                  color: isDarkMode ? '#4DB3B3' : '#16476A'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <Link
                to="/app/documentation"
                className="px-6 py-2 border-2 rounded-lg transition-all font-medium flex items-center space-x-2"
                style={{borderColor: '#3B9797', color: '#3B9797'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3B9797';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#3B9797';
                }}
              >
                <BookOpen className="w-4 h-4" />
                <span>View Documentation</span>
              </Link>
              <Link
                to="/login"
                className="px-6 py-2 text-white rounded-lg transition-all font-medium gradient-primary"
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className={`max-w-7xl mx-auto px-6 py-20 ${heroVisible ? 'fade-in-up' : 'opacity-0'}`}>
        <div className="text-center mb-16">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 gradient-primary shadow-lg ${heroVisible ? 'scale-in delay-200' : 'opacity-0'}`}>
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{color: 'var(--color-text-primary)'}}>
            EnvSync
          </h1>
          <p className="text-2xl mb-6" style={{color: 'var(--color-secondary)'}}>
            Secure Runtime Secret Injection System
          </p>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{color: 'var(--color-text-secondary)'}}>
            Eliminate the security risks of .env files by providing runtime-only secret injection.
            Secrets are encrypted at rest, decrypted only in memory, and never written to disk.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/app/documentation"
              className="inline-flex items-center space-x-2 border-2 px-8 py-4 rounded-lg transition-all text-lg font-medium shadow-md"
              style={{backgroundColor: 'var(--color-bg-card)', borderColor: '#3B9797', color: '#3B9797'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3B9797';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-card)';
                e.currentTarget.style.color = '#3B9797';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <BookOpen className="w-5 h-5" />
              <span>View Documentation</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-white px-8 py-4 rounded-lg transition-all text-lg font-medium shadow-lg gradient-primary"
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div ref={featuresRef} className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 ${featuresVisible ? '' : 'opacity-0'}`}>
          <div className="rounded-xl shadow-md border p-6 transition-all hover:shadow-xl" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{backgroundColor: 'rgba(191, 9, 47, 0.1)'}}>
              <Lock className="w-6 h-6" style={{color: '#BF092F'}} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
              Military-Grade Encryption
            </h3>
            <p style={{color: 'var(--color-text-secondary)'}}>
              AES-256-GCM encryption ensures your secrets are protected at rest with industry-standard security.
            </p>
          </div>

          <div className="rounded-xl shadow-md border p-6 transition-all hover:shadow-xl" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{backgroundColor: 'rgba(59, 151, 151, 0.1)'}}>
              <Zap className="w-6 h-6" style={{color: '#3B9797'}} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
              Runtime-Only Decryption
            </h3>
            <p style={{color: 'var(--color-text-secondary)'}}>
              Secrets exist only in memory. They're never written to disk, eliminating the risk of accidental exposure.
            </p>
          </div>

          <div className="rounded-xl shadow-md border p-6 transition-all hover:shadow-xl" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{backgroundColor: 'rgba(22, 71, 106, 0.1)'}}>
              <FileText className="w-6 h-6" style={{color: '#16476A'}} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
              Complete Audit Trail
            </h3>
            <p style={{color: 'var(--color-text-secondary)'}}>
              Every action is logged for compliance. Perfect for SOC2, HIPAA, and other regulatory requirements.
            </p>
          </div>
        </div>

        {/* Problem & Solution */}
        <div ref={problemRef} className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 ${problemVisible ? '' : 'opacity-0'}`}>
          <div className={`rounded-xl p-8 border-2 ${problemVisible ? 'fade-in-left' : 'opacity-0'}`} style={{backgroundColor: 'rgba(191, 9, 47, 0.05)', borderColor: '#BF092F'}}>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--color-text-primary)'}}>The Problem</h2>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <span className="mt-1" style={{color: '#BF092F'}}>✗</span>
                <span style={{color: 'var(--color-text-secondary)'}}>.env files in plain text</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="mt-1" style={{color: '#BF092F'}}>✗</span>
                <span style={{color: 'var(--color-text-secondary)'}}>Secrets accidentally committed to Git</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="mt-1" style={{color: '#BF092F'}}>✗</span>
                <span style={{color: 'var(--color-text-secondary)'}}>Secrets shared via Slack/Email</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="mt-1" style={{color: '#BF092F'}}>✗</span>
                <span style={{color: 'var(--color-text-secondary)'}}>No audit trail of secret access</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="mt-1" style={{color: '#BF092F'}}>✗</span>
                <span style={{color: 'var(--color-text-secondary)'}}>Manual environment switching</span>
              </li>
            </ul>
          </div>

          <div className={`rounded-xl p-8 border-2 ${problemVisible ? 'fade-in-right' : 'opacity-0'}`} style={{backgroundColor: 'rgba(59, 151, 151, 0.05)', borderColor: '#3B9797'}}>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--color-text-primary)'}}>The Solution</h2>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#3B9797'}} />
                <span style={{color: 'var(--color-text-secondary)'}}>Encrypted secrets in MongoDB</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#3B9797'}} />
                <span style={{color: 'var(--color-text-secondary)'}}>Runtime-only decryption (in memory)</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#3B9797'}} />
                <span style={{color: 'var(--color-text-secondary)'}}>Zero plain text files</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#3B9797'}} />
                <span style={{color: 'var(--color-text-secondary)'}}>Complete audit trail</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#3B9797'}} />
                <span style={{color: 'var(--color-text-secondary)'}}>Easy environment switching</span>
              </li>
            </ul>
          </div>
        </div>

        {/* How It Works */}
        <div ref={howItWorksRef} className={`rounded-xl shadow-md border p-8 mb-20 ${howItWorksVisible ? 'fade-in-up' : 'opacity-0'}`} style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
          <h2 className="text-3xl font-bold mb-8 text-center" style={{color: 'var(--color-text-primary)'}}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 gradient-primary shadow-md">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>Create Project</h3>
              <p className="text-sm" style={{color: 'var(--color-text-light)'}}>
                Set up your application project in the admin dashboard
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md" style={{backgroundColor: '#3B9797'}}>
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>Add Secrets</h3>
              <p className="text-sm" style={{color: 'var(--color-text-light)'}}>
                Upload or paste your .env file. Secrets are encrypted automatically
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 gradient-secondary shadow-md">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>Use CLI</h3>
              <p className="text-sm" style={{color: 'var(--color-text-light)'}}>
                Run your app with envsync CLI. Secrets are injected at runtime
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 gradient-accent shadow-md">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>Monitor</h3>
              <p className="text-sm" style={{color: 'var(--color-text-light)'}}>
                View audit logs and track all secret access for compliance
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div ref={keyFeaturesRef} className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{color: 'var(--color-text-primary)'}}>
            Key Features
          </h2>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${keyFeaturesVisible ? '' : 'opacity-0'}`}>
            <div className="flex items-start space-x-4 p-4 rounded-lg transition-all hover:shadow-md" style={{backgroundColor: 'var(--color-bg-card)'}}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'rgba(22, 71, 106, 0.1)'}}>
                <Database className="w-5 h-5" style={{color: '#16476A'}} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{color: 'var(--color-text-primary)'}}>Multi-Environment Support</h3>
                <p className="text-sm" style={{color: 'var(--color-text-light)'}}>
                  Manage secrets for dev, staging, and production environments separately
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg transition-all hover:shadow-md" style={{backgroundColor: 'var(--color-bg-card)'}}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'rgba(59, 151, 151, 0.1)'}}>
                <Key className="w-5 h-5" style={{color: '#3B9797'}} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{color: 'var(--color-text-primary)'}}>Bulk Import</h3>
                <p className="text-sm" style={{color: 'var(--color-text-light)'}}>
                  Upload .env files or paste content to create multiple secrets at once
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg transition-all hover:shadow-md" style={{backgroundColor: 'var(--color-bg-card)'}}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'rgba(191, 9, 47, 0.1)'}}>
                <Code className="w-5 h-5" style={{color: '#BF092F'}} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{color: 'var(--color-text-primary)'}}>Simple CLI</h3>
                <p className="text-sm" style={{color: 'var(--color-text-light)'}}>
                  Easy-to-use command-line interface for developers
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg transition-all hover:shadow-md" style={{backgroundColor: 'var(--color-bg-card)'}}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'rgba(22, 71, 106, 0.1)'}}>
                <Shield className="w-5 h-5" style={{color: '#16476A'}} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{color: 'var(--color-text-primary)'}}>Role-Based Access</h3>
                <p className="text-sm" style={{color: 'var(--color-text-light)'}}>
                  Admin-only dashboard with complete control over secrets
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div ref={ctaRef} className={`rounded-2xl p-12 text-center text-white shadow-2xl gradient-secondary ${ctaVisible ? 'scale-in' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Secrets?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{color: '#E8EEF2'}}>
            Start managing your environment variables securely today. No more .env files in your repository.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-lg transition-all text-lg font-medium shadow-lg gradient-primary"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{backgroundColor: '#132440'}}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm" style={{color: '#A0AEC0'}}>
            Made with ❤️ for secure secret management | EnvSync © 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
