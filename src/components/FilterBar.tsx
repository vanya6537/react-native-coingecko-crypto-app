import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
} from 'react-native';
import type { ListFilters } from '../types/index';

interface FilterBarProps {
  filters: ListFilters;
  onFilterChange: (filters: Partial<ListFilters>) => void;
  isSorted?: boolean;
  onSortToggle?: () => void;
}

type SortOption = 'price' | 'change24h' | 'market_cap';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Price', value: 'price' },
  { label: 'Change 24h', value: 'change24h' },
  { label: 'Market Cap', value: 'market_cap' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ 
  filters, 
  onFilterChange,
  isSorted = false,
  onSortToggle,
}) => {
  const [sortPickerVisible, setSortPickerVisible] = useState(false);

  const handleSearchChange = useCallback((text: string) => {
    onFilterChange({ search: text });
  }, [onFilterChange]);

  const handleSortChange = useCallback((sortBy: SortOption) => {
    setSortPickerVisible(false);
    onFilterChange({ sortBy });
    // Auto-enable sorting when changing sort option
    if (!isSorted && onSortToggle) {
      onSortToggle();
    }
  }, [onFilterChange, isSorted, onSortToggle]);

  const handleToggleSortOrder = useCallback(() => {
    const newOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
    onFilterChange({ sortOrder: newOrder });
  }, [filters.sortOrder, onFilterChange]);

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === filters.sortBy)?.label || 'Sort';
  const sortOrderSymbol = filters.sortOrder === 'asc' ? '↑' : '↓';

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tokens..."
          placeholderTextColor="#999"
          value={filters.search}
          onChangeText={handleSearchChange}
        />
      </View>

      {/* Filter/Sort Controls */}
      <View style={styles.controlsRow}>
        {/* Sort Mode Toggle */}
        <TouchableOpacity
          style={[
            styles.sortModeButton,
            isSorted && styles.sortModeButtonActive,
          ]}
          onPress={onSortToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.sortModeText}>
            {isSorted ? '✓ Sorted' : 'Browse'}
          </Text>
        </TouchableOpacity>

        {/* Sort Picker Button (only available when sorted) */}
        <TouchableOpacity
          style={[
            styles.sortButton,
            !isSorted && styles.sortButtonDisabled,
          ]}
          onPress={() => setSortPickerVisible(true)}
          activeOpacity={0.7}
          disabled={!isSorted}
        >
          <Text style={styles.sortButtonText}>{currentSortLabel}</Text>
          <Text style={styles.sortButtonIcon}>⚙</Text>
        </TouchableOpacity>

        {/* Sort Order Toggle (only available when sorted) */}
        <TouchableOpacity
          style={[
            styles.sortOrderButton,
            !isSorted && styles.sortOrderButtonDisabled,
          ]}
          onPress={handleToggleSortOrder}
          activeOpacity={0.7}
          disabled={!isSorted}
        >
          <Text style={styles.sortOrderSymbol}>{sortOrderSymbol}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Picker Modal */}
      <Modal
        transparent={true}
        visible={sortPickerVisible}
        onRequestClose={() => setSortPickerVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    filters.sortBy === option.value && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSortChange(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      filters.sortBy === option.value && styles.modalOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {filters.sortBy === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Modal Close Button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSortPickerVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#000',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  sortModeButton: {
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortModeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sortModeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  sortButtonIcon: {
    fontSize: 16,
    color: '#fff',
  },
  sortOrderButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortOrderButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  sortOrderSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  modalOption: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  modalOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: '#1976D2',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  modalCloseButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
