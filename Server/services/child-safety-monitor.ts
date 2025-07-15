
export class ChildSafetyMonitor {
  private suspiciousPatterns: RegExp[] = [];
  private reportedUsers: Set<string> = new Set();
  private activeConnections: Map<string, { timestamp: number; warnings: number }> = new Map();
  private blockedContent: Set<string> = new Set();

  constructor() {
    this.initializeSafetyPatterns();
  }

  private initializeSafetyPatterns() {
    // Initialize patterns for detecting inappropriate content
    this.suspiciousPatterns = [
      /\b(?:meet\s+up|hook\s+up|come\s+over)\b/i,
      /\b(?:age|old\s+are\s+you|how\s+old)\b/i,
      /\b(?:location|address|where\s+do\s+you\s+live)\b/i,
      /\b(?:phone|number|contact)\b/i,
      /\b(?:personal|private|secret)\b/i,
      /\b(?:nude|naked|undressed)\b/i,
      /\b(?:sexy|hot|beautiful)\b/i,
      // Add more patterns as needed
    ];

    // Initialize blocked content database
    this.blockedContent.add('inappropriate-image-hash-1');
    this.blockedContent.add('inappropriate-image-hash-2');
  }

  public analyzeMessage(message: string, userId: string): {
    isAllowed: boolean;
    threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    action: 'allow' | 'warn' | 'block' | 'disconnect';
    reason?: string;
  } {
    console.log('🛡️ Child Safety: Analyzing message from user', userId);

    let threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
    let matchedPatterns: string[] = [];

    // Check against suspicious patterns
    this.suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(message)) {
        matchedPatterns.push(`pattern-${index}`);
        threatLevel = this.escalateThreatLevel(threatLevel, 'medium');
      }
    });

    // Check for rapid messaging (potential grooming behavior)
    const userConnection = this.activeConnections.get(userId);
    if (userConnection) {
      const timeSinceLastMessage = Date.now() - userConnection.timestamp;
      if (timeSinceLastMessage < 1000) { // Less than 1 second between messages
        threatLevel = this.escalateThreatLevel(threatLevel, 'low');
        userConnection.warnings++;
      }
      userConnection.timestamp = Date.now();
    } else {
      this.activeConnections.set(userId, { timestamp: Date.now(), warnings: 0 });
    }

    // Determine action based on threat level
    let action: 'allow' | 'warn' | 'block' | 'disconnect' = 'allow';
    let isAllowed = true;
    let reason: string | undefined;

    switch (threatLevel) {
      case 'low':
        action = 'warn';
        break;
      case 'medium':
        action = 'block';
        isAllowed = false;
        reason = 'Message contains potentially inappropriate content';
        break;
      case 'high':
      case 'critical':
        action = 'disconnect';
        isAllowed = false;
        reason = 'Serious safety violation detected';
        this.reportedUsers.add(userId);
        break;
    }

    // Check if user has been reported before
    if (this.reportedUsers.has(userId)) {
      action = 'disconnect';
      isAllowed = false;
      reason = 'User has been flagged for safety violations';
    }

    console.log('🛡️ Child Safety Analysis Result:', {
      userId,
      threatLevel,
      action,
      isAllowed,
      matchedPatterns: matchedPatterns.length
    });

    return { isAllowed, threatLevel, action, reason };
  }

  private escalateThreatLevel(
    current: 'none' | 'low' | 'medium' | 'high' | 'critical',
    new_level: 'none' | 'low' | 'medium' | 'high' | 'critical'
  ): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    const levels = ['none', 'low', 'medium', 'high', 'critical'];
    const currentIndex = levels.indexOf(current);
    const newIndex = levels.indexOf(new_level);
    return levels[Math.max(currentIndex, newIndex)] as any;
  }

  public reportUser(userId: string, reason: string): void {
    console.log('🚨 Child Safety: User reported', { userId, reason });
    this.reportedUsers.add(userId);
    // In a real implementation, this would log to a secure database
  }

  public disconnectUser(userId: string): void {
    console.log('🚨 Child Safety: Disconnecting user', userId);
    this.activeConnections.delete(userId);
    // Force disconnect the user's WebSocket connection
  }

  public getConnectionWarnings(userId: string): number {
    return this.activeConnections.get(userId)?.warnings || 0;
  }

  public isUserBlocked(userId: string): boolean {
    return this.reportedUsers.has(userId);
  }
}
