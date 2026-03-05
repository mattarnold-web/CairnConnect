import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { clsx } from 'clsx';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  className,
}: SearchBarProps) {
  return (
    <View
      className={clsx(
        'flex-row items-center bg-cairn-card border border-cairn-border rounded-xl px-3 h-11',
        className,
      )}
    >
      <Search size={16} color="#64748b" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#475569"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#f1f5f9',
  },
});
