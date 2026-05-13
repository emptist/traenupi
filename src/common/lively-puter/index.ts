/**
 * Lively-Puter Bridge - Integration with TraeNuPI
 * 
 * This module provides a unified interface to Lively4 and Puter services,
 * integrated into TraeNuPI's architecture.
 */

import type { 
  FileInfo, 
  ChatMessage, 
  ChatOptions, 
  ChatResponse, 
  User, 
  AuthState 
} from './types.js';

export type IntegrationMode = 'lively-first' | 'puter-first' | 'hybrid';

export interface LivelyPuterConfig {
  mode?: IntegrationMode;
  puterSDKUrl?: string;
  livelyBaseUrl?: string;
  enableAuth?: boolean;
  enableAI?: boolean;
  enableStorage?: boolean;
  enableDatabase?: boolean;
}

/**
 * LivelyPuterBridge - Main integration class
 */
export class LivelyPuterBridge {
  private mode: IntegrationMode;
  private config: LivelyPuterConfig;
  private puter: any = null;
  private lively: any = null;
  
  public fs: any;
  public ai: any;
  public db: any;
  public auth: any;

  constructor(config: LivelyPuterConfig = {}) {
    this.mode = config.mode || 'hybrid';
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.mode = this.detectMode();
    await this.loadSDKs();
    await this.initializeAdapters();
    
    console.log(`[LivelyPuter] Initialized in ${this.mode} mode`);
  }

  private detectMode(): IntegrationMode {
    if (typeof window !== 'undefined' && window.location.hostname.includes('puter.com')) {
      return 'puter-first';
    }
    
    if (typeof window !== 'undefined' && (window as any).lively) {
      return 'lively-first';
    }
    
    return 'hybrid';
  }

  private async loadSDKs(): Promise<void> {
    if (this.mode === 'puter-first' || this.mode === 'hybrid') {
      await this.loadPuterSDK();
    }
    
    if (typeof window !== 'undefined') {
      this.lively = (window as any).lively;
    }
  }

  private async loadPuterSDK(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    if ((window as any).puter) {
      this.puter = (window as any).puter;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.config.puterSDKUrl || 'https://js.puter.com/v2/';
      script.onload = () => {
        this.puter = (window as any).puter;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private async initializeAdapters(): Promise<void> {
    const { 
      PuterFileSystemAdapter, 
      PuterAIAdapter, 
      PuterDatabaseAdapter, 
      PuterAuthAdapter 
    } = await import('./adapters/puter/index.js');
    
    const { 
      LivelyFileSystemAdapter, 
      LivelyAIAdapter, 
      LivelyDatabaseAdapter, 
      LivelyAuthAdapter 
    } = await import('./adapters/lively/index.js');
    
    const { 
      HybridFileSystemAdapter, 
      HybridDatabaseAdapter 
    } = await import('./adapters/hybrid/index.js');

    switch (this.mode) {
      case 'lively-first':
        this.fs = new LivelyFileSystemAdapter(this.lively);
        this.ai = new LivelyAIAdapter(this.lively);
        this.db = new LivelyDatabaseAdapter(this.lively);
        this.auth = new LivelyAuthAdapter(this.lively);
        break;
        
      case 'puter-first':
        this.fs = new PuterFileSystemAdapter(this.puter);
        this.ai = new PuterAIAdapter(this.puter);
        this.db = new PuterDatabaseAdapter(this.puter);
        this.auth = new PuterAuthAdapter(this.puter);
        break;
        
      case 'hybrid':
        this.fs = new HybridFileSystemAdapter(this.lively, this.puter);
        this.ai = new PuterAIAdapter(this.puter);
        this.db = new HybridDatabaseAdapter(
          new LivelyDatabaseAdapter(this.lively),
          new PuterDatabaseAdapter(this.puter)
        );
        this.auth = new PuterAuthAdapter(this.puter);
        break;
    }
  }

  getMode(): IntegrationMode {
    return this.mode;
  }
}

// Export types
export * from './types.js';
