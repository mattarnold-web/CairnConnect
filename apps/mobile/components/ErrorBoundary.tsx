import { Component, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView
          style={{ flex: 1, backgroundColor: '#0B1A2B' }}
          edges={['top', 'bottom']}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 32,
            }}
          >
            {/* Icon */}
            <View
              style={{
                height: 64,
                width: 64,
                borderRadius: 32,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <AlertTriangle size={28} color="#ef4444" />
            </View>

            {/* Title */}
            <Text
              style={{
                color: '#f1f5f9',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Something went wrong
            </Text>

            {/* Description */}
            <Text
              style={{
                color: '#64748b',
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 20,
              }}
            >
              An unexpected error occurred. Please try again. If the problem persists, restart the app.
            </Text>

            {/* Error details (collapsed by default in prod, shown in dev) */}
            {__DEV__ && this.state.error && (
              <ScrollView
                style={{
                  maxHeight: 120,
                  width: '100%',
                  backgroundColor: '#122338',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#1E3A5F',
                  padding: 12,
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    color: '#ef4444',
                    fontSize: 11,
                    fontFamily: 'monospace',
                  }}
                >
                  {this.state.error.message}
                </Text>
              </ScrollView>
            )}

            {/* Retry button */}
            <Pressable
              onPress={this.handleRetry}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#10B981',
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 12,
                width: '100%',
              }}
            >
              <RefreshCw size={16} color="white" />
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 15,
                  marginLeft: 8,
                }}
              >
                Try Again
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
