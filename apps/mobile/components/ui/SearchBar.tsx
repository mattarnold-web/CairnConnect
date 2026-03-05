import { View, TextInput } from 'react-native';
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
        className="flex-1 ml-2 text-sm text-slate-100"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
